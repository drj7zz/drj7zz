(() => {
  const { createElement: h, useState } = React;
  const root = ReactDOM.createRoot(document.getElementById('root'));

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
    return h('i', { className, 'aria-hidden': 'true' });
  }

  function GitHubActivity() {
    const [status, setStatus] = useState('loading');
    const [repositories, setRepositories] = useState([]);
    const [commits, setCommits] = useState([]);

    useEffect(() => {
      let active = true;
      const cacheKey = 'drj-github-activity-v1';
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
          const [repoResponse, eventResponse] = await Promise.all([
            fetch('https://api.github.com/users/drj7zz/repos?sort=updated&per_page=6'),
            fetch('https://api.github.com/users/drj7zz/events/public?per_page=30')
          ]);
          if (!repoResponse.ok || !eventResponse.ok) throw new Error('GitHub request failed');

          const repoData = await repoResponse.json();
          const eventData = await eventResponse.json();
          const commitData = eventData
            .filter((event) => event.type === 'PushEvent')
            .flatMap((event) => (event.payload.commits || []).map((commit) => ({
              id: `${event.id}-${commit.sha}`,
              message: commit.message.split('\n')[0],
              repository: event.repo.name,
              url: `https://github.com/${event.repo.name}/commit/${commit.sha}`,
              date: event.created_at
            })))
            .slice(0, 5);

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
    return h('section', { className: 'glass-panel github-panel', id: 'github', 'aria-labelledby': 'github-title' },
      h('div', { className: 'github-heading' },
        h('div', null, h('p', { className: 'section-label' }, '03 / GitHub'), h('h2', { id: 'github-title' }, 'Building in public.')),
        h('a', { className: 'github-profile-link', href: 'https://github.com/drj7zz', target: '_blank', rel: 'noopener noreferrer' }, 'github.com/drj7zz ', h(Icon, { className: 'fa-solid fa-arrow-up-right-from-square' }))
      ),
      status === 'error'
        ? h('p', { className: 'github-status' }, 'GitHub activity is temporarily unavailable. Visit the profile directly to see the latest work.')
        : h('div', { className: 'github-content' },
          h('div', { className: 'github-column' },
            h('h3', null, 'Recent Projects'),
            h('div', { className: 'repo-list' },
              hasContent ? repositories.map((repo) => h('a', { className: 'repo-item', href: repo.html_url, target: '_blank', rel: 'noopener noreferrer', key: repo.id },
                h('span', { className: 'repo-title' }, h(Icon, { className: 'fa-solid fa-book-bookmark' }), repo.name),
                h('span', { className: 'repo-meta' }, repo.language || 'Code', ' ', h(Icon, { className: 'fa-solid fa-star' }), ' ', repo.stargazers_count)
              )) : h('p', { className: 'github-status' }, 'Loading projects...')
            )
          ),
          h('div', { className: 'github-column commit-column' },
            h('h3', null, 'Latest Commits'),
            h('div', { className: 'commit-list' },
              hasContent && commits.length > 0 ? commits.map((commit) => h('a', { className: 'commit-item', href: commit.url, target: '_blank', rel: 'noopener noreferrer', key: commit.id },
                h('span', { className: 'commit-message' }, commit.message),
                h('span', { className: 'commit-meta' }, commit.repository, ' / ', new Date(commit.date).toLocaleDateString())
              )) : h('p', { className: 'github-status' }, hasContent ? 'No recent public commits found.' : 'Loading recent commits...')
            )
          )
        )
    );
  }

  function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    return h('div', { className: 'page-shell' },
      h('header', { className: 'nav', 'aria-label': 'Primary navigation' },
        h('a', { className: 'brand', href: '#top', 'aria-label': 'DRJ home' }, h('img', { className: 'brand-mark', src: 'assets/images/logo.png', alt: '' }), ' KAALYUG'),
        h('button', { className: 'nav-toggle', type: 'button', 'aria-label': 'Toggle navigation', 'aria-expanded': menuOpen, onClick: () => setMenuOpen(!menuOpen) }, h(Icon, { className: `fa-solid fa-${menuOpen ? 'xmark' : 'bars'}` })),
        h('nav', { className: `nav-links${menuOpen ? ' open' : ''}`, 'aria-label': 'Portfolio sections' },
          h('a', { href: '#about', onClick: closeMenu }, 'About'), h('a', { href: '#skills', onClick: closeMenu }, 'Focus'), h('a', { href: '#connect', onClick: closeMenu }, 'Connect')
        )
      ),
      h('main', { id: 'top' },
        h('section', { className: 'hero', 'aria-labelledby': 'hero-title' },
          h('div', null,
            h('p', { className: 'eyebrow' }, 'Frontend developer / Nepal'),
            h('h1', { id: 'hero-title' }, 'Building clear', h('br'), h('span', null, 'digital surfaces.')),
            h('p', { className: 'hero-copy' }, 'I am DRJ, a developer learning in public and building thoughtful interfaces for the open web. I care about responsive detail, accessible interaction, and code that stays understandable.'),
            h('div', { className: 'cta-row' }, h('a', { className: 'button', href: '#connect' }, 'Connect with me ', h(Icon, { className: 'fa-solid fa-arrow-right' })), h('a', { className: 'button ghost', href: 'https://github.com/drj7zz', target: '_blank', rel: 'noopener noreferrer' }, h(Icon, { className: 'fa-brands fa-github' }), ' View GitHub'))
          ),
          h('aside', { className: 'glass-panel identity-card', 'aria-label': 'Profile summary' },
            h('div', { className: 'card-top' }, h('div', { className: 'avatar-wrap' }, h('span', { className: 'avatar-crop' }, h('img', { className: 'avatar', src: 'assets/images/drj.png', alt: 'DRJ profile' }))), h('span', { className: 'availability' }, h('i'), ' Available to collaborate')),
            h('div', null, h('h2', null, 'DRJ'), h('p', null, 'Developer, learner, open-source enthusiast.')),
            h('div', { className: 'card-code' }, '01 / MADHESH, NEPAL')
          )
        ),
        h('div', { className: 'content-grid' },
          h('section', { className: 'glass-panel section-panel', id: 'about', 'aria-labelledby': 'about-title' },
            h('p', { className: 'section-label' }, '01 / About'), h('h2', { id: 'about-title' }, 'Making the web feel considered.'), h('p', null, 'I work at the intersection of frontend development and visual design. My current focus is building polished web experiences while deepening my JavaScript and open-source practice.'),
            h('div', { className: 'facts' }, facts.map(([label, lines]) => h('div', { className: 'fact', key: label }, h('span', null, label), h('strong', null, lines[0], h('br'), lines[1]))))
          ),
          h('section', { className: 'glass-panel section-panel', id: 'skills', 'aria-labelledby': 'skills-title' },
            h('p', { className: 'section-label' }, '02 / Focus'), h('h2', { id: 'skills-title' }, 'What I am working on.'),
            h('div', { className: 'skill-list' }, skills.map(([icon, title, description, level]) => h('article', { className: 'skill', key: title }, h('span', { className: 'skill-icon' }, h(Icon, { className: icon })), h('div', null, h('h3', null, title), h('p', null, description)), h('span', { className: 'skill-level' }, level))))
          )
        ),
        h('section', { className: 'glass-panel connect', id: 'connect', 'aria-labelledby': 'connect-title' },
          h(Icon, { className: 'fa-solid fa-satellite-dish fa-lg' }), h('div', null, h('h2', { id: 'connect-title' }, 'Let us build something useful.'), h('p', null, 'Find me on the platforms below or send an email.')),
          h('div', { className: 'socials', 'aria-label': 'Social links' }, socialLinks.map(({ name, url, icon }) => h('a', { className: 'social', href: url, 'aria-label': name, title: name, key: name, ...(url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' }) }, h(Icon, { className: icon }))))
        )
      ),
      h('footer', { className: 'footer' }, 'DRJ / KAALYUG / 2026')
    );
  }

  root.render(h(App));
})();
