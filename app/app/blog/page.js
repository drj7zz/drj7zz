'use client';
import React, { useState } from 'react';
import { blogPosts } from '../../lib/data';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function BlogPage() {
  // Default closed (expandedId: null)
  const [expandedId, setExpandedId] = useState(null);

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

      <div className="blog-list">
        {blogPosts.map((post) => {
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
                    {post.tags.map((tag) => (
                      <span className="blog-tag" key={tag}>{tag}</span>
                    ))}
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
                  {post.content.split('\n\n').map((paragraph, idx) => {
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
