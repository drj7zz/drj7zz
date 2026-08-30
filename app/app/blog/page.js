'use client';
import React, { useEffect, useState } from 'react';
import { Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      try {
        setLoading(true);
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const json = await res.json();
          setBlogs(json.data || []);
        }
      } catch (_err) {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const togglePost = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="blog-section" aria-labelledby="blog-title">
      <div className="blog-intro">
        <p className="section-label">05 / Notes & writing</p>
        <h2 id="blog-title">Notes on building for the web.</h2>
        <p>
          Documenting what I learn along the way — frontend architecture, design tokens, accessibility, git workflows, and interface design.
        </p>
      </div>

      {loading && (
        <p style={{ color: 'var(--muted)', font: '11px "DM Mono", monospace', margin: '20px 0' }}>
          <RefreshCw size={12} style={{ display: 'inline', marginRight: '6px' }} />
          Loading engineering notes...
        </p>
      )}

      {!loading && blogs.length === 0 && (
        <div style={{ padding: '36px 0', borderTop: '1px solid var(--line)', color: 'var(--muted)', fontSize: '13px' }}>
          No notes published yet. Add your first note in the <a href="/admin" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Admin Dashboard</a>.
        </div>
      )}

      <div className="blog-list">
        {blogs.map((post) => {
          const isExpanded = expandedId === post.id;
          return (
            <article className="blog-card" key={post.id}>
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
                  <span className="blog-toggle">
                    {isExpanded ? (
                      <>Collapse <ChevronUp size={13} /></>
                    ) : (
                      <>Read note <ChevronDown size={13} /></>
                    )}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="blog-content">
                  {post.content && post.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('```')) {
                      const codeText = paragraph.replace(/```(javascript|css)?/g, '').trim();
                      return (
                        <pre key={idx}>
                          <code>{codeText}</code>
                        </pre>
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
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
