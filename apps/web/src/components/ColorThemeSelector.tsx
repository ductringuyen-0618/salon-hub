import React, { useState } from 'react';
import { useColorTheme } from '../hooks/useColorTheme';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ColorThemeSelectorProps {
  showAsFloating?: boolean;
  className?: string;
}

const ColorThemeSelector: React.FC<ColorThemeSelectorProps> = ({ 
  showAsFloating = false, 
  className = '' 
}) => {
  const { currentTheme, availableThemes, changeTheme } = useColorTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (showAsFloating) {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="mb-2 bg-dynamic-primary hover:bg-dynamic-primary-hover text-white"
        >
          🎨 Colors
        </Button>
        
        {isOpen && (
          <Card className="w-64 bg-dynamic-surface border-dynamic-border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-dynamic-text">Choose Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    changeTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    currentTheme.id === theme.id
                      ? 'border-dynamic-primary bg-dynamic-background'
                      : 'border-dynamic-border hover:border-dynamic-primary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <span className="text-sm font-medium text-dynamic-text">
                      {theme.name}
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className={`bg-dynamic-surface border-dynamic-border ${className}`}>
      <CardHeader>
        <CardTitle className="text-dynamic-text">Color Themes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => changeTheme(theme.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                currentTheme.id === theme.id
                  ? 'border-dynamic-primary bg-dynamic-background'
                  : 'border-dynamic-border hover:border-dynamic-primary'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span className="font-medium text-dynamic-text">{theme.name}</span>
              </div>
              
              {/* Color palette preview */}
              <div className="flex space-x-1">
                <div 
                  className="w-4 h-4 rounded border border-white"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="w-4 h-4 rounded border border-white"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div 
                  className="w-4 h-4 rounded border border-white"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <div 
                  className="w-4 h-4 rounded border border-white"
                  style={{ backgroundColor: theme.colors.background }}
                />
              </div>
            </button>
          ))}
        </div>
        
        {/* Current theme info */}
        <div className="mt-6 p-4 bg-dynamic-background rounded-lg">
          <h4 className="font-medium text-dynamic-text mb-2">Current Theme: {currentTheme.name}</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div 
                className="w-8 h-8 rounded mx-auto mb-1 border border-white"
                style={{ backgroundColor: currentTheme.colors.primary }}
              />
              <span className="text-dynamic-text-secondary">Primary</span>
            </div>
            <div className="text-center">
              <div 
                className="w-8 h-8 rounded mx-auto mb-1 border border-white"
                style={{ backgroundColor: currentTheme.colors.secondary }}
              />
              <span className="text-dynamic-text-secondary">Secondary</span>
            </div>
            <div className="text-center">
              <div 
                className="w-8 h-8 rounded mx-auto mb-1 border border-white"
                style={{ backgroundColor: currentTheme.colors.accent }}
              />
              <span className="text-dynamic-text-secondary">Accent</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorThemeSelector;
