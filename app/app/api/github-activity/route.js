export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const GITHUB_API = 'https://api.github.com';
const USERNAME = 'drj7zz';
let lastSuccessfulActivity = null;

async function githubFetch(path) {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'drj-portfolio'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${GITHUB_API}${path}`, {
    headers,
    next: { revalidate: 300 }
  });

  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  return response.json();
}

async function githubGraphql(query, variables) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const response = await fetch(`${GITHUB_API}/graphql`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'drj-portfolio'
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }
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

export async function GET() {
  try {
    const [allRepositories, pullRequestSearch, contributionData] = await Promise.all([
      githubFetch(`/users/${USERNAME}/repos?sort=updated&per_page=100`).catch(() => []),
      githubFetch(`/search/issues?q=${encodeURIComponent(`author:${USERNAME} is:pr`)}&sort=updated&order=desc&per_page=100`).catch(() => ({ items: [] })),
      githubGraphql(CONTRIBUTIONS_QUERY, { login: USERNAME }).catch(() => null)
    ]);

    const repositories = (Array.isArray(allRepositories) ? allRepositories : []).filter((r) => !r.private);
    const topRepositories = repositories.slice(0, 4);

    const activity = await Promise.all(topRepositories.map(async (repository) => {
      try {
        const commits = await githubFetch(`/repos/${USERNAME}/${repository.name}/commits?per_page=5`);
        if (!Array.isArray(commits)) return [];
        return commits.map((commit) => ({
          id: commit.sha,
          message: commit.commit.message.split('\n')[0],
          repository: `${USERNAME}/${repository.name}`,
          url: commit.html_url,
          date: commit.commit.author.date,
          version: commit.sha.substring(0, 7)
        }));
      } catch (_err) {
        return [];
      }
    }));

    const commits = activity.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
    const contributionGroups = contributionData?.user?.contributionsCollection;
    const contributionStreak = getContributionStreak(contributionGroups?.contributionCalendar);

    lastSuccessfulActivity = {
      repositories,
      commits,
      contributionStreak,
      contributionCalendar: contributionGroups?.contributionCalendar || null
    };

    return NextResponse.json(lastSuccessfulActivity, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
      }
    });
  } catch (error) {
    console.error('GitHub API route error:', error);
    if (lastSuccessfulActivity) {
      return NextResponse.json(lastSuccessfulActivity);
    }
    return NextResponse.json({ error: 'GitHub activity temporarily unavailable.' }, { status: 502 });
  }
}
