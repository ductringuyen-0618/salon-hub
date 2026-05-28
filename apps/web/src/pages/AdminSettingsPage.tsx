import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Navigation from '@/components/Navigation';
import { apiService } from '@/services/api';
import { useSettings, BusinessSettings, DayHours } from '@/contexts/SettingsContext';
import { useToast } from '@/contexts/ToastContext';
import { Save, ArrowLeft, Palette, Clock, Building, Phone, Image } from 'lucide-react';

/**
 * Admin console settings page. Everything edited here is persisted as one
 * row in business_settings; the storefront re-fetches via reload() so
 * changes appear without a hard refresh.
 */
const DAYS: Array<{ key: string; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const DEFAULT_DAY_HOURS: DayHours = { open: '09:00', close: '19:00', closed: false };

const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, reload } = useSettings();
  const { success, error: showError } = useToast();

  // Local form state, initialized from the loaded settings. Save dispatches
  // PUT /api/settings and then asks the SettingsProvider to reload so the
  // public storefront updates too.
  const [form, setForm] = useState<BusinessSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const setField = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const setDayHours = (day: string, patch: Partial<DayHours>) => {
    setForm(prev => {
      const current = prev.businessHours[day] || DEFAULT_DAY_HOURS;
      return {
        ...prev,
        businessHours: { ...prev.businessHours, [day]: { ...current, ...patch } },
      };
    });
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings(form);
      await reload();
      success('Settings saved', 'Changes are live now.');
    } catch (err: any) {
      console.error('Save settings failed:', err);
      showError('Could not save settings', err?.message || 'Try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation showBackButton title="Business Settings" subtitle="Configure everything customers see" />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
          </Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save all changes'}
          </Button>
        </div>

        {/* GENERAL ----------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" /> General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Business name</Label>
              <Input
                value={form.businessName ?? ''}
                onChange={e => setField('businessName', e.target.value)}
                placeholder="e.g. Lisa's Nail Studio"
              />
            </div>
            <div>
              <Label>Tagline (optional)</Label>
              <Input
                value={form.tagline ?? ''}
                onChange={e => setField('tagline', e.target.value)}
                placeholder="e.g. Premium nail care since 2018"
              />
            </div>
          </CardContent>
        </Card>

        {/* CONTACT ----------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" /> Contact info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.contactPhone ?? ''}
                  onChange={e => setField('contactPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.contactEmail ?? ''}
                  onChange={e => setField('contactEmail', e.target.value)}
                  placeholder="hello@yoursalon.com"
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={form.contactAddress ?? ''}
                onChange={e => setField('contactAddress', e.target.value)}
                placeholder="123 Main St, Springfield, IL 62701"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* HOURS ------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Business hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map(({ key, label }) => {
              const day = form.businessHours[key] || DEFAULT_DAY_HOURS;
              return (
                <div key={key} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr_120px] items-center gap-3 p-3 border rounded-lg">
                  <div className="font-medium">{label}</div>
                  <div>
                    <Label className="text-xs">Open</Label>
                    <Input
                      type="time"
                      value={day.open}
                      disabled={day.closed}
                      onChange={e => setDayHours(key, { open: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Close</Label>
                    <Input
                      type="time"
                      value={day.close}
                      disabled={day.closed}
                      onChange={e => setDayHours(key, { close: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={day.closed}
                      onCheckedChange={(checked) => setDayHours(key, { closed: checked })}
                    />
                    <Label className="text-sm">Closed</Label>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* OPERATIONS -------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Turnover minutes between walk-ins</Label>
              <Input
                type="number"
                min={0}
                max={60}
                value={form.turnoverMinutes ?? 5}
                onChange={e => setField('turnoverMinutes', Math.max(0, Number(e.target.value) || 0))}
              />
              <p className="text-xs text-dynamic-text-secondary mt-1">
                Cleanup time between back-to-back walk-ins on the same technician. The wait-time estimate adds this to every assignment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* THEME ------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" /> Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Primary color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.themePrimary}
                    onChange={e => setField('themePrimary', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={form.themePrimary}
                    onChange={e => setField('themePrimary', e.target.value)}
                    placeholder="#d34000"
                  />
                </div>
              </div>
              <div>
                <Label>Accent color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.themeAccent}
                    onChange={e => setField('themeAccent', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={form.themeAccent}
                    onChange={e => setField('themeAccent', e.target.value)}
                    placeholder="#7c3aed"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Image className="h-4 w-4" /> Logo URL (optional)
              </Label>
              <Input
                value={form.logoUrl ?? ''}
                onChange={e => setField('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-dynamic-text-secondary mt-1">
                Paste a public URL to your logo image. File upload is not yet supported.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={onSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save all changes'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
