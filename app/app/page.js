'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { heroSignals } from '../lib/data';
import {
  ArrowRight, Send, Smartphone, Accessibility, Users,
  GitBranch, ExternalLink, RefreshCw, Clock, ChevronDown, ChevronUp,
  Code2, Terminal, Braces, Bug, Cpu, GitCommit, Flame, Trophy, Sparkles
} from 'lucide-react';

const ORBIT_ICONS = [Code2, Terminal, Braces, GitBranch, Cpu];

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
  const [hoveredCell, setHoveredCell] = useState(null);
  const [profileImgLoaded, setProfileImgLoaded] = useState(false);
  const [profileImgError, setProfileImgError] = useState(false);
  const imgRef = React.useRef(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setProfileImgLoaded(true);
    }
  }, []);

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

  const monthPositions = useMemo(() => {
    if (!weeks.length) return [];
    const months = [];
    let lastMonth = -1;
    weeks.forEach((week, wIdx) => {
      const firstValidDay = week.contributionDays?.find((d) => d && d.date);
      if (firstValidDay) {
        const d = new Date(firstValidDay.date);
        const m = d.getMonth();
        if (m !== lastMonth) {
          months.push({ name: MONTH_NAMES[m], colIndex: wIdx });
          lastMonth = m;
        }
      }
    });
    return months;
  }, [weeks]);

  const formatCellDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">DRJ7ZZ / Dirghraj Giri / Frontend Engineer / Nepal</p>
        <h1 id="hero-title">
          Interfaces with <span>clarity and intent.</span>
        </h1>

        <div className="hero-split">
          <figure className="hero-portrait hero-portrait--inline" aria-label="Portrait of Dirghraj Giri">
            <div className="hero-orbit" aria-hidden="true">
              {ORBIT_ICONS.map((OrbitIcon, idx) => (
                <span className="hero-orbit-icon" key={idx}>
                  <OrbitIcon size={14} strokeWidth={2} />
                </span>
              ))}
            </div>

            <div className="hero-portrait-frame">
              <div className="hero-portrait-glow-halo" aria-hidden="true" />
              <div className="hero-portrait-border-line" aria-hidden="true" />
              <div className="hero-portrait-inner">
                {!profileImgLoaded && !profileImgError && (
                  <div className="hero-portrait-skeleton" aria-hidden="true" />
                )}
                {!profileImgError ? (
                  <img
                    ref={imgRef}
                    src="/assets/images/profile.jpg"
                    alt="Dirghraj Giri (DRJ) - Frontend Engineer"
                    width={260}
                    height={260}
                    className="hero-portrait-img"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    onLoad={() => setProfileImgLoaded(true)}
                    onError={() => setProfileImgError(true)}
                  />
                ) : (
                  <div className="hero-portrait-fallback" role="img" aria-label="Dirghraj Giri avatar fallback">
                    <span className="fallback-monogram">DG</span>
                    <span className="fallback-role">DRJ7ZZ</span>
                  </div>
                )}
              </div>
            </div>
          </figure>

          <div className="hero-copy-wrap">
            <p className="hero-copy">
              I am DRJ, a frontend engineer specialized in building responsive, accessible, and high-performance web applications. I combine visual precision with modern JavaScript and standards-compliant engineering to deliver robust digital experiences.
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
            <p className="section-label">02 / Production Activity</p>
            <h2 id="dashboard-github-title">GitHub Contributions &amp; Velocity</h2>
            <p className="github-intro">
              Live engineering metrics, active repository code streams, and contribution frequency synchronized directly from GitHub.
            </p>
          </div>
          <Link className="view-all-link" href="/github">
            Full Activity <ArrowRight size={14} />
          </Link>
        </div>

        <div className="streak-stats">
          <div className="streak-stat-item">
            <div className="streak-stat-header">
              <GitCommit size={15} className="streak-stat-icon" />
              <span>Total Contributions</span>
            </div>
            <strong>{streak.total || 0}</strong>
          </div>
          <div className="streak-stat-item">
            <div className="streak-stat-header">
              <Flame size={15} className="streak-stat-icon" />
              <span>Current Streak</span>
            </div>
            <strong>{streak.current || 0} <em className="streak-unit">days</em></strong>
          </div>
          <div className="streak-stat-item">
            <div className="streak-stat-header">
              <Trophy size={15} className="streak-stat-icon" />
              <span>Longest Streak</span>
            </div>
            <strong>{streak.longest || 0} <em className="streak-unit">days</em></strong>
          </div>
        </div>

        {weeks.length > 0 && (
          <div className="graph-container">
            <div className="graph-tooltip-banner" aria-live="polite">
              {hoveredCell ? (
                <>
                  <span className="tooltip-count">
                    <strong>{hoveredCell.count}</strong> {hoveredCell.count === 1 ? 'contribution' : 'contributions'}
                  </span>
                  <span className="tooltip-date">on {formatCellDate(hoveredCell.date)}</span>
                </>
              ) : (
                <span className="tooltip-placeholder">Hover or tap any square to inspect activity</span>
              )}
            </div>

            <div className="graph-scroll-area">
              <div className="graph-table-layout">
                {/* Synchronized Month Labels */}
                <div className="graph-months-row" aria-hidden="true">
                  <div className="graph-days-spacer" />
                  <div className="graph-months-track">
                    {monthPositions.map((m, idx) => (
                      <span
                        key={`${m.name}-${idx}`}
                        className="graph-month-label"
                        style={{ gridColumnStart: m.colIndex + 1 }}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Day Labels & Grid Columns */}
                <div className="graph-body-row">
                  <div className="graph-days-label" aria-hidden="true">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>
                  <div className="graph-grid" role="grid" aria-label="Contribution grid for past year">
                    {weeks.map((week, wIdx) => (
                      <div className="graph-column" key={wIdx} role="row">
                        {week.contributionDays.map((day, dIdx) => {
                          const count = day.contributionCount;
                          let level = '0';
                          if (count > 0 && count <= 2) level = '1';
                          else if (count > 2 && count <= 5) level = '2';
                          else if (count > 5 && count <= 9) level = '3';
                          else if (count > 9) level = '4';
                          const isHovered = hoveredCell?.date === day.date;
                          return (
                            <button
                              type="button"
                              key={dIdx}
                              className={`graph-cell level-${level} ${isHovered ? 'is-active' : ''}`}
                              title={`${day.date}: ${count} contributions`}
                              aria-label={`${count} contributions on ${day.date}`}
                              onMouseEnter={() => setHoveredCell({ date: day.date, count })}
                              onMouseLeave={() => setHoveredCell(null)}
                              onClick={() => setHoveredCell({ date: day.date, count })}
                              onFocus={() => setHoveredCell({ date: day.date, count })}
                              onBlur={() => setHoveredCell(null)}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="graph-footer">
              <span className="graph-scroll-hint">← Scroll horizontally to explore entire year →</span>
              <div className="graph-legend">
                <span>Less</span>
                <span className="graph-cell level-0" aria-hidden="true" />
                <span className="graph-cell level-1" aria-hidden="true" />
                <span className="graph-cell level-2" aria-hidden="true" />
                <span className="graph-cell level-3" aria-hidden="true" />
                <span className="graph-cell level-4" aria-hidden="true" />
                <span>More</span>
              </div>
            </div>
          </div>
        )}

        {loadingActivity && !weeks.length && (
          <div className="graph-skeleton-wrap">
            <p style={{ color: 'var(--muted)', marginBottom: '12px', font: '11px "DM Mono", monospace' }}>
              <RefreshCw size={12} className="spin-icon" style={{ display: 'inline', marginRight: '6px' }} />
              Synchronizing GitHub activity stream...
            </p>
            <div className="graph-skeleton-grid" aria-hidden="true" />
          </div>
        )}
      </section>
    </>
  );
}
