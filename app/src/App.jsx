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

const featuredProjects = [
  { id: 'featured-mycontribution', name: 'MyContribution', html_url: 'https://github.com/drj7zz?tab=repositories&q=MyContribution', language: 'Featured project' },
  { id: 'featured-pillrequest', name: 'PillRequest', html_url: 'https://github.com/drj7zz?tab=repositories&q=PillRequest', language: 'Featured project' },
  { id: 'featured-collaboration-fepo', name: 'Collaboration FEPO', html_url: 'https://github.com/drj7zz?tab=repositories&q=Collaboration+FEPO', language: 'Featured collaboration' }
];

const projects = [
  { name: 'KAALYUG OS', description: 'An interactive desktop-inspired portfolio experience.', stack: 'JavaScript', code: 'https://github.com/drj7zz/giridirghraj', live: 'https://giridirghraj.vercel.app' },
  { name: 'KAALYUG', description: 'A TypeScript project exploring the KAALYUG web ecosystem.', stack: 'TypeScript', code: 'https://github.com/drj7zz/kaalyug', live: 'https://kaalyug.vercel.app' },
  { name: 'YugCoin', description: 'A transparent digital wallet interface with a double-entry ledger.', stack: 'JavaScript', code: 'https://github.com/drj7zz/yugcoin', live: 'https://yugcoin.vercel.app' },
  { name: 'Quiz Game', description: 'A focused browser quiz game built with JavaScript.', stack: 'JavaScript', code: 'https://github.com/drj7zz/quiz-game' }
];

const blogPosts = [
  {
    id: 'why-frontend',
    title: 'Why I Chose Frontend Development',
    date: '2026-07-15',
    readTime: '4 min read',
    tags: ['Career', 'Frontend'],
    excerpt: 'The moment I saw a browser turn my code into something visual and interactive, I knew frontend was where I belonged.',
    content: `When I first started learning to code, I wasn't sure which path to take. Backend, data science, mobile development — they all sounded interesting. But the moment I opened a browser, wrote a few lines of HTML and CSS, and watched a page come to life — that was it.

Frontend development isn't just about making things look good. It's the layer where human intention meets technology. Every button placement, every transition, every responsive breakpoint is a decision that affects how someone experiences a product. That responsibility excites me.

What drew me in specifically was the immediacy of feedback. You write code, you see results. You tweak a value, you see the change. This tight loop between action and outcome makes frontend development feel like a craft — something you can continuously refine.

I'm currently deepening my JavaScript fundamentals, learning about accessibility patterns, and exploring how great interfaces guide users without them even noticing. Nepal's tech scene is growing, and I want to be part of building the web experiences that define it.

The journey is early, but the direction is clear. Frontend is where I build, learn, and contribute.`
  },
  {
    id: 'accessible-ui',
    title: 'Building Accessible UIs from Day One',
    date: '2026-07-28',
    readTime: '5 min read',
    tags: ['Accessibility', 'Best Practices'],
    excerpt: 'Accessibility isn\'t an afterthought — it\'s a design constraint that makes every interface better for everyone.',
    content: `Too many developers treat accessibility as a checklist to complete before launch. I think that's backwards. Accessibility should be a design constraint from the very first line of code, not a final coat of paint.

Here's what I've learned so far:

**Semantic HTML is your foundation.** Before reaching for \`div\` and \`span\`, ask whether a \`button\`, \`nav\`, \`article\`, or \`section\` would communicate the same meaning to a screen reader. Most of the time, the answer is yes — and it costs you nothing.

**Color contrast matters more than you think.** I started testing every color combination I use against WCAG AA standards. It changed how I think about palettes entirely. A beautiful design that half your users can't read isn't beautiful — it's broken.

**Keyboard navigation is non-negotiable.** If a user can't tab through your interface and interact with every element, you've locked people out. I test every component I build by putting my mouse away and using only the keyboard.

**ARIA labels are your friend, not a crutch.** Use them when native semantics aren't enough, but don't over-use them. A \`button\` with clear text content doesn't need an \`aria-label\` — that's redundant and can actually confuse assistive technologies.

The beauty of building with accessibility in mind from the start is that it usually results in cleaner, more semantic code. It forces you to think about structure before style, which is exactly the right order.

I'm still learning, but I've made it a rule: if it's not accessible, it's not done.`
  },
  {
    id: 'first-pr',
    title: 'Lessons from My First Open Source PR',
    date: '2026-08-05',
    readTime: '6 min read',
    tags: ['Open Source', 'Git'],
    excerpt: 'Contributing to open source for the first time taught me more about collaboration, git, and code review than any tutorial ever could.',
    content: `I remember the anxiety of opening my first pull request on a public repository. What if my code is terrible? What if I break something? What if the maintainers think I'm wasting their time?

None of those things happened. Here's what actually happened, and what I learned.

**Reading code is a skill.** Before writing a single line, I spent hours reading the existing codebase. Understanding the patterns, conventions, and architecture of a project taught me more than building my own projects from scratch ever did. You start to see why experienced developers make certain choices.

**Git hygiene matters.** My first attempt had messy commit messages and too many changes in one commit. I learned to write clear, descriptive commit messages and to keep each commit focused on a single logical change. \`git rebase -i\` became my best friend.

**The review process is where growth happens.** The maintainer's feedback on my PR was detailed and kind. They pointed out edge cases I hadn't considered, suggested a more idiomatic way to write a particular function, and explained their reasoning. That single code review was worth weeks of self-study.

**Small contributions have big impact.** My PR wasn't a massive feature addition — it was a documentation improvement and a small bug fix. But it mattered. It made the project slightly better, and it gave me the confidence to contribute again.

**The community is welcoming.** The open source community, at its best, is remarkably generous with knowledge and encouragement. Most maintainers genuinely appreciate contributions, even from newcomers.

Since that first PR, I've made contributing to open source a regular part of my learning practice. Each contribution teaches me something new about collaboration, code quality, and the kinds of problems real-world projects face.

If you're hesitating to make your first contribution — stop hesitating. Find a project you use, look for "good first issue" labels, and just start.`
  },
  {
    id: 'event-delegation',
    title: 'Understanding JavaScript Event Delegation',
    date: '2026-08-12',
    readTime: '5 min read',
    tags: ['JavaScript', 'Performance'],
    excerpt: 'Event delegation is one of those JavaScript patterns that seems simple on the surface but reveals deep truths about how the DOM actually works.',
    content: `One of the most elegant patterns in JavaScript is event delegation, and understanding it well can transform how you write frontend code.

**The problem it solves.** Imagine a list with 500 items, each needing a click handler. Attaching 500 individual event listeners is expensive — it consumes memory, slows down rendering, and makes dynamic content (adding/removing items) painful to manage.

**How it works.** Instead of attaching a listener to each item, you attach a single listener to the parent container. When an event fires on a child element, it "bubbles" up through the DOM tree. The parent catches it and uses \`event.target\` to determine which child triggered it.

\`\`\`javascript
document.querySelector('.item-list').addEventListener('click', (event) => {
  const item = event.target.closest('.item');
  if (!item) return;
  handleItemClick(item);
});
\`\`\`

**Why \`closest()\` matters.** The \`event.target\` might be a nested element inside your item (like a span or icon). Using \`event.target.closest('.item')\` traverses up the DOM to find the actual element you care about, making the pattern robust regardless of internal markup.

**Performance benefits are real.** With delegation, you have one listener instead of hundreds. This matters especially in single-page applications where DOM nodes are frequently created and destroyed. No need to manually add and remove listeners as content changes.

**It works with dynamically added content.** Since the listener is on the parent (which stays in the DOM), any new children automatically participate in the delegation. This is particularly powerful with frameworks that dynamically render lists.

**When NOT to use it.** Some events don't bubble (like \`focus\`, \`blur\`, \`scroll\`). For these, you'll need direct listeners or their bubbling alternatives (\`focusin\`, \`focusout\`). Also, if you have a small, static list, direct listeners are perfectly fine — don't over-engineer.

Event delegation is one of those patterns where understanding the "why" makes you a better developer overall. It teaches you about event propagation, DOM traversal, and performance thinking — fundamentals that apply to every frontend project.`
  },
  {
    id: 'design-process',
    title: 'From Idea to Interface: My Design Process',
    date: '2026-08-18',
    readTime: '4 min read',
    tags: ['Design', 'Workflow'],
    excerpt: 'How I go from a vague idea to a polished interface — a structured process that keeps projects focused and prevents scope creep.',
    content: `Every project starts the same way for me: a vague idea and a blank screen. Over time, I've developed a process that turns that blank screen into a working interface without getting lost along the way.

**Step 1: Define the core interaction.** Before any design or code, I ask: what is the ONE thing a user should be able to do? For YugCoin, it was "check a wallet balance." For the Quiz Game, it was "answer a question and see if you're right." Everything else is secondary.

**Step 2: Paper sketch first.** I sketch layouts on paper — rough boxes, arrows, basic flow. This takes 10 minutes and saves hours of rework. Paper doesn't let you get distracted by colors or fonts. It forces you to think about structure and flow.

**Step 3: Build the skeleton in HTML.** Semantic HTML first, no styling. Just the structure. If the page makes sense when you read the raw HTML, you've got a solid foundation. If it doesn't, no amount of CSS will fix the underlying confusion.

**Step 4: Layer in styles systematically.** I start with typography and spacing — the two elements that do 80% of the visual work. Then colors and borders. Then interactive states (hover, focus, active). Finally, animations and transitions. This order prevents the common mistake of making something "look nice" before it "works well."

**Step 5: Test with real content.** Placeholder text and dummy data hide problems. I use real content as early as possible. Real headlines are different lengths. Real descriptions break layouts. Real data reveals edge cases that "Lorem ipsum" never will.

**Step 6: Get feedback, then iterate.** I show the work to someone who hasn't been staring at it for hours. Fresh eyes catch things I've become blind to — confusing labels, unclear navigation, interactions that feel wrong.

This process isn't perfect, and I'm still refining it. But having a process — any process — is better than opening VS Code and hoping for inspiration. Structure creates creativity, not the other way around.`
  }
];

function withFeaturedProjects(repositories) {
  const repositoryNames = new Set(repositories.map(({ name }) => name.toLowerCase()));
  return [...featuredProjects.filter(({ name }) => !repositoryNames.has(name.toLowerCase())), ...repositories];
}

function Icon({ className }) {
  return <i className={className} aria-hidden="true" />;
}

function ContributionGraph() {
  const [calendar, setCalendar] = useState(null);
  const [streak, setStreak] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    fetch('/api/github-activity')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => {
        setCalendar(data.contributionCalendar || null);
        setStreak(data.contributionStreak || null);
      })
      .catch(() => {});
  }, []);

  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const monthLabels = [];
  let lastMonth = -1;

  if (calendar) {
    const recentWeeks = calendar.weeks.slice(-26);
    recentWeeks.forEach((week, weekIndex) => {
      const firstDay = new Date(week.contributionDays[0].date);
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: firstDay.toLocaleString('default', { month: 'short' }), index: weekIndex });
        lastMonth = month;
      }
    });
  }

  const recentWeeks = calendar ? calendar.weeks.slice(-26) : [];

  return (
    <section className="glass-panel contribution-section" id="activity" aria-labelledby="contribution-title">
      <div className="contribution-heading">
        <div>
          <p className="section-label">06 / GitHub activity</p>
          <h2 id="contribution-title">Contributions, tracked live.</h2>
          <p className="contribution-intro">My GitHub contribution graph — pulled live from the GitHub API.</p>
        </div>
        <a className="github-profile-link" href="https://github.com/drj7zz" target="_blank" rel="noopener noreferrer">github.com/drj7zz <Icon className="fa-solid fa-arrow-up-right-from-square" /></a>
      </div>

      {streak && (
        <div className="streak-stats">
          <div className="streak-stat-item">
            <strong>{streak.total}</strong>
            <span>contributions this year</span>
          </div>
          <div className="streak-stat-item">
            <strong>{streak.current}</strong>
            <span>day current streak</span>
          </div>
          <div className="streak-stat-item">
            <strong>{streak.longest}</strong>
            <span>day longest streak</span>
          </div>
        </div>
      )}

      {calendar ? (
        <div className="graph-container">
          <div className="graph-months">
            {monthLabels.map(({ label, index }) => (
              <span key={`${label}-${index}`} style={{ gridColumnStart: index + 1 }}>{label}</span>
            ))}
          </div>
          <div className="graph-wrapper">
            <div className="graph-days-label">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            <div className="graph-grid" onMouseLeave={() => setTooltip(null)}>
              {recentWeeks.map((week, weekIndex) => (
                <div className="graph-column" key={weekIndex}>
                  {week.contributionDays.map((day) => (
                    <div
                      key={day.date}
                      className={`graph-cell level-${getLevel(day.contributionCount)}`}
                      onMouseEnter={(e) => {
                        const rect = e.target.getBoundingClientRect();
                        setTooltip({ count: day.contributionCount, date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }), x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="graph-legend">
            <span>Less</span>
            <div className="graph-cell level-0" />
            <div className="graph-cell level-1" />
            <div className="graph-cell level-2" />
            <div className="graph-cell level-3" />
            <div className="graph-cell level-4" />
            <span>More</span>
          </div>
          {tooltip && (
            <div className="graph-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
              <strong>{tooltip.count} contribution{tooltip.count !== 1 ? 's' : ''}</strong> on {tooltip.date}
            </div>
          )}
        </div>
      ) : (
        <p className="github-status">Loading contribution data…</p>
      )}
    </section>
  );
}

function BlogSection() {
  const [expandedPost, setExpandedPost] = useState(null);

  const togglePost = (id) => {
    setExpandedPost(expandedPost === id ? null : id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="blog-section" id="blog" aria-labelledby="blog-title">
      <div className="blog-intro">
        <p className="section-label">05 / Blog</p>
        <h2 id="blog-title">Thinking out loud about the web.</h2>
        <p>Notes on frontend development, open source, and the learning process — written as I go.</p>
      </div>
      <div className="blog-list">
        {blogPosts.map((post) => (
          <article className={`blog-card${expandedPost === post.id ? ' expanded' : ''}`} key={post.id}>
            <div className="blog-card-header" onClick={() => togglePost(post.id)} role="button" tabIndex={0} aria-expanded={expandedPost === post.id} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePost(post.id); } }}>
              <div className="blog-card-meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span className="blog-read-time"><Icon className="fa-regular fa-clock" /> {post.readTime}</span>
              </div>
              <h3>{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <div className="blog-card-footer">
                <div className="blog-tags">
                  {post.tags.map(tag => <span className="blog-tag" key={tag}>{tag}</span>)}
                </div>
                <span className="blog-toggle">
                  {expandedPost === post.id ? 'Close' : 'Read more'} <Icon className={`fa-solid fa-chevron-${expandedPost === post.id ? 'up' : 'down'}`} />
                </span>
              </div>
            </div>
            {expandedPost === post.id && (
              <div className="blog-content">
                {post.content.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('```')) {
                    const lines = paragraph.split('\n');
                    const code = lines.slice(1, -1).join('\n');
                    return <pre key={i}><code>{code}</code></pre>;
                  }
                  const formatted = paragraph
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>');
                  return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
                })}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function GitHubActivity() {
  const [status, setStatus] = useState('loading');
  const [repositories, setRepositories] = useState([]);
  const [commits, setCommits] = useState([]);

  useEffect(() => {
    let active = true;
    const cacheKey = 'drj-github-activity-v3';
    const cacheDuration = 300000;
    let hasCachedActivity = false;

    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey));
      hasCachedActivity = Boolean(cached);
      if (cached) {
        setRepositories(cached.repositories || []);
        setCommits(cached.commits || []);
        setStatus('ready');
      }
      if (cached && Date.now() - cached.timestamp < cacheDuration) return undefined;
    } catch (_error) {
      sessionStorage.removeItem(cacheKey);
    }

    fetch('/api/github-activity')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('GitHub activity request failed')))
      .then(data => {
        if (!active) return;
        const nextActivity = { timestamp: Date.now(), repositories: data.repositories || [], commits: data.commits || [] };
        setRepositories(nextActivity.repositories);
        setCommits(nextActivity.commits);
        setStatus('ready');
        sessionStorage.setItem(cacheKey, JSON.stringify(nextActivity));
      })
      .catch(() => active && !hasCachedActivity && setStatus('error'));

    return () => { active = false; };
  }, []);

  const visibleRepositories = withFeaturedProjects(repositories).slice(0, 5);
  return (
    <section className="glass-panel github-panel" id="github" aria-labelledby="github-title">
      <div className="github-heading">
        <div>
          <p className="section-label">Selected work</p>
          <h2 id="github-title">A focused view of my GitHub work.</h2>
          <p className="github-intro">A small selection of projects and recent public activity.</p>
        </div>
        <a className="github-profile-link" href="https://github.com/drj7zz" target="_blank" rel="noopener noreferrer">github.com/drj7zz <Icon className="fa-solid fa-arrow-up-right-from-square" /></a>
      </div>
      {status === 'error' ? <p className="github-status">GitHub activity is temporarily unavailable. Visit the profile directly to see the latest work.</p> : (
        <div className="github-content">
          <div className="github-column">
            <h3>Projects</h3>
            <div className="repo-list">
              {visibleRepositories.map(repo => (
                <a className="repo-item" href={repo.html_url} target="_blank" rel="noopener noreferrer" key={repo.id}>
                  <span className="repo-copy"><span className="repo-title"><Icon className="fa-solid fa-book-bookmark" /> {repo.name}</span><span className="repo-description">{repo.description || 'A featured project from my GitHub portfolio.'}</span></span>
                  <span className="repo-meta">{repo.language || 'Code'}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="github-column">
            <h3>Recent activity</h3>
            <div className="commit-list">
              {status === 'ready' && commits.length > 0 ? commits.slice(0, 5).map(commit => (
                <a className="commit-item" href={commit.url} target="_blank" rel="noopener noreferrer" key={commit.id}>
                  <span className="commit-message">{commit.message}</span>
                  <span className="commit-meta">{commit.repository} · {new Date(commit.date).toLocaleDateString()}</span>
                </a>
              )) : <p className="github-status">{status === 'ready' ? 'No recent public activity found.' : 'Loading recent activity...'}</p>}
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
          <a href="#projects" onClick={closeMenu}>Projects</a>
          <a href="#blog" onClick={closeMenu}>Blog</a>
          <a href="#activity" onClick={closeMenu}>GitHub</a>
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
              <a className="button" href="#about">Learn about me <Icon className="fa-solid fa-arrow-right" /></a>
              <a className="button ghost" href="#connect"><Icon className="fa-solid fa-paper-plane" /> Start a conversation</a>
            </div>
            <div className="hero-signals" aria-label="Professional strengths">
              {heroSignals.map(([icon, label]) => (
                <span key={label}><Icon className={icon} /> {label}</span>
              ))}
            </div>
          </div>
          <figure className="hero-portrait">
            <img src="/assets/images/profile.jpg" alt="DRJ, frontend developer" />
            <figcaption>DRJ — Frontend developer based in Nepal</figcaption>
          </figure>
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

        <div className="content-grid">
          <section className="section-panel" id="about" aria-labelledby="about-title">
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
          
          <section className="section-panel" id="skills" aria-labelledby="skills-title">
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

        <section className="career-panel" id="career" aria-labelledby="career-title">
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

        <section className="projects-section" id="projects" aria-labelledby="projects-title">
          <div className="projects-intro">
            <p className="section-label">04 / Selected projects</p>
            <h2 id="projects-title">Work I have built and continue to improve.</h2>
            <p>Each project reflects my interest in thoughtful interfaces, practical web tools, and learning through building in public.</p>
          </div>
          <div className="project-list">
            {projects.map((project, index) => (
              <article className="project" key={project.name}>
                <span className="project-number">0{index + 1}</span>
                <div><h3>{project.name}</h3><p>{project.description}</p></div>
                <span className="project-stack">{project.stack}</span>
                <div className="project-links">
                  {project.live && <a href={project.live} target="_blank" rel="noopener noreferrer">Live site <Icon className="fa-solid fa-arrow-up-right-from-square" /></a>}
                  <a href={project.code} target="_blank" rel="noopener noreferrer">Source <Icon className="fa-brands fa-github" /></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <BlogSection />

        <ContributionGraph />

        <section className="connect" id="connect" aria-labelledby="connect-title">
          <div className="connect-orbit" aria-hidden="true"><Icon className="fa-solid fa-satellite-dish fa-lg" /></div>
          <div className="connect-copy">
            <p className="section-label">Let us connect</p>
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
