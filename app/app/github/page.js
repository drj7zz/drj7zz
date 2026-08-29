'use client';
import React, { useEffect, useState } from 'react';
import { GitBranch, ExternalLink, RefreshCw } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Mon', 'Wed', 'Fri'];

export default function GitHubPage() {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="github-panel" aria-labelledby="github-title">
      <div className="github-heading">
        <div>
          <p className="section-label">06 / GitHub activity</p>
          <h2 id="github-title">Building in public.</h2>
          <p className="github-intro">
            Live repositories, contributions, and streaks synced directly from GitHub.
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

      {loading && (
        <p style={{ color: 'var(--muted)', marginTop: '20px', font: '11px "DM Mono", monospace' }}>
          <RefreshCw size={12} style={{ display: 'inline', marginRight: '6px' }} />
          Loading GitHub activity...
        </p>
      )}

      {activity && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ margin: '0 0 16px', font: '800 13px "Space Grotesk", sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
            Active Repositories
          </h3>
          <div className="repo-list">
            {(activity.repositories || []).map((repo) => (
              <a
                className="repo-item"
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                key={repo.id}
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
