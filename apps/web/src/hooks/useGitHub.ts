import { useState, useEffect } from 'react';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  topics: string[];
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

export interface GitHubStats {
  public_repos: number;
  followers: number;
  following: number;
}

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_USERNAME = 'ductringuyen0186';

export const useGitHubRepo = (repoName: string) => {
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepoData = async () => {
      if (!repoName) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch repository information
        const repoResponse = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}`);
        if (!repoResponse.ok) {
          throw new Error('Repository not found');
        }
        const repoData = await repoResponse.json();
        setRepo(repoData);

        // Fetch recent commits
        const commitsResponse = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/commits?per_page=5`);
        if (commitsResponse.ok) {
          const commitsData = await commitsResponse.json();
          setCommits(commitsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repository data');
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [repoName]);

  return { repo, commits, loading, error };
};

export const useGitHubStats = () => {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch user stats
        const userResponse = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setStats({
          public_repos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
        });

        // Fetch repositories
        const reposResponse = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`);
        if (reposResponse.ok) {
          const reposData = await reposResponse.json();
          setRepos(reposData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data');
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  return { stats, repos, loading, error };
};

export const extractRepoName = (githubUrl: string): string => {
  try {
    const url = new URL(githubUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === GITHUB_USERNAME) {
      return pathParts[1];
    }
    return '';
  } catch {
    return '';
  }
};
