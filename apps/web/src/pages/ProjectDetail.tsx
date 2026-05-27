import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Calendar, Clock, Star } from 'lucide-react';
import { getProjectById } from '../data/projects';
import GitHubIntegration from '../components/Projects/GitHubIntegration';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const project = id ? getProjectById(id) : null;

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-8">The project you're looking for doesn't exist.</p>
          <Link to="/projects" className="btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'web':
        return 'bg-purple-100 text-purple-800';
      case 'mobile':
        return 'bg-pink-100 text-pink-800';
      case 'backend':
        return 'bg-blue-100 text-blue-800';
      case 'fullstack':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/projects"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(project.category)}`}>
                  {project.category}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status.replace('-', ' ')}
                </span>
                {project.featured && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full flex items-center space-x-1">
                    <Star size={14} />
                    <span>Featured</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center space-x-2"
              >
                <Github size={18} />
                <span>View Code</span>
              </a>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ExternalLink size={18} />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Project Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden"
            >
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-500">
                      {project.title.charAt(0)}
                    </span>
                  </div>
                  <p className="text-lg">Project Preview</p>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900">About This Project</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {project.longDescription || project.description}
              </p>
            </motion.div>

            {/* Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Key Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* GitHub Integration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              <GitHubIntegration githubUrl={project.githubUrl} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Project Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Project Info</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Calendar size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Started</p>
                    <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {project.endDate ? (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Calendar size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Clock size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">In Progress</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Technologies */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Technologies</h3>
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
