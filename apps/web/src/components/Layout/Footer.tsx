import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

const Footer: React.FC = () => {
  const { settings } = useSettings();
  const businessName = settings.businessName || 'SalonHub';
  return (
    <footer className="bg-dynamic-surface border-t border-dynamic-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-dynamic-text-secondary text-sm">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
