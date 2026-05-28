import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { apiService } from '@/services/api';

/**
 * Public onboarding for new businesses. The end of this flow has a fresh
 * tenant + admin user; the admin can then log in (we redirect to /login
 * with the new slug seeded as a header).
 *
 * Slug is checked live (debounced) so users see if their preferred URL is
 * available before they hit submit. Reserved slugs are caught server-side.
 */
const SLUG_RX = /^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/;

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugDirty, setSlugDirty] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string; businessName: string } | null>(null);

  // Auto-derive slug from business name until the user edits it themselves.
  useEffect(() => {
    if (slugDirty) return;
    const auto = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);
    setSlug(auto);
  }, [businessName, slugDirty]);

  // Debounced slug availability check.
  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle');
      return;
    }
    if (!SLUG_RX.test(slug)) {
      setSlugStatus('invalid');
      return;
    }
    setSlugStatus('checking');
    const handle = window.setTimeout(async () => {
      try {
        const result = await apiService.checkTenantSlug(slug);
        setSlugStatus(result.available ? 'available' : 'taken');
      } catch (err) {
        console.warn('[signup] slug check failed', err);
        setSlugStatus('idle');
      }
    }, 350);
    return () => window.clearTimeout(handle);
  }, [slug]);

  const canSubmit =
    !!businessName && !!adminEmail && adminPassword.length >= 8
    && slugStatus === 'available' && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const resp = await apiService.createTenant({
        businessName: businessName.trim(),
        slug,
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPassword,
        adminName: adminName.trim() || undefined,
      });
      setSuccess({ slug: resp.slug, businessName: resp.businessName });
    } catch (err: any) {
      const message = err?.message || 'Sign-up failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dynamic-background flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardContent className="p-10 text-center space-y-5">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-light text-dynamic-text">
              {success.businessName} is live!
            </h1>
            <p className="text-dynamic-text-secondary leading-relaxed">
              Your salon is set up. Sign in as the admin you created to start configuring
              services, hours, and theme.
            </p>
            <div className="bg-dynamic-surface border border-dynamic-border rounded-lg p-4 text-left text-sm">
              <div className="text-dynamic-text-secondary">Your tenant slug:</div>
              <div className="font-mono text-base mt-1">{success.slug}</div>
              <div className="text-dynamic-text-secondary mt-3">
                Each tenant gets its own subdomain once custom domains are wired. For now,
                the same site routes to your tenant via the slug.
              </div>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={() => navigate('/login')}>Sign in</Button>
              <Button variant="outline" onClick={() => navigate('/')}>Visit homepage</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dynamic-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-light text-dynamic-text flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-dynamic-primary" /> Start your salon
          </CardTitle>
          <p className="text-sm text-dynamic-text-secondary mt-2">
            Spin up a fully configurable salon storefront in under a minute. You'll be the
            first admin and can invite staff afterwards.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Business name *</Label>
              <Input
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Lisa's Nail Studio"
                autoFocus
                required
              />
            </div>

            <div>
              <Label>Tenant slug *</Label>
              <div className="relative">
                <Input
                  value={slug}
                  onChange={e => { setSlug(e.target.value.toLowerCase()); setSlugDirty(true); }}
                  placeholder="lisa-nail-studio"
                  required
                  className="pr-28"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dynamic-text-secondary">
                  {slugStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin inline" />}
                  {slugStatus === 'available' && <span className="text-green-600">Available</span>}
                  {slugStatus === 'taken' && <span className="text-red-600">Taken</span>}
                  {slugStatus === 'invalid' && <span className="text-amber-600">Invalid</span>}
                </span>
              </div>
              <p className="text-xs text-dynamic-text-secondary mt-1">
                3-30 chars, lowercase letters/digits/hyphens. Will become your URL.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Admin name</Label>
                <Input
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="(optional)"
                />
              </div>
              <div>
                <Label>Admin email *</Label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="you@yoursalon.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Admin password *</Label>
              <Input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link to="/login" className="text-sm text-dynamic-text-secondary hover:text-dynamic-primary">
                Already have an account? Sign in
              </Link>
              <Button type="submit" disabled={!canSubmit}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create salon
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
