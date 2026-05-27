export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  imageUrl?: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  category: 'web' | 'mobile' | 'desktop' | 'other';
  status: 'completed' | 'in-progress' | 'planned';
  createdAt: string;
  startDate?: string;
  endDate?: string;
  featured?: boolean;
  highlights?: string[];
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Salon Hub Management System',
    description: 'A comprehensive salon management system with customer check-ins, queue management, and booking functionality.',
    longDescription: 'A full-featured salon management system built with React and TypeScript. Features include real-time customer check-ins, queue management, appointment booking, admin dashboard, and multi-user authentication with role-based access control.',
    image: '/placeholder-project.jpg',
    imageUrl: '/placeholder-project.jpg',
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Radix UI'],
    githubUrl: 'https://github.com/ductringuyen0186/salon-hub-ui-v2',
    category: 'web',
    status: 'in-progress',
    createdAt: '2025-01-15',
    startDate: '2025-01-15',
    featured: true,
    highlights: [
      'Real-time customer check-in system',
      'Queue management with wait time estimates',
      'Admin dashboard with analytics',
      'Multi-user authentication and authorization',
      'Responsive design for mobile and desktop'
    ]
  },
  // Add more projects as needed
];

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};
