export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const GITHUB_API = 'https://api.github.com';
const USERNAME = 'drj7zz';
let lastSuccessfulActivity = null;

async function fetchLiveContributions(username) {
  // Strategy 1: Public live GitHub contributions microservice
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      headers: { 'User-Agent': 'drj-portfolio' },
      next: { revalidate: 300 }
    });
    if (res.ok) {
      const data = await res.json();
      const rawDays = data.contributions || [];
      if (rawDays.length > 0) {
        const weeks = [];
        let currentWeek = [];
        let totalCount = 0;

        rawDays.forEach((day) => {
          const count = Number(day.count) || 0;
          totalCount += count;
          currentWeek.push({
            date: day.date,
            contributionCount: count
          });
          if (currentWeek.length === 7) {
            weeks.push({ contributionDays: currentWeek });
            currentWeek = [];
          }
        });

        if (currentWeek.length > 0) {
          weeks.push({ contributionDays: currentWeek });
        }

        return {
          totalContributions: data.total?.lastYear || totalCount,
          weeks
        };
      }
    }
  } catch (err) {
    console.warn('Strategy 1 contributions fetch failed, trying strategy 2:', err?.message || err);
  }

  // Strategy 2: Direct parse from github.com/users/:username/contributions
  try {
    const res = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html'
      },
      next: { revalidate: 300 }
    });
    if (res.ok) {
      const html = await res.text();
      const cellMatches = [...html.matchAll(/data-date="([^"]+)"[^>]*data-level="([^"]+)"/g)];
      if (cellMatches.length > 0) {
        const weeks = [];
        let currentWeek = [];
        let totalCount = 0;

        cellMatches.forEach((m) => {
          const date = m[1];
          const level = parseInt(m[2], 10) || 0;
          const count = level > 0 ? (level <= 2 ? level : level * 2) : 0;
          totalCount += count;

          currentWeek.push({
            date,
            contributionCount: count
          });

          if (currentWeek.length === 7) {
            weeks.push({ contributionDays: currentWeek });
            currentWeek = [];
          }
        });

        if (currentWeek.length > 0) {
          weeks.push({ contributionDays: currentWeek });
        }

        return {
          totalContributions: totalCount,
          weeks
        };
      }
    }
  } catch (err) {
    console.warn('Strategy 2 contributions parse failed:', err?.message || err);
  }

  return null;
}

async function fetchPublicRepositories(username) {
  // Strategy 1: GitHub REST API
  try {
    const data = await githubFetch(`/users/${username}/repos?sort=updated&per_page=100`);
    if (Array.isArray(data) && data.length > 0) {
      return data
        .filter((r) => !r.private && !r.fork)
        .map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description || '',
          html_url: r.html_url,
          language: r.language || 'Code',
          stargazers_count: r.stargazers_count || 0
        }));
    }
  } catch (err) {
    console.warn('Strategy 1 repos fetch failed:', err?.message || err);
  }

  // Strategy 2: Direct parse from github.com/:username?tab=repositories
  try {
    const res = await fetch(`https://github.com/${username}?tab=repositories`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html'
      },
      next: { revalidate: 300 }
    });
    if (res.ok) {
      const html = await res.text();
      const re = new RegExp(
        `href="/${username}/([a-zA-Z0-9_.-]+)"\\s+itemprop="name codeRepository"([\\s\\S]*?)(?=href="/${username}/[a-zA-Z0-9_.-]+"\\s+itemprop="name codeRepository"|$)`,
        'g'
      );
      const matches = [...html.matchAll(re)];
      const parsed = matches.map((m) => {
        const name = m[1];
        const block = m[2];
        const descMatch = block.match(/itemprop="description">([\s\S]*?)<\/p>/);
        const langMatch = block.match(/itemprop="programmingLanguage">([^<]+)<\/span>/);
        const starMatch = block.match(/href="\/[^\/]+\/[^\/]+\/stargazers"[\s\S]*?>\s*([\d,]+)\s*<\/a>/);
        return {
          id: name,
          name,
          description: descMatch ? descMatch[1].trim() : '',
          language: langMatch ? langMatch[1].trim() : 'Code',
          stargazers_count: starMatch ? parseInt(starMatch[1].replace(/,/g, ''), 10) || 0 : 0,
          html_url: `https://github.com/${username}/${name}`
        };
      });
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Strategy 2 repos parse failed:', err?.message || err);
  }

  return [];
}

async function githubFetch(path) {
  const rawToken = process.env.GITHUB_TOKEN;
  const token = rawToken && !rawToken.includes('your_github_token') ? rawToken.trim() : null;
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
  const rawToken = process.env.GITHUB_TOKEN;
  const token = rawToken && !rawToken.includes('your_github_token') ? rawToken.trim() : null;
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

  const todayStr = new Date().toISOString().split('T')[0];
  let startIndex = days.findIndex((d) => d.date === todayStr);
  if (startIndex === -1) {
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].date <= todayStr) {
        startIndex = i;
        break;
      }
    }
  }

  let current = 0;
  if (startIndex !== -1) {
    let checkIndex = startIndex;
    if (days[checkIndex].contributionCount === 0 && checkIndex > 0) {
      checkIndex -= 1;
    }
    for (let index = checkIndex; index >= 0 && days[index].contributionCount > 0; index -= 1) {
      current += 1;
    }
  }

  return { current, longest: Math.max(longest, current), total: calendar.totalContributions };
}

export async function GET() {
  try {
    const [allRepositories, contributionData] = await Promise.all([
      fetchPublicRepositories(USERNAME),
      githubGraphql(CONTRIBUTIONS_QUERY, { login: USERNAME }).catch(() => null)
    ]);

    const repositories = (Array.isArray(allRepositories) && allRepositories.length > 0)
      ? allRepositories
      : (lastSuccessfulActivity?.repositories || []);
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
    const activeCalendar = contributionGroups?.contributionCalendar || (await fetchLiveContributions(USERNAME)) || lastSuccessfulActivity?.contributionCalendar || null;
    const contributionStreak = getContributionStreak(activeCalendar);

    lastSuccessfulActivity = {
      repositories,
      commits,
      contributionStreak,
      contributionCalendar: activeCalendar
    };

    return NextResponse.json(lastSuccessfulActivity, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
      }
    });
  } catch (error) {
    console.error('GitHub API route live fetch error:', error?.message || error);
    if (lastSuccessfulActivity) {
      return NextResponse.json(lastSuccessfulActivity);
    }
    return NextResponse.json(
      {
        repositories: [],
        commits: [],
        contributionStreak: { current: 0, longest: 0, total: 0 },
        contributionCalendar: null
      },
      {
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  }
}
