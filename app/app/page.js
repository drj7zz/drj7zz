'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { heroSignals } from '../lib/data';
import {
  ArrowRight, Send, Smartphone, Accessibility, Users,
  GitBranch, ExternalLink, RefreshCw, Clock, ChevronDown, ChevronUp
} from 'lucide-react';

const ICON_MAP = {
  Smartphone,
  Accessibility,
  Users
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Mon', 'Wed', 'Fri'];

export default function DashboardPage() {
  const [activity, setActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [topBlogs, setTopBlogs] = useState([]);
  const [expandedBlogId, setExpandedBlogId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingActivity(true);
        const [resAct, resBlogs] = await Promise.all([
          fetch('/api/github-activity'),
          fetch('/api/blogs')
        ]);

        if (resAct.ok) {
          const actData = await resAct.json();
          setActivity(actData);
        }

        if (resBlogs.ok) {
          const blogData = await resBlogs.json();
          setTopBlogs((blogData.data || []).slice(0, 2));
        }
      } catch (_err) {
        // Handled gracefully
      } finally {
        setLoadingActivity(false);
      }
    }
    loadData();
  }, []);

  const toggleBlog = (id) => {
    setExpandedBlogId(expandedBlogId === id ? null : id);
  };

  const calendar = activity?.contributionCalendar;
  const streak = activity?.contributionStreak || { current: 0, longest: 0, total: 0 };
  const weeks = calendar?.weeks || [];

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">DRJ7ZZ / Dirghraj Giri / Frontend developer / Nepal</p>
        <h1 id="hero-title">
          Interfaces with <span>clarity and intent.</span>
        </h1>

        <div className="hero-split">
          <figure className="hero-portrait hero-portrait--inline">
            <div className="hero-portrait-frame">
              <img
                src="/assets/images/profile.jpg"
                alt="DRJ, frontend developer"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          </figure>

          <div className="hero-copy-wrap">
            <p className="hero-copy">
              I am DRJ, an emerging frontend developer focused on turning ideas into responsive, accessible web experiences. I combine a visual eye with practical JavaScript and a commitment to learning in public—ready to contribute thoughtful work to a real product team.
            </p>
            <div className="cta-row">
              <Link className="button" href="/about">
                Learn about me <ArrowRight size={14} />
              </Link>
              <Link className="button ghost" href="/connect">
                <Send size={13} /> Start a conversation
              </Link>
            </div>
            <div className="hero-signals" aria-label="Professional strengths">
              {heroSignals.map(([iconKey, label]) => {
                const IconComp = ICON_MAP[iconKey] || Users;
                return (
                  <span key={label}>
                    <IconComp size={13} /> {label}
                  </span>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ─── Top Engineering Notes (Live from Backend) ─── */}
      <section className="blog-section" aria-labelledby="dashboard-blog-title">
        <div className="dashboard-heading">
          <div>
            <p className="section-label">01 / Engineering Notes</p>
            <h2 id="dashboard-blog-title">Featured Writing</h2>
          </div>
          <Link className="view-all-link" href="/blog">
            All Notes <ArrowRight size={14} />
          </Link>
        </div>

        {topBlogs.length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            No featured notes published yet.
          </p>
        )}

        <div className="blog-list">
          {topBlogs.map((post) => {
            const isExpanded = expandedBlogId === post.id;
            return (
              <article className="blog-card" key={post.id}>
                <div
                  className="blog-card-header"
                  onClick={() => toggleBlog(post.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleBlog(post.id); }}
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

      {/* ─── Live GitHub Activity & Streak ─── */}
      <section className="github-panel" aria-labelledby="dashboard-github-title">
        <div className="github-heading">
          <div>
            <p className="section-label">02 / Live Activity</p>
            <h2 id="dashboard-github-title">GitHub Contributions & Streak</h2>
            <p className="github-intro">
              Live contributions and active repositories synced directly from GitHub.
            </p>
          </div>
          <Link className="view-all-link" href="/github">
            Full Activity <ArrowRight size={14} />
          </Link>
        </div>

        <div className="streak-stats">
          <div className="streak-stat-item">
            <strong>{streak.total || 0}</strong>
            <span>Total Contributions</span>
          </div>
          <div className="streak-stat-item">
            <strong>{streak.current || 0}</strong>
            <span>Current Streak</span>
          </div>
          <div className="streak-stat-item">
            <strong>{streak.longest || 0}</strong>
            <span>Longest Streak</span>
          </div>
        </div>

        {weeks.length > 0 && (
          <div className="graph-container">
            <div className="graph-months">
              {weeks.filter((_, idx) => idx % 4 === 0).map((week, idx) => {
                const firstDay = week.contributionDays[0];
                const month = firstDay ? MONTH_NAMES[new Date(firstDay.date).getMonth()] : '';
                return <span key={idx}>{month}</span>;
              })}
            </div>
            <div className="graph-wrapper">
              <div className="graph-days-label">
                {DAY_NAMES.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="graph-grid">
                {weeks.map((week, wIdx) => (
                  <div className="graph-column" key={wIdx}>
                    {week.contributionDays.map((day, dIdx) => {
                      const count = day.contributionCount;
                      let level = '0';
                      if (count > 0 && count <= 2) level = '1';
                      else if (count > 2 && count <= 5) level = '2';
                      else if (count > 5 && count <= 9) level = '3';
                      else if (count > 9) level = '4';
                      return (
                        <div
                          key={dIdx}
                          className={`graph-cell level-${level}`}
                          title={`${day.date}: ${count} contributions`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="graph-legend">
              <span>Less</span>
              <span className="graph-cell level-0" />
              <span className="graph-cell level-1" />
              <span className="graph-cell level-2" />
              <span className="graph-cell level-3" />
              <span className="graph-cell level-4" />
              <span>More</span>
            </div>
          </div>
        )}

        {loadingActivity && (
          <p style={{ color: 'var(--muted)', marginTop: '20px', font: '11px "DM Mono", monospace' }}>
            <RefreshCw size={12} style={{ display: 'inline', marginRight: '6px' }} />
            Loading GitHub contributions...
          </p>
        )}
      </section>
    </>
  );
}
