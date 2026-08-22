const GITHUB_API = 'https://api.github.com';
const USERNAME = 'drj7zz';
let lastSuccessfulActivity = null;

async function githubFetch(path) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'drj-portfolio'
    }
  });

  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  return response.json();
}

async function githubGraphql(query, variables) {
  const response = await fetch(`${GITHUB_API}/graphql`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'drj-portfolio'
    },
    body: JSON.stringify({ query, variables })
  });
  const payload = await response.json();
  if (!response.ok || payload.errors) throw new Error('GitHub GraphQL request failed');
  return payload.data;
}

const CONTRIBUTIONS_QUERY = `
  query ContributionRepositories($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { contributionCount date } }
        }
        commitContributionsByRepository(maxRepositories: 100) {
          repository { id nameWithOwner url isPrivate primaryLanguage { name } stargazerCount }
          contributions(first: 1) { totalCount }
        }
        pullRequestContributionsByRepository(maxRepositories: 100) {
          repository { id nameWithOwner url isPrivate primaryLanguage { name } stargazerCount }
          contributions(first: 1) { totalCount }
        }
      }
    }
  }
`;

function getContributionStreak(calendar) {
  if (!calendar) return null;
  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  let longest = 0;
  let running = 0;

  days.forEach((day) => {
    running = day.contributionCount > 0 ? running + 1 : 0;
    longest = Math.max(longest, running);
  });

  let current = 0;
  for (let index = days.length - 1; index >= 0 && days[index].contributionCount > 0; index -= 1) {
    current += 1;
  }

  return { current, longest, total: calendar.totalContributions };
}

export default async function handler(_request, response) {
  if (!process.env.GITHUB_TOKEN) {
    return response.status(503).json({ error: 'GitHub activity is not configured.' });
  }

  try {
    const [allRepositories, pullRequestSearch, contributionData] = await Promise.all([
      githubFetch(`/users/${USERNAME}/repos?sort=updated&per_page=100`),
      githubFetch(`/search/issues?q=${encodeURIComponent(`author:${USERNAME} is:pr`)}&sort=updated&order=desc&per_page=100`),
      githubGraphql(CONTRIBUTIONS_QUERY, { login: USERNAME }).catch(() => null)
    ]);
    const repositories = allRepositories.filter((repository) => !repository.private);
    const topRepositories = repositories.slice(0, 3);

    const activity = await Promise.all(topRepositories.map(async (repository) => {
      const [commits, tags] = await Promise.all([
        githubFetch(`/repos/${USERNAME}/${repository.name}/commits?per_page=5`),
        githubFetch(`/repos/${USERNAME}/${repository.name}/tags?per_page=100`)
      ]);
      const tagsByCommit = Object.fromEntries(tags.map((tag) => [tag.commit.sha, tag.name]));

      return commits.map((commit) => ({
        id: commit.sha,
        message: commit.commit.message.split('\n')[0],
        repository: `${USERNAME}/${repository.name}`,
        url: commit.html_url,
        date: commit.commit.author.date,
        version: commit.sha.substring(0, 7),
        tag: tagsByCommit[commit.sha] || null
      }));
    }));

    const commits = activity.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestCommit = commits[0] || null;
    const pullRequests = (pullRequestSearch.items || [])
      .filter((pullRequest) => pullRequest.repository && !pullRequest.repository.private)
      .map((pullRequest) => ({
        id: pullRequest.id,
        title: pullRequest.title,
        url: pullRequest.html_url,
        repository: pullRequest.repository.full_name,
        state: pullRequest.state,
        updatedAt: pullRequest.updated_at
      }));
    const contributionRepositories = new Map();
    const contributionGroups = contributionData?.user?.contributionsCollection;
    const contributionStreak = getContributionStreak(contributionGroups?.contributionCalendar);
    ['commitContributionsByRepository', 'pullRequestContributionsByRepository'].forEach((type) => {
      contributionGroups?.[type]?.forEach(({ repository, contributions }) => {
        if (repository.isPrivate) return;
        const current = contributionRepositories.get(repository.id) || {
          id: repository.id,
          name: repository.nameWithOwner,
          url: repository.url,
          language: repository.primaryLanguage?.name || 'Code',
          stars: repository.stargazerCount,
          commits: 0,
          pullRequests: 0
        };
        if (type === 'commitContributionsByRepository') current.commits += contributions.totalCount;
        else current.pullRequests += contributions.totalCount;
        contributionRepositories.set(repository.id, current);
      });
    });

    lastSuccessfulActivity = {
      repositories,
      commits,
      latestCommit,
      contributionStreak,
      contributionCalendar: contributionGroups?.contributionCalendar || null,
      pullRequests,
      contributionRepositories: [...contributionRepositories.values()].sort((a, b) => (b.commits + b.pullRequests) - (a.commits + a.pullRequests))
    };
    response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return response.status(200).json(lastSuccessfulActivity);
  } catch (error) {
    console.error('Unable to load GitHub activity:', error);
    if (lastSuccessfulActivity) {
      response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=3600');
      return response.status(200).json(lastSuccessfulActivity);
    }
    return response.status(502).json({ error: 'GitHub activity is temporarily unavailable.' });
  }
}
