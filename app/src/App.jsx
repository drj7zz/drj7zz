import React, { useState, useEffect } from 'react';

const socialLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/drj7zz', icon: 'fa-brands fa-instagram' },
  { name: 'GitHub', url: 'https://github.com/drj7zz', icon: 'fa-brands fa-github' },
  { name: 'Reddit', url: 'https://www.reddit.com/user/Ok-Fox-4670', icon: 'fa-brands fa-reddit-alien' },
  { name: 'Email', url: 'mailto:giridirghraj@gmail.com', icon: 'fa-solid fa-envelope' }
];

const facts = [
  ['Location', ['Parsa, Madhesh', 'Nepal']],
  ['Education', ['Pursuing BIT', 'Bachelor in IT']],
  ['Discipline', ['Frontend', 'Development']],
  ['Mode', ['Always', 'Learning']]
];

const skills = [
  ['fa-brands fa-js', 'JavaScript', 'Interactive web experiences and browser fundamentals.', 'LEARN'],
  ['fa-solid fa-window-maximize', 'Frontend UI', 'Responsive layouts, semantic markup, and interaction polish.', 'BUILD'],
  ['fa-solid fa-code-branch', 'Open Source', 'Learning through shared tools, code, and community.', 'EXPLORE']
];

function Icon({ className }) {
  return <i className={className} aria-hidden="true" />;
}

function LiveUpdates() {
  const [latestCommit, setLatestCommit] = useState(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/drj7zz/drj7zz/commits?per_page=1')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const commit = data[0];
          setLatestCommit({
            message: commit.commit.message.split('\n')[0],
            repo: 'drj7zz/drj7zz',
            url: commit.html_url,
            time: new Date(commit.commit.author.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!latestCommit) return null;

  return (
    <div className="live-updates-section" aria-live="polite">
      <div className="live-indicator">
        <span className="pulsing-dot"></span>
        <span>LIVE</span>
      </div>
      <div className="update-content">
        <strong>Latest Commit:</strong> <a href={latestCommit.url} target="_blank" rel="noopener noreferrer">{latestCommit.message}</a> in <em>{latestCommit.repo}</em> at {latestCommit.time}
      </div>
    </div>
  );
}

function GitHubActivity() {
  const [status, setStatus] = useState('loading');
  const [repositories, setRepositories] = useState([]);
  const [commits, setCommits] = useState([]);

  useEffect(() => {
    let active = true;
    const cacheKey = 'drj-github-activity-v2';
    const cacheDuration = 300000;
    let hasFreshCache = false;
    let hasCachedActivity = false;

    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey));
      hasCachedActivity = Boolean(cached);
      hasFreshCache = Boolean(cached && Date.now() - cached.timestamp < cacheDuration);
      if (hasCachedActivity) {
        setRepositories(cached.repositories);
        setCommits(cached.commits);
        setStatus('ready');
      }
    } catch (_error) {
      sessionStorage.removeItem(cacheKey);
    }

    const loadActivity = async () => {
      try {
        const [repoResponse, commitResponse] = await Promise.all([
          fetch('https://api.github.com/users/drj7zz/repos?sort=updated&per_page=6'),
          fetch('https://api.github.com/repos/drj7zz/drj7zz/commits?per_page=12')
        ]);
        if (!repoResponse.ok || !commitResponse.ok) throw new Error('GitHub request failed');

        const repoData = await repoResponse.json();
        const rawCommits = await commitResponse.json();
        const commitData = (Array.isArray(rawCommits) ? rawCommits : [])
          .map((item) => ({
            id: item.sha,
            message: item.commit.message.split('\n')[0],
            repository: 'drj7zz/drj7zz',
            url: item.html_url,
            date: item.commit.author.date,
            version: item.sha.substring(0, 7)
          }));

        if (active) {
          setRepositories(repoData);
          setCommits(commitData);
          setStatus('ready');
          sessionStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            repositories: repoData,
            commits: commitData
          }));
        }
      } catch (_error) {
        if (active && !hasCachedActivity) setStatus('error');
      }
    };

    if (!hasFreshCache) loadActivity();
    const interval = window.setInterval(loadActivity, 300000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const hasContent = status === 'ready';
  return (
    <section className="glass-panel github-panel" id="github" aria-labelledby="github-title">
      <div className="github-heading">
        <div>
          <p className="section-label">03 / GitHub</p>
          <h2 id="github-title">Building in public.</h2>
        </div>
        <a className="github-profile-link" href="https://github.com/drj7zz" target="_blank" rel="noopener noreferrer">
          github.com/drj7zz <Icon className="fa-solid fa-arrow-up-right-from-square" />
        </a>
      </div>
      
      {/* Added GitHub Project Live Preview Image cards */}
      <div className="github-preview-cards">
        <a href="https://github.com/drj7zz" target="_blank" rel="noopener noreferrer">
          <img src="https://github-readme-streak-stats.herokuapp.com/?user=drj7zz&theme=tokyonight&hide_border=true" alt="DRJ GitHub activity" />
        </a>
      </div>

      {status === 'error' ? (
        <p className="github-status">GitHub activity is temporarily unavailable. Visit the profile directly to see the latest work.</p>
      ) : (
        <div className="github-content">
          <div className="github-column">
            <h3>Recent Projects</h3>
            <div className="repo-list">
              {hasContent ? repositories.map((repo) => (
                <a className="repo-item" href={repo.html_url} target="_blank" rel="noopener noreferrer" key={repo.id}>
                  <span className="repo-title"><Icon className="fa-solid fa-book-bookmark" /> {repo.name}</span>
                  <span className="repo-meta">{repo.language || 'Code'} <Icon className="fa-solid fa-star" /> {repo.stargazers_count}</span>
                </a>
              )) : <p className="github-status">Loading projects...</p>}
            </div>
          </div>
          <div className="github-column commit-column">
            <h3>Commit History & Versions</h3>
            <div className="commit-list expanded-commits">
              {hasContent && commits.length > 0 ? commits.map((commit) => (
                <a className="commit-item timeline-item" href={commit.url} target="_blank" rel="noopener noreferrer" key={commit.id}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <span className="commit-message">{commit.message}</span>
                    <span className="commit-meta">
                      <strong>{commit.repository}</strong> • v.{commit.version} • {new Date(commit.date).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              )) : <p className="github-status">{hasContent ? 'No recent public commits found.' : 'Loading recent commits...'}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="page-shell">
      <header className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="DRJ home">
          <img className="brand-mark" src="/assets/images/logo.png" alt="" /> KAALYUG
        </a>
        <button className="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <Icon className={`fa-solid fa-${menuOpen ? 'xmark' : 'bars'}`} />
        </button>
        <nav className={`nav-links${menuOpen ? ' open' : ''}`} aria-label="Portfolio sections">
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#skills" onClick={closeMenu}>Focus</a>
          <a href="#github" onClick={closeMenu}>GitHub</a>
          <a href="#connect" onClick={closeMenu}>Connect</a>
        </nav>
      </header>
      
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">Frontend developer / Nepal</p>
            <h1 id="hero-title">Building clear<br/><span>digital surfaces.</span></h1>
            <p className="hero-copy">I am DRJ, a developer learning in public and building thoughtful interfaces for the open web. I care about responsive detail, accessible interaction, and code that stays understandable.</p>
            <div className="cta-row">
              <a className="button" href="#connect">Connect with me <Icon className="fa-solid fa-arrow-right" /></a>
              <a className="button ghost" href="https://github.com/drj7zz" target="_blank" rel="noopener noreferrer"><Icon className="fa-brands fa-github" /> View GitHub</a>
            </div>
          </div>
          <aside className="glass-panel identity-card" aria-label="Profile summary">
            <div className="card-top">
              <div className="avatar-wrap">
                <span className="avatar-crop">
                  <img className="avatar" src="/assets/images/profile.jpg" alt="DRJ profile" />
                </span>
              </div>
              <span className="availability"><i></i> Available to collaborate</span>
            </div>
            <div>
              <h2>DRJ</h2>
              <p>Developer, learner, open-source enthusiast.</p>
            </div>
            <div className="card-code">01 / MADHESH, NEPAL</div>
          </aside>
        </section>

        <LiveUpdates />

        <div className="content-grid">
          <section className="glass-panel section-panel" id="about" aria-labelledby="about-title">
            <p className="section-label">01 / About</p>
            <h2 id="about-title">Making the web feel considered.</h2>
            <p>I work at the intersection of frontend development and visual design. My current focus is building polished web experiences while deepening my JavaScript and open-source practice.</p>
            <div className="facts">
              {facts.map(([label, lines]) => (
                <div className="fact" key={label}>
                  <span>{label}</span>
                  <strong>{lines[0]}<br/>{lines[1]}</strong>
                </div>
              ))}
            </div>
          </section>
          
          <section className="glass-panel section-panel" id="skills" aria-labelledby="skills-title">
            <p className="section-label">02 / Focus</p>
            <h2 id="skills-title">What I am working on.</h2>
            <div className="skill-list">
              {skills.map(([icon, title, description, level]) => (
                <article className="skill" key={title}>
                  <span className="skill-icon"><Icon className={icon} /></span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <span className="skill-level">{level}</span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <GitHubActivity />

        <section className="glass-panel connect" id="connect" aria-labelledby="connect-title">
          <Icon className="fa-solid fa-satellite-dish fa-lg" />
          <div>
            <h2 id="connect-title">Let us build something useful.</h2>
            <p>Find me on the platforms below or send an email.</p>
          </div>
          <div className="socials" aria-label="Social links">
            {socialLinks.map(({ name, url, icon }) => (
              <a 
                className="social" 
                href={url} 
                aria-label={name} 
                title={name} 
                key={name}
                {...(url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                <Icon className={icon} />
              </a>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="footer">DRJ / KAALYUG / 2026</footer>
    </div>
  );
}

export default App;
