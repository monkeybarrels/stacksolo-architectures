/**
 * RAG Platform Chat Widget
 *
 * Drop-in chat widget that can be embedded on any website.
 *
 * Usage:
 * ```html
 * <script>
 *   window.RAGWidgetConfig = {
 *     botId: 'your-bot-id',
 *     apiUrl: 'https://your-api.example.com',
 *     position: 'bottom-right',
 *     theme: 'light',
 *     title: 'Chat with us',
 *   };
 * </script>
 * <script src="https://your-domain.com/widget.js"></script>
 * ```
 */

interface RAGWidgetConfig {
  botId: string;
  apiUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
  title?: string;
  primaryColor?: string;
  welcomeMessage?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

declare global {
  interface Window {
    RAGWidgetConfig?: RAGWidgetConfig;
  }
}

(function () {
  // Get configuration
  const config = window.RAGWidgetConfig;
  if (!config || !config.botId || !config.apiUrl) {
    console.error('RAG Widget: Missing required config (botId, apiUrl)');
    return;
  }

  const {
    botId,
    apiUrl,
    position = 'bottom-right',
    theme = 'light',
    title = 'Chat',
    primaryColor = '#4361ee',
    welcomeMessage = 'Hi! How can I help you today?',
  } = config;

  // State
  let isOpen = false;
  let messages: Message[] = [];
  let conversationId: string | null = null;
  let isLoading = false;

  // Create styles
  const styles = document.createElement('style');
  styles.textContent = `
    .rag-widget-container {
      position: fixed;
      ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
      bottom: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .rag-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .rag-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .rag-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .rag-widget-window {
      position: absolute;
      ${position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
      bottom: 70px;
      width: 380px;
      height: 520px;
      background: ${theme === 'dark' ? '#1a1a2e' : '#ffffff'};
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .rag-widget-window.open {
      display: flex;
    }

    .rag-widget-header {
      padding: 16px 20px;
      background: ${primaryColor};
      color: white;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .rag-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rag-widget-close:hover {
      opacity: 0.8;
    }

    .rag-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rag-widget-message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .rag-widget-message.user {
      align-self: flex-end;
      background: ${primaryColor};
      color: white;
    }

    .rag-widget-message.assistant {
      align-self: flex-start;
      background: ${theme === 'dark' ? '#2d2d44' : '#f0f0f0'};
      color: ${theme === 'dark' ? '#ffffff' : '#333333'};
    }

    .rag-widget-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: ${theme === 'dark' ? '#2d2d44' : '#f0f0f0'};
      border-radius: 12px;
      align-self: flex-start;
    }

    .rag-widget-typing span {
      width: 8px;
      height: 8px;
      background: ${theme === 'dark' ? '#666' : '#999'};
      border-radius: 50%;
      animation: rag-bounce 1.4s infinite ease-in-out both;
    }

    .rag-widget-typing span:nth-child(1) { animation-delay: -0.32s; }
    .rag-widget-typing span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes rag-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .rag-widget-input-area {
      padding: 12px 16px;
      border-top: 1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'};
      display: flex;
      gap: 8px;
    }

    .rag-widget-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid ${theme === 'dark' ? '#444' : '#e0e0e0'};
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      background: ${theme === 'dark' ? '#2d2d44' : '#ffffff'};
      color: ${theme === 'dark' ? '#ffffff' : '#333333'};
    }

    .rag-widget-input:focus {
      border-color: ${primaryColor};
    }

    .rag-widget-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    .rag-widget-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .rag-widget-send svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    @media (max-width: 480px) {
      .rag-widget-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
      }
    }
  `;
  document.head.appendChild(styles);

  // Create widget HTML
  const container = document.createElement('div');
  container.className = 'rag-widget-container';
  container.innerHTML = `
    <div class="rag-widget-window" id="rag-widget-window">
      <div class="rag-widget-header">
        <span>${title}</span>
        <button class="rag-widget-close" id="rag-widget-close">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="rag-widget-messages" id="rag-widget-messages"></div>
      <div class="rag-widget-input-area">
        <input type="text" class="rag-widget-input" id="rag-widget-input" placeholder="Type a message...">
        <button class="rag-widget-send" id="rag-widget-send">
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
    <button class="rag-widget-button" id="rag-widget-button">
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    </button>
  `;
  document.body.appendChild(container);

  // Get elements
  const widgetButton = document.getElementById('rag-widget-button')!;
  const widgetWindow = document.getElementById('rag-widget-window')!;
  const closeButton = document.getElementById('rag-widget-close')!;
  const messagesContainer = document.getElementById('rag-widget-messages')!;
  const inputField = document.getElementById('rag-widget-input') as HTMLInputElement;
  const sendButton = document.getElementById('rag-widget-send') as HTMLButtonElement;

  // Toggle widget
  function toggleWidget() {
    isOpen = !isOpen;
    widgetWindow.classList.toggle('open', isOpen);
    if (isOpen && messages.length === 0) {
      // Add welcome message
      addMessage('assistant', welcomeMessage);
    }
  }

  // Add message to UI
  function addMessage(role: 'user' | 'assistant', content: string) {
    messages.push({ role, content });
    const msgEl = document.createElement('div');
    msgEl.className = `rag-widget-message ${role}`;
    msgEl.textContent = content;
    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'rag-widget-typing';
    typing.id = 'rag-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typing = document.getElementById('rag-typing');
    if (typing) typing.remove();
  }

  // Send message
  async function sendMessage() {
    const message = inputField.value.trim();
    if (!message || isLoading) return;

    inputField.value = '';
    addMessage('user', message);
    isLoading = true;
    sendButton.disabled = true;
    showTyping();

    try {
      const response = await fetch(`${apiUrl}/api/bots/${botId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      conversationId = data.conversationId;
      hideTyping();
      addMessage('assistant', data.response);
    } catch (error) {
      hideTyping();
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
      console.error('RAG Widget error:', error);
    } finally {
      isLoading = false;
      sendButton.disabled = false;
    }
  }

  // Event listeners
  widgetButton.addEventListener('click', toggleWidget);
  closeButton.addEventListener('click', toggleWidget);
  sendButton.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
