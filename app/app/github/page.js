'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { GitBranch, ExternalLink, RefreshCw, GitCommit, Flame, Trophy } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Mon', 'Wed', 'Fri'];

export default function GitHubPage() {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true);
        const res = await fetch('/api/github-activity');
        if (!res.ok) throw new Error('Activity data unavailable');
        const data = await res.json();
        setActivity(data);
      } catch (_err) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

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
    <section className="github-panel" aria-labelledby="github-title">
      <div className="github-heading">
        <div>
          <p className="section-label">06 / GitHub Activity &amp; Velocity</p>
          <h2 id="github-title">Continuous integration &amp; open source.</h2>
          <p className="github-intro">
            Live repositories, contribution calendar, and engineering velocity synchronized directly from GitHub.
          </p>
        </div>
        <a
          className="github-profile-link"
          href="https://github.com/drj7zz"
          target="_blank"
          rel="noopener noreferrer"
        >
          View @drj7zz on GitHub <ExternalLink size={13} />
        </a>
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

      {loading && !weeks.length && (
        <div className="graph-skeleton-wrap">
          <p style={{ color: 'var(--muted)', marginBottom: '12px', font: '11px "DM Mono", monospace' }}>
            <RefreshCw size={12} className="spin-icon" style={{ display: 'inline', marginRight: '6px' }} />
            Synchronizing GitHub activity stream...
          </p>
          <div className="graph-skeleton-grid" aria-hidden="true" />
        </div>
      )}

      {activity && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ margin: '0 0 16px', font: '800 13px "Space Grotesk", sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
            Active Repositories ({activity.repositories?.length || 0})
          </h3>
          <div className="repo-list">
            {(activity.repositories || []).map((repo) => (
              <a
                className="repo-item"
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                key={repo.id || repo.name}
              >
                <span className="repo-title">
                  <GitBranch size={13} /> {repo.name}
                </span>
                {repo.description && <span className="repo-description">{repo.description}</span>}
                <span className="repo-meta">{repo.language || 'Code'} · ★ {repo.stargazers_count || 0}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
