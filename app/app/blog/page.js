'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Clock, ChevronDown, ChevronUp, RefreshCw, Bookmark, BookmarkCheck,
  Search, X, Share2, Check, Copy, Sparkles, BookOpen
} from 'lucide-react';
import { blogPosts as seedBlogs } from '../../lib/data';

export default function BlogPage() {
  const [blogs, setBlogs] = useState(seedBlogs);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [copiedShareId, setCopiedShareId] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setBlogs(json.data);
          }
        }
      } catch (_err) {
        // Fallback to seedBlogs already loaded
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();

    // Check user & load saved blogs
    fetch('/api/chat/auth')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          return fetch('/api/user/saved')
            .then((r) => (r.ok ? r.json() : { items: [] }))
            .then((res) => {
              const ids = new Set((res.items || []).map((i) => i.id));
              setSavedIds(ids);
            });
        }
      })
      .catch(() => {});
  }, []);

  const toggleSave = async (e, post) => {
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const isSaved = savedIds.has(post.id);
    setSavingId(post.id);
    try {
      if (isSaved) {
        const res = await fetch(`/api/user/saved?id=${encodeURIComponent(post.id)}`, { method: 'DELETE' });
        if (res.ok) {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(post.id);
            return next;
          });
        }
      } else {
        const res = await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: post.id, title: post.title, type: 'blog' })
        });
        if (res.ok) {
          setSavedIds((prev) => new Set(prev).add(post.id));
        }
      }
    } catch (_err) {
      // ignore
    } finally {
      setSavingId(null);
    }
  };

  const togglePost = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    const hashId = window.location.hash.slice(1);
    if (hashId && blogs.some((post) => post.id === hashId)) {
      setExpandedId(hashId);
      requestAnimationFrame(() => document.getElementById(hashId)?.scrollIntoView({ block: 'start' }));
    }
  }, [blogs]);

  const copySnippet = (codeText, snippetId) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(codeText);
      setCopiedCodeId(snippetId);
      setTimeout(() => setCopiedCodeId(null), 2000);
    }
  };

  const sharePost = (e, post) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/blog#${post.id}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setCopiedShareId(post.id);
        setTimeout(() => setCopiedShareId(null), 2000);
      }
    }
  };

  // Derive unique tags across blogs
  const allTags = useMemo(() => {
    const tagSet = new Set(['All']);
    blogs.forEach((b) => {
      if (Array.isArray(b.tags)) {
        b.tags.forEach((t) => tagSet.add(t));
      } else if (typeof b.tags === 'string') {
        b.tags.split(',').forEach((t) => tagSet.add(t.trim()));
      }
    });
    return Array.from(tagSet);
  }, [blogs]);

  // Filtered blogs based on search query and selected tag
  const filteredBlogs = useMemo(() => {
    return blogs.filter((post) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title?.toLowerCase().includes(q) ||
        post.excerpt?.toLowerCase().includes(q) ||
        (Array.isArray(post.tags) ? post.tags.some((t) => t.toLowerCase().includes(q)) : post.tags?.toLowerCase().includes(q));

      const matchesTag =
        selectedTag === 'All' ||
        (Array.isArray(post.tags) ? post.tags.includes(selectedTag) : post.tags?.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [blogs, searchQuery, selectedTag]);

  return (
    <section className="blog-section" aria-labelledby="blog-title">
      <div className="blog-intro">
        <p className="section-label">05 / Notes &amp; writing</p>
        <h2 id="blog-title">Notes on building for the web.</h2>
        <p>
          Documenting lessons on frontend architecture, design systems, performance, accessibility, and modern JavaScript engineering.
        </p>
      </div>

      {/* ─── Search and Tag Filters ─── */}
      <div className="blog-controls-bar">
        <form className="blog-search-wrap" onSubmit={(e) => { e.preventDefault(); searchInputRef.current?.focus(); }}>
          <Search size={15} className="blog-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="blog-search-input"
            placeholder="Search notes by keyword or concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search articles"
          />
          {searchQuery && (
            <button
              type="button"
              className="blog-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button type="submit" className="blog-search-submit" aria-label="Search notes" title="Search notes">
            <Search size={14} /> <span>Search</span>
          </button>
        </form>

        <div className="blog-tag-filters" role="tablist" aria-label="Filter notes by tag">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              role="tab"
              aria-selected={selectedTag === tag}
              className={`blog-filter-btn ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading && blogs.length === 0 && (
        <div className="blog-skeleton-list">
          {[1, 2, 3].map((i) => (
            <div className="blog-skeleton-card" key={i}>
              <div className="blog-skeleton-meta">
                <div className="skeleton-shimmer" style={{ width: '90px', height: '12px' }} />
                <div className="skeleton-shimmer" style={{ width: '80px', height: '12px' }} />
              </div>
              <div className="skeleton-shimmer blog-skeleton-title" />
              <div className="skeleton-shimmer blog-skeleton-desc" />
              <div className="skeleton-shimmer blog-skeleton-desc-sub" />
              <div className="blog-skeleton-footer">
                <div className="skeleton-shimmer" style={{ width: '150px', height: '22px', borderRadius: '4px' }} />
                <div className="skeleton-shimmer" style={{ width: '100px', height: '20px', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredBlogs.length === 0 && (
        <div style={{ padding: '48px 0', borderTop: '1px solid var(--line)', color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px' }}>
            No engineering notes found matching <strong>&ldquo;{searchQuery || selectedTag}&rdquo;</strong>.
          </p>
          <button
            type="button"
            className="button"
            style={{ fontSize: '11px', height: '36px' }}
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('All');
            }}
          >
            Show All Notes
          </button>
        </div>
      )}

      <div className="blog-list">
        {filteredBlogs.map((post) => {
          const isExpanded = expandedId === post.id;
          const isShareCopied = copiedShareId === post.id;
          return (
            <article className="blog-card" key={post.id} id={post.id}>
              <div
                className="blog-card-header"
                onClick={() => togglePost(post.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePost(post.id); }}
              >
                <div className="blog-card-meta">
                  <span>{post.date}</span>
                  <span className="blog-read-time">
                    <Clock size={11} /> {post.readTime}
                  </span>
                </div>
                <h3>{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                  <div className="blog-tags">
                    {Array.isArray(post.tags) ? post.tags.map((tag) => (
                      <span className="blog-tag" key={tag}>{tag}</span>
                    )) : (
                      <span className="blog-tag">{post.tags}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => sharePost(e, post)}
                      title="Copy link to note"
                      aria-label="Share note link"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        border: '1px solid var(--line)',
                        borderRadius: '4px',
                        color: isShareCopied ? '#40c463' : 'var(--muted)',
                        borderColor: isShareCopied ? '#40c463' : 'var(--line)',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isShareCopied ? <><Check size={12} /> Copied</> : <><Share2 size={12} /> Share</>}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => toggleSave(e, post)}
                      disabled={savingId === post.id}
                      title={savedIds.has(post.id) ? 'Remove bookmark' : 'Save note to account'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        border: '1px solid var(--line)',
                        borderRadius: '4px',
                        color: savedIds.has(post.id) ? 'var(--accent)' : 'var(--muted)',
                        borderColor: savedIds.has(post.id) ? 'var(--accent)' : 'var(--line)',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {savedIds.has(post.id) ? (
                        <><BookmarkCheck size={13} /> Saved</>
                      ) : (
                        <><Bookmark size={13} /> Save</>
                      )}
                    </button>

                    <span className="blog-toggle">
                      {isExpanded ? (
                        <>Collapse <ChevronUp size={13} /></>
                      ) : (
                        <>Read note <ChevronDown size={13} /></>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="blog-content">
                  {post.content && post.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('```')) {
                      const langMatch = paragraph.match(/^```([a-zA-Z0-9]+)?/);
                      const lang = langMatch && langMatch[1] ? langMatch[1] : 'code';
                      const codeText = paragraph.replace(/```[a-zA-Z0-9]*\n?/g, '').trim();
                      const snippetKey = `${post.id}-snip-${idx}`;
                      const isCopied = copiedCodeId === snippetKey;

                      return (
                        <div className="code-block-wrapper" key={idx}>
                          <div className="code-block-header">
                            <span>{lang}</span>
                            <button
                              type="button"
                              className={`code-copy-btn ${isCopied ? 'copied' : ''}`}
                              onClick={() => copySnippet(codeText, snippetKey)}
                              aria-label="Copy snippet to clipboard"
                            >
                              {isCopied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                            </button>
                          </div>
                          <pre>
                            <code>{codeText}</code>
                          </pre>
                        </div>
                      );
                    }
                    if (paragraph.startsWith('**')) {
                      const parts = paragraph.split('**');
                      return (
                        <p key={idx}>
                          <strong>{parts[1]}</strong> {parts.slice(2).join('')}
                        </p>
                      );
                    }
                    return <p key={idx}>{paragraph}</p>;
                  })}

                  <div className="blog-collapse-footer">
                    <button
                      type="button"
                      className="blog-collapse-btn"
                      onClick={() => togglePost(post.id)}
                    >
                      Close Note <ChevronUp size={13} />
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
