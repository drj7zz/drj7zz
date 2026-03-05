'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, FolderGit2, Link as LinkIcon, Database,
  LogOut, Plus, Trash2, Edit2, Save, CheckCircle2,
  AlertCircle, RefreshCw, Eye, Code, Inbox, Send
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('blogs');
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState('');

  // Data states
  const [blogs, setBlogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [siteInfo, setSiteInfo] = useState({ socialLinks: [], facts: [], heroSignals: [] });
  const [source, setSource] = useState('loading');
  const [feedback, setFeedback] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Form states (Blog)
  const [blogForm, setBlogForm] = useState({ id: '', title: '', excerpt: '', tags: '', readTime: '4 min read', content: '' });
  const [editingBlogId, setEditingBlogId] = useState(null);

  // Form states (Project)
  const [projectForm, setProjectForm] = useState({ name: '', description: '', stack: 'JavaScript', code: '', live: '', order: 0 });
  const [editingProjectName, setEditingProjectName] = useState(null);

  // Chat inbox states
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [inboxDraft, setInboxDraft] = useState('');
  const inboxBodyRef = React.useRef(null);

  const router = useRouter();

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Not authenticated');
        const data = await res.json();
        setUser(data.user);
        setAuthChecking(false);
        loadAllData();
      } catch (_err) {
        router.push('/admin/login');
      }
    }
    checkAuth();
  }, [router]);

  const loadAllData = async () => {
    try {
      const [resBlogs, resProjects, resInfo] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/projects'),
        fetch('/api/site-info')
      ]);

      const dataBlogs = await resBlogs.json();
      const dataProjects = await resProjects.json();
      const dataInfo = await resInfo.json();

      setBlogs(dataBlogs.data || []);
      setProjects(dataProjects.data || []);
      setSiteInfo(dataInfo.data || { socialLinks: [], facts: [], heroSignals: [] });
      setSource(dataBlogs.source || 'seed');
    } catch (_err) {
      showFeedback('error', 'Error loading data from backend');
    }
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Seed MongoDB Atlas
  const handleSeedSync = async () => {
    if (!confirm('This will synchronize your MongoDB Atlas database with the portfolio data. Continue?')) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seed sync failed');
      showFeedback('success', data.message || 'Atlas database synchronized successfully!');
      loadAllData();
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setSyncing(false);
    }
  };

  // ─── Blog Actions ───
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    try {
      const method = editingBlogId ? 'PUT' : 'POST';
      const endpoint = editingBlogId ? `/api/blogs/${editingBlogId}` : '/api/blogs';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save blog post');

      showFeedback('success', editingBlogId ? 'Blog updated!' : 'Blog created!');
      setEditingBlogId(null);
      setBlogForm({ id: '', title: '', excerpt: '', tags: '', readTime: '4 min read', content: '' });
      loadAllData();
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleEditBlog = (post) => {
    setEditingBlogId(post.id);
    setBlogForm({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags,
      readTime: post.readTime,
      content: post.content
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteBlog = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showFeedback('success', 'Blog deleted!');
      loadAllData();
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  // ─── Project Actions ───
  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const method = editingProjectName ? 'PUT' : 'POST';
      const endpoint = editingProjectName ? `/api/projects/${editingProjectName}` : '/api/projects';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project');

      showFeedback('success', editingProjectName ? 'Project updated!' : 'Project created!');
      setEditingProjectName(null);
      setProjectForm({ name: '', description: '', stack: 'JavaScript', code: '', live: '', order: 0 });
      loadAllData();
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleEditProject = (proj) => {
    setEditingProjectName(proj.name);
    setProjectForm({
      name: proj.name,
      description: proj.description,
      stack: proj.stack,
      code: proj.code,
      live: proj.live,
      order: proj.order || 0
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteProject = async (name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/projects/${name}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showFeedback('success', 'Project deleted!');
      loadAllData();
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  // ─── Chat Inbox ───
  const loadThreads = async () => {
    try {
      const res = await fetch('/api/chat/messages?threads=1');
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch (_err) { /* ignore */ }
  };

  const openThread = async (username) => {
    setActiveThread(username);
    try {
      const res = await fetch(`/api/chat/messages?user=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setThreadMessages(data.messages || []);
      }
    } catch (_err) { /* ignore */ }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    const text = inboxDraft.trim();
    const recipient = typeof activeThread === 'string' ? activeThread.trim().toLowerCase() : '';
    if (!text) return;
    if (!recipient) {
      showFeedback('error', 'Select a conversation before replying.');
      return;
    }
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, recipient })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setThreadMessages(prev => [...prev, data.message]);
      setInboxDraft('');
      loadThreads();
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  useEffect(() => {
    if (activeTab !== 'inbox') return;
    loadThreads();
    const poll = setInterval(loadThreads, 5000);
    return () => clearInterval(poll);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'inbox' || !activeThread) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/messages?user=${encodeURIComponent(activeThread)}`);
        if (res.ok) {
          const data = await res.json();
          setThreadMessages(data.messages || []);
        }
      } catch (_err) { /* ignore */ }
    }, 4000);
    return () => clearInterval(poll);
  }, [activeTab, activeThread]);

  React.useEffect(() => {
    if (inboxBodyRef.current) inboxBodyRef.current.scrollTop = inboxBodyRef.current.scrollHeight;
  }, [threadMessages]);

  if (authChecking) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)', font: '12px "DM Mono", monospace' }}>
        <RefreshCw size={16} style={{ display: 'inline', marginRight: '8px' }} /> Checking admin authorization...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--line)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <p className="section-label">Authenticated Session</p>
          <h1 style={{ margin: 0, font: '700 28px Sora, sans-serif', letterSpacing: '-0.04em' }}>
            Control Center ({user})
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleSeedSync}
            disabled={syncing}
            className="button ghost"
            style={{ fontSize: '10.5px', height: '36px' }}
            title="Sync all default data to MongoDB Atlas"
          >
            <Database size={13} /> {syncing ? 'Syncing...' : 'Sync Atlas Seed'}
          </button>

          <button
            onClick={handleLogout}
            className="button"
            style={{ fontSize: '10.5px', height: '36px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </div>

      {/* Database Connection Status Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        margin: '20px 0',
        background: source === 'mongodb' ? 'rgba(64, 196, 99, 0.08)' : 'rgba(186, 65, 45, 0.06)',
        border: '1px solid var(--line)',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'DM Mono, monospace'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={14} color={source === 'mongodb' ? '#30a14e' : 'var(--accent)'} />
          <span>
            Database State: <strong>{source === 'mongodb' ? 'Connected to MongoDB Atlas' : 'Local Seed Mode (Set MONGODB_URI for cloud storage)'}</strong>
          </span>
        </div>
        <Link href="/" target="_blank" style={{ color: 'var(--accent)', fontWeight: 800 }}>
          View Live Site ↗
        </Link>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          background: feedback.type === 'success' ? 'rgba(64, 196, 99, 0.12)' : 'rgba(186, 65, 45, 0.12)',
          border: `1px solid ${feedback.type === 'success' ? '#30a14e' : 'var(--accent)'}`,
          borderRadius: '6px',
          color: 'var(--ink)',
          fontSize: '12.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} color="#30a14e" /> : <AlertCircle size={16} color="var(--accent)" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '32px' }}>
        {[
          { id: 'blogs', label: `Blogs (${blogs.length})`, icon: FileText },
          { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
          { id: 'inbox', label: `Inbox (${threads.length})`, icon: Inbox },
          { id: 'info', label: 'Site Links & Info', icon: LinkIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: BLOGS MANAGER ─── */}
      {activeTab === 'blogs' && (
        <div style={{ display: 'grid', gap: '40px' }}>
          {/* Create/Edit Form */}
          <div style={{ border: '1px solid var(--line)', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 16px', font: '800 16px Space Grotesk, sans-serif' }}>
              {editingBlogId ? `Edit Blog Post (${editingBlogId})` : 'Write New Engineering Note'}
            </h3>

            <form onSubmit={handleSaveBlog} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Title</label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={e => setBlogForm({ ...blogForm, title: e.target.value })}
                    required
                    placeholder="e.g. Modern CSS Layout Algorithms"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Read Time</label>
                  <input
                    type="text"
                    value={blogForm.readTime}
                    onChange={e => setBlogForm({ ...blogForm, readTime: e.target.value })}
                    placeholder="e.g. 5 min read"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={blogForm.tags}
                  onChange={e => setBlogForm({ ...blogForm, tags: e.target.value })}
                  placeholder="e.g. CSS, Performance, Design Systems"
                  style={{ width: '100%', height: '40px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Excerpt (short summary)</label>
                <textarea
                  rows={2}
                  value={blogForm.excerpt}
                  onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  placeholder="Short description for preview cards..."
                  style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Content (Markdown & Code supported)</label>
                <textarea
                  rows={9}
                  value={blogForm.content}
                  onChange={e => setBlogForm({ ...blogForm, content: e.target.value })}
                  required
                  placeholder="Write your article in markdown with **bold headings**, code blocks, etc..."
                  style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)', fontFamily: 'DM Mono, monospace', fontSize: '12.5px', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="button">
                  <Save size={13} /> {editingBlogId ? 'Update Post' : 'Publish Note'}
                </button>
                {editingBlogId && (
                  <button
                    type="button"
                    onClick={() => { setEditingBlogId(null); setBlogForm({ id: '', title: '', excerpt: '', tags: '', readTime: '4 min read', content: '' }); }}
                    className="button ghost"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Existing Blogs List */}
          <div>
            <h3 style={{ margin: '0 0 16px', font: '800 16px Space Grotesk, sans-serif' }}>Published Notes</h3>
            <div className="blog-list">
              {blogs.map(post => (
                <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid var(--line)', gap: '16px' }}>
                  <div>
                    <span style={{ font: '10px "DM Mono", monospace', color: 'var(--muted)' }}>{post.date} · {post.readTime}</span>
                    <h4 style={{ margin: '4px 0', fontSize: '16px' }}>{post.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{post.excerpt}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleEditBlog(post)} className="button ghost" style={{ minHeight: '34px', padding: '0 10px', fontSize: '11px' }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDeleteBlog(post.id)} className="button ghost" style={{ minHeight: '34px', padding: '0 10px', fontSize: '11px', color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PROJECTS MANAGER ─── */}
      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gap: '40px' }}>
          <div style={{ border: '1px solid var(--line)', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 16px', font: '800 16px Space Grotesk, sans-serif' }}>
              {editingProjectName ? `Edit Project (${editingProjectName})` : 'Add Selected Project'}
            </h3>

            <form onSubmit={handleSaveProject} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) 90px', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Project Name</label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                    required
                    placeholder="e.g. KAALYUG OS"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Tech Stack</label>
                  <input
                    type="text"
                    value={projectForm.stack}
                    onChange={e => setProjectForm({ ...projectForm, stack: e.target.value })}
                    placeholder="e.g. TypeScript, React"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Order</label>
                  <input
                    type="number"
                    value={projectForm.order}
                    onChange={e => setProjectForm({ ...projectForm, order: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={2}
                  value={projectForm.description}
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  required
                  placeholder="What does this project do?"
                  style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>GitHub Source URL</label>
                  <input
                    type="url"
                    value={projectForm.code}
                    onChange={e => setProjectForm({ ...projectForm, code: e.target.value })}
                    placeholder="https://github.com/..."
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>Live Demo URL</label>
                  <input
                    type="url"
                    value={projectForm.live}
                    onChange={e => setProjectForm({ ...projectForm, live: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="button">
                  <Save size={13} /> {editingProjectName ? 'Update Project' : 'Add Project'}
                </button>
                {editingProjectName && (
                  <button
                    type="button"
                    onClick={() => { setEditingProjectName(null); setProjectForm({ name: '', description: '', stack: 'JavaScript', code: '', live: '', order: 0 }); }}
                    className="button ghost"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h3 style={{ margin: '0 0 16px', font: '800 16px Space Grotesk, sans-serif' }}>Projects List</h3>
            <div className="project-list">
              {projects.map((proj, idx) => (
                <div key={proj.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--line)', gap: '16px' }}>
                  <div>
                    <span style={{ font: '10px "DM Mono", monospace', color: 'var(--accent)' }}>0{idx + 1} · {proj.stack}</span>
                    <h4 style={{ margin: '3px 0', fontSize: '15px' }}>{proj.name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{proj.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleEditProject(proj)} className="button ghost" style={{ minHeight: '34px', padding: '0 10px', fontSize: '11px' }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDeleteProject(proj.name)} className="button ghost" style={{ minHeight: '34px', padding: '0 10px', fontSize: '11px', color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: CHAT INBOX (Messenger theme) ─── */}
      {activeTab === 'inbox' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, font: '800 16px Space Grotesk, sans-serif' }}>Private Chat Inbox</h3>
            <button onClick={loadThreads} className="button ghost" style={{ minHeight: '34px', padding: '0 10px', fontSize: '11px' }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="inbox">
            <div className="inbox-thread-list">
              {threads.length === 0 && (
                <div className="inbox-empty">No conversations yet.<br />Users who register on the Connect page will appear here.</div>
              )}
              {threads.map(t => (
                <button
                  key={t.username}
                  className={`inbox-thread ${activeThread === t.username ? 'active' : ''}`}
                  onClick={() => openThread(t.username)}
                >
                  <strong>{t.username}</strong>
                  <span>{t.lastFrom === 'admin' ? 'You: ' : ''}{t.lastMessage}</span>
                </button>
              ))}
            </div>
            <div className="inbox-chat">
              {activeThread ? (
                <>
                  <div className="chat-head">Chat with {activeThread}</div>
                  <div className="chat-body" ref={inboxBodyRef}>
                    {threadMessages.map((m, idx) => (
                      <div className={`chat-bubble ${m.from === 'admin' ? 'me' : 'them'}`} key={idx}>
                        {m.text}
                        <span className="chat-time">
                          {new Date(m.at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <form className="chat-form" onSubmit={sendReply}>
                    <input
                      type="text"
                      placeholder={`Reply to ${activeThread}…`}
                      value={inboxDraft}
                      onChange={e => setInboxDraft(e.target.value)}
                      maxLength={2000}
                    />
                    <button type="submit" disabled={!inboxDraft.trim()}>
                      <Send size={13} /> Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="inbox-empty">Select a conversation from the left.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: SITE INFO & SOCIAL LINKS ─── */}
      {activeTab === 'info' && (
        <div style={{ border: '1px solid var(--line)', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 16px', font: '800 16px Space Grotesk, sans-serif' }}>Social Links Manager</h3>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
            Add, edit or remove media links (LinkedIn, GitHub, Instagram, Email, etc.).
            The <strong>Icon</strong> field accepts any <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Lucide icon name</a> (e.g. Linkedin, Github, Instagram, Mail, Globe, Twitter).
          </p>

          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await fetch('/api/site-info', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteInfo)
              });
              if (!res.ok) throw new Error('Failed to update');
              showFeedback('success', 'Site links updated successfully!');
            } catch (err) {
              showFeedback('error', err.message);
            }
          }} style={{ display: 'grid', gap: '16px' }}>
            {(siteInfo.socialLinks || []).map((link, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr) auto', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={link.name}
                  placeholder="Name"
                  onChange={e => {
                    const next = [...siteInfo.socialLinks];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setSiteInfo({ ...siteInfo, socialLinks: next });
                  }}
                  style={{ width: '100%', height: '38px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                />
                <input
                  type="text"
                  value={link.url}
                  placeholder="https://..."
                  onChange={e => {
                    const next = [...siteInfo.socialLinks];
                    next[idx] = { ...next[idx], url: e.target.value };
                    setSiteInfo({ ...siteInfo, socialLinks: next });
                  }}
                  style={{ width: '100%', height: '38px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                />
                <input
                  type="text"
                  value={link.icon || ''}
                  placeholder="Icon (Lucide name)"
                  onChange={e => {
                    const next = [...siteInfo.socialLinks];
                    next[idx] = { ...next[idx], icon: e.target.value };
                    setSiteInfo({ ...siteInfo, socialLinks: next });
                  }}
                  style={{ width: '100%', height: '38px', padding: '0 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--ink)' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm(`Remove ${link.name || 'this link'}?`)) return;
                    setSiteInfo({ ...siteInfo, socialLinks: siteInfo.socialLinks.filter((_, i) => i !== idx) });
                  }}
                  className="button ghost"
                  style={{ minHeight: '38px', padding: '0 10px', fontSize: '11px', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                  title="Remove link"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button ghost"
                onClick={() => setSiteInfo({
                  ...siteInfo,
                  socialLinks: [...(siteInfo.socialLinks || []), { name: '', url: '', icon: 'Globe' }]
                })}
              >
                <Plus size={13} /> Add New Link
              </button>
              <button type="submit" className="button">
                <Save size={13} /> Save Links & Info
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
