import React from 'react';
import { tokenStorage } from '@/lib/tokenStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthDebugger = () => {
  const token = tokenStorage.getAccessToken();
  const userData = tokenStorage.getUser();
  const isExpired = tokenStorage.isTokenExpired();

  const clearAuth = () => {
    tokenStorage.clearSession();
    window.location.reload();
  };

  const testPublicEndpoint = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/queue/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Public endpoint test successful:', data);
        alert(`Public endpoint working: ${JSON.stringify(data)}`);
      } else {
        console.error('Public endpoint test failed:', response.status, response.statusText);
        alert(`Public endpoint failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Public endpoint test error:', error);
      alert(`Public endpoint error: ${error.message}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs">
          <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}</p>
          <p><strong>Expired:</strong> {isExpired ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {userData?.email || 'None'}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={clearAuth} size="sm" variant="outline">
            Clear Auth
          </Button>
          <Button onClick={testPublicEndpoint} size="sm" variant="outline">
            Test API
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;
