import { useState, useRef, useEffect, useCallback } from 'react';

interface Bot {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
}

interface Source {
  documentId: string;
  filename: string;
  content: string;
  score: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

interface Document {
  id: string;
  filename: string;
  status: string;
  chunkCount: number;
}

function App() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingSources, setStreamingSources] = useState<Source[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showSources, setShowSources] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [botsLoading, setBotsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Load bots on mount
  useEffect(() => {
    loadBots();
  }, []);

  // Load documents when bot changes
  useEffect(() => {
    if (selectedBot) {
      loadDocuments();
      // Reset conversation when switching bots
      setMessages([]);
      setConversationId(null);
    }
  }, [selectedBot]);

  const loadBots = async () => {
    setBotsLoading(true);
    try {
      const response = await fetch('/api/bots');
      const data = await response.json();
      const botList = data.bots || [];
      setBots(botList);
      // Auto-select first bot if available
      if (botList.length > 0 && !selectedBot) {
        setSelectedBot(botList[0]);
      }
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setBotsLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!selectedBot) return;
    try {
      const response = await fetch(`/api/bots/${selectedBot.id}/documents`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBot) return;

    setUploading(true);
    try {
      // 1. Get signed upload URL
      const urlResponse = await fetch(`/api/bots/${selectedBot.id}/documents/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'text/plain',
        }),
      });

      if (!urlResponse.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, documentId } = await urlResponse.json();

      // 2. Upload file directly to signed URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'text/plain' },
        body: file,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload file');

      // 3. Trigger processing
      const processResponse = await fetch(`/api/documents/${documentId}/process`, {
        method: 'POST',
      });

      if (!processResponse.ok) throw new Error('Failed to process document');

      // 4. Reload documents
      await loadDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      await loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const sendMessageStreaming = async (userMessage: string) => {
    if (!selectedBot) throw new Error('No bot selected');

    setStreamingContent('');
    setStreamingSources([]);

    const response = await fetch(`/api/bots/${selectedBot.id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        conversationId,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let sources: Source[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          continue;
        }
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.sources) {
              sources = data.sources;
              setStreamingSources(data.sources);
            } else if (data.text) {
              fullContent += data.text;
              setStreamingContent(fullContent);
            } else if (data.conversationId) {
              setConversationId(data.conversationId);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    return { content: fullContent, sources };
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !selectedBot) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { content, sources } = await sendMessageStreaming(userMessage);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content, sources: sources.length > 0 ? sources : undefined },
      ]);
      setStreamingContent('');
      setStreamingSources([]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
      setStreamingContent('');
      setStreamingSources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleSources = (index: number) => {
    setShowSources(showSources === index ? null : index);
  };

  const handleBotChange = (botId: string) => {
    const bot = bots.find((b) => b.id === botId);
    if (bot) {
      setSelectedBot(bot);
    }
  };

  // Show bot selector if loading or no bots
  if (botsLoading) {
    return (
      <div className="chat-container">
        <div className="empty-state">Loading bots...</div>
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h1>RAG Platform Chat</h1>
        </div>
        <div className="empty-state">
          <p>No bots available.</p>
          <p>Create a bot in the Admin dashboard to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <h1>RAG Platform Chat</h1>
          <select
            className="bot-selector"
            value={selectedBot?.id || ''}
            onChange={(e) => handleBotChange(e.target.value)}
          >
            {bots.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.name}
              </option>
            ))}
          </select>
        </div>
        <button className="docs-toggle" onClick={() => setShowDocs(!showDocs)}>
          {showDocs ? 'Hide' : 'Show'} Documents ({documents.filter((d) => d.status === 'ready').length})
        </button>
      </div>

      {selectedBot && (
        <div className="bot-description-bar">
          {selectedBot.description || 'No description'}
        </div>
      )}

      {showDocs && (
        <div className="documents-panel">
          <div className="documents-header">
            <h3>Knowledge Base</h3>
            <label className="upload-button">
              {uploading ? 'Uploading...' : 'Upload Document'}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.html"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          {documents.length === 0 ? (
            <p className="no-docs">No documents uploaded yet.</p>
          ) : (
            <ul className="documents-list">
              {documents.map((doc) => (
                <li key={doc.id} className="document-item">
                  <span className="doc-name">{doc.filename}</span>
                  <span className={`doc-status ${doc.status}`}>{doc.status}</span>
                  {doc.status === 'ready' && <span className="doc-chunks">{doc.chunkCount} chunks</span>}
                  <button className="doc-delete" onClick={() => handleDeleteDocument(doc.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 && !streamingContent && (
          <div className="empty-state">Start a conversation by typing a message below.</div>
        )}

        {messages.map((message, index) => (
          <div key={index} className="message-wrapper">
            <div className={`message ${message.role}`}>{message.content}</div>
            {message.sources && message.sources.length > 0 && (
              <div className="sources-container">
                <button className="sources-toggle" onClick={() => toggleSources(index)}>
                  {showSources === index ? 'Hide' : 'Show'} {message.sources.length} source
                  {message.sources.length > 1 ? 's' : ''}
                </button>
                {showSources === index && (
                  <div className="sources-list">
                    {message.sources.map((source, i) => (
                      <div key={i} className="source-item">
                        <div className="source-header">
                          <span className="source-filename">{source.filename}</span>
                          <span className="source-score">{Math.round(source.score * 100)}% match</span>
                        </div>
                        <div className="source-content">{source.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {streamingContent && (
          <div className="message-wrapper">
            <div className="message assistant streaming">
              {streamingContent}
              <span className="cursor">|</span>
            </div>
            {streamingSources.length > 0 && (
              <div className="sources-indicator">
                Using {streamingSources.length} document{streamingSources.length > 1 ? 's' : ''} as context
              </div>
            )}
          </div>
        )}

        {loading && !streamingContent && (
          <div className="message assistant loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={selectedBot ? `Ask ${selectedBot.name}...` : 'Select a bot to start'}
          disabled={loading || !selectedBot}
        />
        <button className="send-button" onClick={sendMessage} disabled={loading || !input.trim() || !selectedBot}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
