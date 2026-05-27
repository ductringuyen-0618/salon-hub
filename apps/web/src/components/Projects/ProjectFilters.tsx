import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

interface ProjectFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedTechnology: string;
  onTechnologyChange: (technology: string) => void;
  availableTechnologies: string[];
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTechnology,
  onTechnologyChange,
  availableTechnologies,
}) => {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'web', label: 'Web' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'backend', label: 'Backend' },
    { value: 'fullstack', label: 'Full Stack' },
    { value: 'other', label: 'Other' },
  ];

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('');
    onTechnologyChange('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedTechnology;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Projects</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
          >
            <X size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Technology Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Technology</label>
          <select
            value={selectedTechnology}
            onChange={(e) => onTechnologyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Technologies</option>
            {availableTechnologies.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchTerm && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center space-x-1">
              <span>Search: "{searchTerm}"</span>
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center space-x-1">
              <span>Category: {categories.find(c => c.value === selectedCategory)?.label}</span>
              <button
                onClick={() => onCategoryChange('')}
                className="hover:text-purple-900"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {selectedTechnology && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center space-x-1">
              <span>Tech: {selectedTechnology}</span>
              <button
                onClick={() => onTechnologyChange('')}
                className="hover:text-green-900"
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectFilters;
