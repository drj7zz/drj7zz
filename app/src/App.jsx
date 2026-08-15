import React, { useState, useEffect } from 'react';

const socialLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/drj7zz', icon: 'fa-brands fa-instagram' },
  { name: 'GitHub', url: 'https://github.com/drj7zz', icon: 'fa-brands fa-github' },
  { name: 'Reddit', url: 'https://www.reddit.com/user/Ok-Fox-4670', icon: 'fa-brands fa-reddit-alien' },
  { name: 'Email', url: 'mailto:giridirghraj@gmail.com', icon: 'fa-solid fa-envelope' }
];

const facts = [
  ['Location', ['Parsa, Madhesh', 'Nepal']],
  ['Education', ['Bachelor of Information', 'Technology (BIT)']],
  ['Discipline', ['Frontend', 'Development']],
  ['Approach', ['Curious, reliable', 'and collaborative']]
];

const heroSignals = [
  ['fa-solid fa-mobile-screen-button', 'Responsive-first'],
  ['fa-solid fa-universal-access', 'Accessible by design'],
  ['fa-solid fa-people-group', 'Open to collaboration']
];

const skills = [
  ['fa-brands fa-js', 'JavaScript', 'Building interactive, maintainable experiences with strong browser fundamentals.', 'CORE'],
  ['fa-solid fa-window-maximize', 'Frontend Engineering', 'Creating responsive layouts, semantic markup, and polished user interactions.', 'BUILD'],
  ['fa-solid fa-code-branch', 'Open Source', 'Learning through real repositories, pull requests, and collaborative delivery.', 'GROW']
];

const careerStrengths = [
  ['01', 'Product-minded UI', 'I translate an idea into a clear interface that feels useful from the first interaction.'],
  ['02', 'Detail with purpose', 'Accessibility, responsive behavior, and readable code are part of the work—not a final pass.'],
  ['03', 'Ready to contribute', 'I am growing through open source and looking for frontend opportunities where I can learn fast and ship thoughtfully.']
];

// Keep important work visible even when it is not among GitHub's most recently updated repos.
const featuredProjects = [
  { id: 'featured-mycontribution', name: 'MyContribution', html_url: 'https://github.com/drj7zz?tab=repositories&q=MyContribution', language: 'Featured project' },
  { id: 'featured-pillrequest', name: 'PillRequest', html_url: 'https://github.com/drj7zz?tab=repositories&q=PillRequest', language: 'Featured project' },
  { id: 'featured-collaboration-fepo', name: 'Collaboration FEPO', html_url: 'https://github.com/drj7zz?tab=repositories&q=Collaboration+FEPO', language: 'Featured collaboration' }
];

function withFeaturedProjects(repositories) {
  const repositoryNames = new Set(repositories.map(({ name }) => name.toLowerCase()));
  return [...featuredProjects.filter(({ name }) => !repositoryNames.has(name.toLowerCase())), ...repositories];
}

function Icon({ className }) {
  return <i className={className} aria-hidden="true" />;
}

function LiveUpdates() {
  const [latestCommit, setLatestCommit] = useState(null);

  useEffect(() => {
    const setLatestFromCache = () => {
      try {
        const cached = JSON.parse(sessionStorage.getItem('drj-github-activity-v3'));
        const commit = cached?.commits?.[0];
        if (!commit) return false;
        setLatestCommit({
          message: commit.message,
          repo: commit.repository,
          url: commit.url,
          time: new Date(commit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        return true;
      } catch (_error) {
        return false;
      }
    };

    setLatestFromCache();
    fetch('/api/github-activity')
      .then(res => {
        if (!res.ok) throw new Error('GitHub activity request failed');
        return res.json();
      })
      .then(data => {
        if (data.latestCommit) {
          const commit = data.latestCommit;
          setLatestCommit({
            message: commit.message,
            repo: commit.repository,
            url: commit.url,
            time: new Date(commit.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          });
        }
      })
      .catch(() => setLatestFromCache());
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
  const [pullRequests, setPullRequests] = useState([]);
  const [contributionRepositories, setContributionRepositories] = useState([]);
  const [contributionStreak, setContributionStreak] = useState(null);

  useEffect(() => {
    let active = true;
    const cacheKey = 'drj-github-activity-v3';
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
        setPullRequests(cached.pullRequests || []);
        setContributionRepositories(cached.contributionRepositories || []);
        setContributionStreak(cached.contributionStreak || null);
        setStatus('ready');
      }
    } catch (_error) {
      sessionStorage.removeItem(cacheKey);
    }

    const loadActivity = async () => {
      try {
        const repoResponse = await fetch('/api/github-activity');
        if (!repoResponse.ok) throw new Error('GitHub repos request failed');
        const activityData = await repoResponse.json();
        const repoData = activityData.repositories;

        if (active) {
          setRepositories(repoData);
          setCommits(activityData.commits);
          setPullRequests(activityData.pullRequests || []);
          setContributionRepositories(activityData.contributionRepositories || []);
          setContributionStreak(activityData.contributionStreak || null);
          setStatus('ready');
          sessionStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            repositories: repoData,
            commits: activityData.commits,
            contributionStreak: activityData.contributionStreak || null,
            pullRequests: activityData.pullRequests || [],
            contributionRepositories: activityData.contributionRepositories || []
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

  const visibleRepositories = withFeaturedProjects(repositories);
  const hasContent = status === 'ready';
  return (
    <section className="glass-panel github-panel" id="github" aria-labelledby="github-title">
      <div className="github-heading">
        <div>
          <p className="section-label">04 / Live GitHub work</p>
          <h2 id="github-title">Proof of work, updated live.</h2>
          <p className="github-intro">Projects, contributions, and pull requests are loaded from my public GitHub activity.</p>
        </div>
        <a className="github-profile-link" href="https://github.com/drj7zz" target="_blank" rel="noopener noreferrer">
          github.com/drj7zz <Icon className="fa-solid fa-arrow-up-right-from-square" />
        </a>
      </div>
      
      {contributionStreak && (
        <div className="streak-card" aria-label="GitHub contribution streak">
          <div><Icon className="fa-solid fa-fire-flame-curved" /><span>Contribution streak</span><small>All GitHub contributions, not only personal repository commits.</small></div>
          <strong>{contributionStreak.current}<small> day current</small></strong>
          <span className="streak-stat"><b>{contributionStreak.longest}</b> longest</span>
          <span className="streak-stat"><b>{contributionStreak.total}</b> contributions this year</span>
        </div>
      )}

      {status === 'error' ? (
        <p className="github-status">GitHub activity is temporarily unavailable. Visit the profile directly to see the latest work.</p>
      ) : (
        <div className="github-content">
          <div className="github-column">
            <h3>Recent Projects</h3>
            <div className="repo-list">
              {visibleRepositories.map((repo) => (
                <a className="repo-item" href={repo.html_url} target="_blank" rel="noopener noreferrer" key={repo.id}>
                  <span className="repo-copy">
                    <span className="repo-title"><Icon className="fa-solid fa-book-bookmark" /> {repo.name}</span>
                    <span className="repo-description">{repo.description || 'A featured project from my GitHub portfolio.'}</span>
                  </span>
                  <span className="repo-meta">
                    {repo.language || 'Code'}
                    {typeof repo.stargazers_count === 'number' && <><Icon className="fa-solid fa-star" /> {repo.stargazers_count}</>}
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div className="github-column commit-column">
            <h3>Commit History (By Repository)</h3>
            <div className="commit-list expanded-commits">
              {hasContent && commits.length > 0 ? (() => {
                const groupedCommits = {};
                commits.forEach(c => {
                  if (!groupedCommits[c.repository]) groupedCommits[c.repository] = [];
                  groupedCommits[c.repository].push(c);
                });
                return Object.entries(groupedCommits).map(([repoName, repoCommits]) => (
                  <div key={repoName} className="repo-commit-group">
                    <h4 className="repo-group-title"><Icon className="fa-brands fa-github-alt" /> {repoName}</h4>
                    {repoCommits.map(commit => (
                      <a className="commit-item timeline-item" href={commit.url} target="_blank" rel="noopener noreferrer" key={commit.id}>
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <span className="commit-message">
                            {commit.tag && <span className="release-badge"><Icon className="fa-solid fa-tag" /> {commit.tag}</span>}
                            {commit.message}
                          </span>
                          <span className="commit-meta">
                            v.{commit.version} • {new Date(commit.date).toLocaleDateString()}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                ));
              })() : <p className="github-status">{hasContent ? 'No recent public commits found.' : 'Loading recent commits...'}</p>}
            </div>
          </div>
        </div>
      )}
      {(pullRequests.length > 0 || contributionRepositories.length > 0) && (
        <div className="github-content contribution-content">
          <div className="github-column">
            <h3>Public Pull Requests</h3>
            <div className="commit-list expanded-commits">
              {pullRequests.map((pullRequest) => (
                <a className="commit-item" href={pullRequest.url} target="_blank" rel="noopener noreferrer" key={pullRequest.id}>
                  <span className="commit-message">{pullRequest.title}</span>
                  <span className="commit-meta">{pullRequest.repository} / {pullRequest.state}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="github-column">
            <h3>Public Contribution Repositories</h3>
            <div className="repo-list expanded-commits">
              {contributionRepositories.map((repository) => (
                <a className="repo-item" href={repository.url} target="_blank" rel="noopener noreferrer" key={repository.id}>
                  <span className="repo-title"><Icon className="fa-solid fa-code-branch" /> {repository.name}</span>
                  <span className="repo-meta">{repository.commits} commits / {repository.pullRequests} PRs</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('giridirghraj@gmail.com');
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 2200);
    } catch (_error) {
      window.location.href = 'mailto:giridirghraj@gmail.com';
    }
  };

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
          <a href="#career" onClick={closeMenu}>Career</a>
          <a href="#github" onClick={closeMenu}>GitHub</a>
          <a href="#connect" onClick={closeMenu}>Connect</a>
        </nav>
      </header>
      
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">Frontend developer / Nepal</p>
            <h1 id="hero-title">Interfaces with<br/><span>clarity and intent.</span></h1>
            <p className="hero-copy">I am DRJ, an emerging frontend developer focused on turning ideas into responsive, accessible web experiences. I combine a visual eye with practical JavaScript and a commitment to learning in public—ready to contribute thoughtful work to a real product team.</p>
            <div className="cta-row">
              <a className="button" href="#github">Explore my work <Icon className="fa-solid fa-arrow-right" /></a>
              <a className="button ghost" href="#connect"><Icon className="fa-solid fa-paper-plane" /> Start a conversation</a>
            </div>
            <div className="hero-signals" aria-label="Professional strengths">
              {heroSignals.map(([icon, label]) => (
                <span key={label}><Icon className={icon} /> {label}</span>
              ))}
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
              <p>Frontend developer · open-source contributor</p>
            </div>
            <div className="card-code">01 / MADHESH, NEPAL</div>
          </aside>
        </section>

        <LiveUpdates />

        <div className="content-grid">
          <section className="glass-panel section-panel" id="about" aria-labelledby="about-title">
            <p className="section-label">01 / About</p>
            <h2 id="about-title">Designed to be useful. Built to last.</h2>
            <p>I work where frontend engineering meets visual clarity. My goal is to create web interfaces that communicate quickly, adapt gracefully across devices, and remain easy for teams to evolve.</p>
            <p className="kaalyug-note"><strong>Founder of KAALYUG:</strong> an open web ecosystem in progress, exploring practical tools such as digital wallets, marketplaces, and open-source projects that make online systems more useful and accessible.</p>
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
            <h2 id="skills-title">Skills I am sharpening.</h2>
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

        <section className="glass-panel career-panel" id="career" aria-labelledby="career-title">
          <div className="career-intro">
            <p className="section-label">03 / Career direction</p>
            <h2 id="career-title">Growing into a dependable frontend partner.</h2>
            <p>I am building the foundation for a career in frontend development: thoughtful implementation, strong collaboration habits, and the confidence to take ownership of a user-facing experience.</p>
            <a className="text-link" href="#connect">Open to internships, junior roles, and collaboration <Icon className="fa-solid fa-arrow-right" /></a>
          </div>
          <div className="strength-list">
            {careerStrengths.map(([number, title, description]) => (
              <article className="strength" key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
        </section>

        <GitHubActivity />

        <section className="glass-panel connect" id="connect" aria-labelledby="connect-title">
          <div className="connect-orbit" aria-hidden="true"><Icon className="fa-solid fa-satellite-dish fa-lg" /></div>
          <div className="connect-copy">
            <p className="section-label">05 / Let us connect</p>
            <h2 id="connect-title">Let us build something useful.</h2>
            <p>I am open to junior frontend opportunities, internships, open-source work, and thoughtful collaborations.</p>
            <div className="connect-actions">
              <a className="email-action" href="mailto:giridirghraj@gmail.com"><Icon className="fa-solid fa-envelope" /> Send an email</a>
              <button className="copy-email" type="button" onClick={copyEmail}><Icon className={`fa-solid fa-${emailCopied ? 'check' : 'copy'}`} /> {emailCopied ? 'Email copied' : 'Copy email'}</button>
            </div>
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
                <span>{name}</span>
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
