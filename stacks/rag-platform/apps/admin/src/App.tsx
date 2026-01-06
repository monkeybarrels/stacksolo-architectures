import { useState, useEffect, useRef } from 'react';

interface Bot {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  botId: string;
  filename: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  chunkCount: number;
  size: number;
  createdAt: string;
}

type View = 'list' | 'create' | 'edit' | 'documents';

function App() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [view, setView] = useState<View>('list');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    isPublic: false,
  });

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bots');
      const data = await response.json();
      setBots(data.bots || []);
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (botId: string) => {
    try {
      const response = await fetch(`/api/bots/${botId}/documents`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to create bot');
      await loadBots();
      setView('list');
      resetForm();
    } catch (error) {
      console.error('Failed to create bot:', error);
      alert('Failed to create bot');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBot) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/bots/${selectedBot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update bot');
      await loadBots();
      setView('list');
      setSelectedBot(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update bot:', error);
      alert('Failed to update bot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBot = async (bot: Bot) => {
    if (!confirm(`Delete bot "${bot.name}" and all its documents?`)) return;
    try {
      const response = await fetch(`/api/bots/${bot.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete bot');
      await loadBots();
    } catch (error) {
      console.error('Failed to delete bot:', error);
      alert('Failed to delete bot');
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
      await loadDocuments(selectedBot.id);
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
    if (!confirm('Delete this document?')) return;
    try {
      await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (selectedBot) {
        await loadDocuments(selectedBot.id);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      systemPrompt: '',
      isPublic: false,
    });
  };

  const openEditBot = (bot: Bot) => {
    setSelectedBot(bot);
    setFormData({
      name: bot.name,
      description: bot.description,
      systemPrompt: bot.systemPrompt,
      isPublic: bot.isPublic,
    });
    setView('edit');
  };

  const openDocuments = (bot: Bot) => {
    setSelectedBot(bot);
    loadDocuments(bot.id);
    setView('documents');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>RAG Platform Admin</h1>
        {view !== 'list' && (
          <button className="btn btn-secondary" onClick={() => { setView('list'); setSelectedBot(null); resetForm(); }}>
            Back to Bots
          </button>
        )}
      </header>

      <main className="admin-main">
        {view === 'list' && (
          <div className="bots-view">
            <div className="section-header">
              <h2>Bots</h2>
              <button className="btn btn-primary" onClick={() => setView('create')}>
                Create Bot
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : bots.length === 0 ? (
              <div className="empty-state">
                <p>No bots created yet.</p>
                <p>Create your first bot to get started.</p>
              </div>
            ) : (
              <div className="bots-grid">
                {bots.map((bot) => (
                  <div key={bot.id} className="bot-card">
                    <div className="bot-card-header">
                      <h3>{bot.name}</h3>
                      {bot.isPublic && <span className="badge badge-public">Public</span>}
                    </div>
                    <p className="bot-description">{bot.description || 'No description'}</p>
                    <div className="bot-meta">
                      <span>Created {formatDate(bot.createdAt)}</span>
                    </div>
                    <div className="bot-actions">
                      <button className="btn btn-small" onClick={() => openDocuments(bot)}>
                        Documents
                      </button>
                      <button className="btn btn-small" onClick={() => openEditBot(bot)}>
                        Edit
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDeleteBot(bot)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'create' && (
          <div className="form-view">
            <h2>Create Bot</h2>
            <form onSubmit={handleCreateBot}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Assistant"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A helpful assistant for..."
                />
              </div>
              <div className="form-group">
                <label>System Prompt</label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  placeholder="You are a helpful assistant that..."
                  rows={6}
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                  Public bot (accessible without authentication)
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setView('list'); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Bot'}
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'edit' && selectedBot && (
          <div className="form-view">
            <h2>Edit Bot</h2>
            <form onSubmit={handleUpdateBot}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>System Prompt</label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                  Public bot
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setView('list'); setSelectedBot(null); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'documents' && selectedBot && (
          <div className="documents-view">
            <div className="section-header">
              <h2>Documents for {selectedBot.name}</h2>
              <label className="btn btn-primary">
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
              <div className="empty-state">
                <p>No documents uploaded for this bot.</p>
                <p>Upload documents to build the knowledge base.</p>
              </div>
            ) : (
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Status</th>
                    <th>Chunks</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.filename}</td>
                      <td>
                        <span className={`status status-${doc.status}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td>{doc.status === 'ready' ? doc.chunkCount : '-'}</td>
                      <td>{doc.size ? formatBytes(doc.size) : '-'}</td>
                      <td>{formatDate(doc.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
