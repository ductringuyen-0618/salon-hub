import React from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, Clock, GitCommit, ExternalLink } from 'lucide-react';
import { useGitHubRepo, extractRepoName } from '../../hooks/useGitHub';

interface GitHubIntegrationProps {
  githubUrl: string;
}

const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({ githubUrl }) => {
  const repoName = extractRepoName(githubUrl);
  const { repo, commits, loading, error } = useGitHubRepo(repoName);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Repository Information</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Repository Information</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {error || 'Repository information not available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-gray-900">Repository Information</h3>
      
      {/* Repository Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-yellow-600 mb-2">
            <Star size={20} />
            <span className="text-2xl font-bold">{repo.stargazers_count}</span>
          </div>
          <p className="text-sm text-gray-600">Stars</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
            <GitFork size={20} />
            <span className="text-2xl font-bold">{repo.forks_count}</span>
          </div>
          <p className="text-sm text-gray-600">Forks</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
            <Clock size={20} />
            <span className="text-sm font-semibold">
              {new Date(repo.updated_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-600">Last Updated</p>
        </div>
      </div>

      {/* Repository Details */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-900">{repo.name}</h4>
            {repo.description && (
              <p className="text-gray-600">{repo.description}</p>
            )}
          </div>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <span className="text-sm">View on GitHub</span>
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Language and Topics */}
        <div className="space-y-3">
          {repo.language && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Primary Language:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                {repo.language}
              </span>
            </div>
          )}
          
          {repo.topics && repo.topics.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-gray-600">Topics:</span>
              <div className="flex flex-wrap gap-2">
                {repo.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Commits */}
      {commits.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Recent Commits</h4>
          <div className="space-y-3">
            {commits.slice(0, 3).map((commit) => (
              <motion.div
                key={commit.sha}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <GitCommit size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {commit.commit.message.split('\n')[0]}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{commit.commit.author.name}</span>
                      <span>
                        {new Date(commit.commit.author.date).toLocaleDateString()}
                      </span>
                      <a
                        href={commit.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GitHubIntegration;
