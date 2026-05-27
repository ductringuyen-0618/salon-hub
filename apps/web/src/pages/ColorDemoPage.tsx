import React from 'react';
import { Link } from 'react-router-dom';
import ColorThemeSelector from '../components/ColorThemeSelector';
import { useColorTheme } from '../hooks/useColorTheme';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const ColorDemoPage: React.FC = () => {
  const { currentTheme } = useColorTheme();

  return (
    <div className="min-h-screen bg-dynamic-background">
      {/* Header */}
      <header className="bg-dynamic-surface shadow-sm border-b border-dynamic-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link to="/">
              <h1 className="text-3xl font-bold text-dynamic-primary hover:text-dynamic-primary transition-colors">
                Five Nails & Spa
              </h1>
            </Link>
            <Link 
              to="/" 
              className="text-dynamic-text-secondary hover:text-dynamic-primary transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-dynamic-text mb-4">
              Dynamic Color System Demo
            </h2>
            <p className="text-lg text-dynamic-text-secondary">
              Experience how colors change instantly across the entire application
            </p>
          </div>

          {/* Color Theme Selector */}
          <div className="mb-8">
            <ColorThemeSelector />
          </div>

          {/* Demo Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Buttons Demo */}
            <Card className="bg-dynamic-surface border-dynamic-border">
              <CardHeader>
                <CardTitle className="text-dynamic-text">Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full text-white">
                  Primary Button
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-dynamic-primary text-dynamic-primary hover:bg-dynamic-primary hover:text-white"
                >
                  Outline Button
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-dynamic-text hover:bg-dynamic-background"
                >
                  Ghost Button
                </Button>
              </CardContent>
            </Card>

            {/* Text Demo */}
            <Card className="bg-dynamic-surface border-dynamic-border">
              <CardHeader>
                <CardTitle className="text-dynamic-text">Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="text-xl font-bold text-dynamic-primary">Primary Heading</h3>
                <p className="text-dynamic-text">
                  This is primary text that adapts to the theme.
                </p>
                <p className="text-dynamic-text-secondary">
                  This is secondary text with reduced opacity.
                </p>
                <a href="#" className="text-dynamic-primary hover:text-dynamic-primary hover:underline">
                  This is a link that changes with the theme
                </a>
              </CardContent>
            </Card>

            {/* Form Demo */}
            <Card className="bg-dynamic-surface border-dynamic-border">
              <CardHeader>
                <CardTitle className="text-dynamic-text">Form Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Text input"
                  className="w-full p-2 border border-dynamic-border rounded bg-dynamic-surface text-dynamic-text focus:border-dynamic-primary focus:outline-none"
                />
                <select className="w-full p-2 border border-dynamic-border rounded bg-dynamic-surface text-dynamic-text focus:border-dynamic-primary focus:outline-none">
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
                <textarea 
                  placeholder="Textarea"
                  className="w-full p-2 border border-dynamic-border rounded bg-dynamic-surface text-dynamic-text focus:border-dynamic-primary focus:outline-none"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Status Demo */}
            <Card className="bg-dynamic-surface border-dynamic-border">
              <CardHeader>
                <CardTitle className="text-dynamic-text">Status Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
                  ✅ Success message
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠️ Warning message
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                  ❌ Error message
                </div>
              </CardContent>
            </Card>

            {/* Navigation Demo */}
            <Card className="bg-dynamic-surface border-dynamic-border">
              <CardHeader>
                <CardTitle className="text-dynamic-text">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <a href="#" className="block p-2 text-dynamic-text hover:bg-dynamic-background hover:text-dynamic-primary rounded transition-colors">
                    Home
                  </a>
                  <a href="#" className="block p-2 text-dynamic-text hover:bg-dynamic-background hover:text-dynamic-primary rounded transition-colors">
                    Services
                  </a>
                  <a href="#" className="block p-2 text-dynamic-text hover:bg-dynamic-background hover:text-dynamic-primary rounded transition-colors">
                    About
                  </a>
                  <a href="#" className="block p-2 text-dynamic-text hover:bg-dynamic-background hover:text-dynamic-primary rounded transition-colors">
                    Contact
                  </a>
                </nav>
              </CardContent>
            </Card>

            {/* Current Theme Info */}
            <Card className="bg-dynamic-surface border-dynamic-border">
              <CardHeader>
                <CardTitle className="text-dynamic-text">Current Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-dynamic-text">{currentTheme.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div 
                        className="w-8 h-8 rounded mx-auto mb-1 border border-white shadow-sm"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      />
                      <span className="text-dynamic-text-secondary">Primary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-8 h-8 rounded mx-auto mb-1 border border-white shadow-sm"
                        style={{ backgroundColor: currentTheme.colors.secondary }}
                      />
                      <span className="text-dynamic-text-secondary">Secondary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-8 h-8 rounded mx-auto mb-1 border border-white shadow-sm"
                        style={{ backgroundColor: currentTheme.colors.accent }}
                      />
                      <span className="text-dynamic-text-secondary">Accent</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-8 h-8 rounded mx-auto mb-1 border border-white shadow-sm"
                        style={{ backgroundColor: currentTheme.colors.background }}
                      />
                      <span className="text-dynamic-text-secondary">Background</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">💡</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">How to Use Dynamic Colors</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Use <code className="bg-blue-100 px-1 rounded">bg-dynamic-primary</code> for primary backgrounds</li>
                    <li>• Use <code className="bg-blue-100 px-1 rounded">text-dynamic-primary</code> for primary text</li>
                    <li>• Use <code className="bg-blue-100 px-1 rounded">border-dynamic-border</code> for borders</li>
                    <li>• Colors automatically update when theme changes</li>
                    <li>• Theme preference is saved in localStorage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ColorDemoPage;
