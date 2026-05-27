import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { ArrowLeft, Construction } from 'lucide-react';

/**
 * Lightweight placeholder for admin sub-pages whose tiles existed on the admin
 * dashboard but weren't routed (Staff, Bookings, Analytics, Themes, Payments,
 * Settings, Check-ins). Previously these tiles silently dead-linked to the
 * homepage via the catch-all route. Each placeholder describes what's coming
 * and links back to the dashboard.
 */
interface Props {
  title: string;
  description: string;
}

const AdminSectionPlaceholder: React.FC<Props> = ({ title, description }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation showBackButton={true} title={title} subtitle="Admin section" />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-dynamic-surface border-dynamic-border">
            <CardContent className="p-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-6">
                  <Construction className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-light text-dynamic-text mb-3">{title}</h1>
                <p className="text-dynamic-text-secondary leading-relaxed">{description}</p>
              </div>
              <p className="text-sm text-dynamic-text-secondary">
                This section is on the roadmap but not built yet. The dashboard
                tile is intentionally linked so the navigation isn't broken.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to dashboard
                </Button>
                <Button onClick={() => navigate('/admin')}>
                  Open Admin home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminSectionPlaceholder;
