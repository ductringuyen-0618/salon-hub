import React, { useState, useEffect } from 'react';
import { useColorTheme } from '../hooks/useColorTheme';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Palette, Lock, Unlock, Eye, Settings } from 'lucide-react';

const AdminColorThemeManager: React.FC = () => {
  const { 
    currentTheme, 
    availableThemes, 
    changeTheme, 
    isThemeLocked, 
    getAdminTheme,
    unlockTheme 
  } = useColorTheme();
  
  const [isLocked, setIsLocked] = useState(false);
  const [adminTheme, setAdminTheme] = useState(null);
  const [previewTheme, setPreviewTheme] = useState(null);

  useEffect(() => {
    setIsLocked(isThemeLocked());
    setAdminTheme(getAdminTheme());
  }, []);

  const handleThemeChange = (themeId: string) => {
    changeTheme(themeId, true); // Admin change
    setIsLocked(true);
    setAdminTheme(availableThemes.find(t => t.id === themeId));
  };

  const handleUnlock = () => {
    unlockTheme();
    setIsLocked(false);
    setAdminTheme(null);
  };

  const handlePreview = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    setPreviewTheme(theme);
    changeTheme(themeId, false); // Preview only
  };

  const handleApplyPreview = () => {
    if (previewTheme) {
      handleThemeChange(previewTheme.id);
      setPreviewTheme(null);
    }
  };

  const handleCancelPreview = () => {
    if (adminTheme) {
      changeTheme(adminTheme.id, false);
    } else {
      changeTheme('rose-stone', false); // Default
    }
    setPreviewTheme(null);
  };

  return (
    <Card className="bg-dynamic-surface border-dynamic-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-dynamic-primary" />
            <CardTitle className="text-dynamic-text">Color Theme Management</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Lock className="h-3 w-3 mr-1" />
                Theme Locked
              </Badge>
            ) : (
              <Badge variant="outline" className="border-dynamic-border text-dynamic-text-secondary">
                <Unlock className="h-3 w-3 mr-1" />
                Theme Unlocked
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Status */}
        <Alert className="border-dynamic-border bg-dynamic-background">
          <Settings className="h-4 w-4" />
          <AlertDescription className="text-dynamic-text">
            {isLocked && adminTheme ? (
              <>
                <strong>Active Theme:</strong> {adminTheme.name} - This theme is applied across the entire application for all users.
              </>
            ) : (
              <>
                <strong>No Admin Theme Set:</strong> Users will see the default theme. Set a theme below to control the application-wide appearance.
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Preview Mode Alert */}
        {previewTheme && (
          <Alert className="border-blue-200 bg-blue-50">
            <Eye className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <strong>Preview Mode:</strong> You're previewing "{previewTheme.name}". Apply or cancel to continue.
              <div className="flex space-x-2 mt-2">
                <Button size="sm" onClick={handleApplyPreview} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Apply Theme
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelPreview} className="border-blue-300 text-blue-700">
                  Cancel Preview
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Theme Selection */}
        <div>
          <h4 className="font-medium text-dynamic-text mb-4">Available Themes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableThemes.map((theme) => (
              <div
                key={theme.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  currentTheme.id === theme.id
                    ? 'border-dynamic-primary bg-dynamic-background'
                    : 'border-dynamic-border hover:border-dynamic-primary bg-dynamic-surface'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div>
                      <span className="font-medium text-dynamic-text">{theme.name}</span>
                      {adminTheme?.id === theme.id && (
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Color palette preview */}
                <div className="flex space-x-1 mb-3">
                  <div 
                    className="w-4 h-4 rounded border border-white"
                    style={{ backgroundColor: theme.colors.primary }}
                    title="Primary"
                  />
                  <div 
                    className="w-4 h-4 rounded border border-white"
                    style={{ backgroundColor: theme.colors.secondary }}
                    title="Secondary"
                  />
                  <div 
                    className="w-4 h-4 rounded border border-white"
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Accent"
                  />
                  <div 
                    className="w-4 h-4 rounded border border-white"
                    style={{ backgroundColor: theme.colors.background }}
                    title="Background"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(theme.id)}
                    className="flex-1 border-dynamic-border text-dynamic-text hover:bg-dynamic-background"
                    disabled={previewTheme?.id === theme.id}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleThemeChange(theme.id)}
                    className="flex-1 bg-dynamic-primary hover:bg-dynamic-primary-hover text-white"
                    disabled={adminTheme?.id === theme.id}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Controls */}
        {isLocked && (
          <div className="pt-4 border-t border-dynamic-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-dynamic-text">Theme Lock Controls</h4>
                <p className="text-sm text-dynamic-text-secondary">
                  Unlock to allow users to change themes individually
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleUnlock}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Theme
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How Theme Management Works</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• <strong>Preview:</strong> Test how a theme looks before applying it</li>
            <li>• <strong>Apply:</strong> Set the theme for all users across the application</li>
            <li>• <strong>Lock:</strong> When a theme is applied, it's automatically locked for all users</li>
            <li>• <strong>Unlock:</strong> Allow users to change themes individually (admin theme becomes default)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminColorThemeManager;
