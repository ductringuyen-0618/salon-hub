import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { apiService, Service } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { Plus, Pencil, Trash2, Save, X, ArrowLeft } from 'lucide-react';

/**
 * Admin → Services. Lists every ServiceType with inline edit/delete and a
 * "+ Add service" affordance. All mutations hit /api/service-types (the
 * existing backend CRUD; MANAGER/ADMIN protected).
 */
type Draft = Partial<Service> & { _isNew?: boolean };

const emptyDraft = (): Draft => ({
  _isNew: true,
  name: '',
  description: '',
  category: '',
  estimatedDurationMinutes: 30,
  price: 0,
  popular: false,
  active: true,
});

const AdminServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiService.getServices();
      setServices(data || []);
    } catch (err) {
      showError('Could not load services', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startNew = () => setEditing(emptyDraft());
  const startEdit = (s: Service) => setEditing({ ...s });
  const cancelEdit = () => setEditing(null);

  const saveDraft = async () => {
    if (!editing) return;
    if (!editing.name || !editing.name.trim()) {
      showError('Name is required');
      return;
    }
    setSaving(true);
    try {
      // Strip the marker before sending.
      const { _isNew, id, ...rest } = editing;
      const payload = {
        ...rest,
        estimatedDurationMinutes: Number(rest.estimatedDurationMinutes) || 30,
        price: typeof rest.price === 'string' ? parseFloat(rest.price as any) : (rest.price as number) || 0,
      };
      if (_isNew) {
        await apiService.createService(payload as any);
        success('Service added');
      } else if (id) {
        await apiService.updateService(id, payload as any);
        success('Service updated');
      }
      setEditing(null);
      await load();
    } catch (err: any) {
      showError('Save failed', err?.message || 'Try again');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Service) => {
    if (!s.id) return;
    if (!confirm(`Delete "${s.name}"? This can't be undone.`)) return;
    try {
      await apiService.deleteService(s.id);
      success(`Deleted "${s.name}"`);
      await load();
    } catch (err: any) {
      showError('Delete failed', err?.message || 'Try again');
    }
  };

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setEditing(prev => prev ? { ...prev, [key]: value } : prev);
  };

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation showBackButton title="Service Catalog" subtitle="Add, edit and price the services you offer" />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
          </Button>
          <Button onClick={startNew} disabled={!!editing}>
            <Plus className="h-4 w-4 mr-2" /> Add service
          </Button>
        </div>

        {editing && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">{editing._isNew ? 'New service' : 'Edit service'}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Name *</Label>
                  <Input value={editing.name ?? ''} onChange={e => setField('name', e.target.value)} placeholder="e.g. Signature Manicure" />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={600}
                    value={editing.estimatedDurationMinutes ?? 30}
                    onChange={e => setField('estimatedDurationMinutes', Math.max(5, Number(e.target.value) || 30))}
                  />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editing.price ?? 0}
                    onChange={e => setField('price', Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={editing.category ?? ''} onChange={e => setField('category', e.target.value)} placeholder="e.g. Manicure Services" />
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={!!editing.popular} onCheckedChange={c => setField('popular', c)} />
                    <Label>Popular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editing.active !== false} onCheckedChange={c => setField('active', c)} />
                    <Label>Active</Label>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editing.description ?? ''}
                    onChange={e => setField('description', e.target.value)}
                    rows={3}
                    placeholder="Brief description shown to customers."
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button onClick={saveDraft} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0 divide-y divide-dynamic-border">
            {loading && <div className="p-6 text-dynamic-text-secondary">Loading services...</div>}
            {!loading && services.length === 0 && (
              <div className="p-6 text-dynamic-text-secondary">No services yet. Click "Add service" to create your first one.</div>
            )}
            {services.map(s => (
              <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{s.name}</span>
                    {s.popular && <Badge variant="default">Popular</Badge>}
                    {s.active === false && <Badge variant="secondary">Inactive</Badge>}
                    {s.category && <Badge variant="outline">{s.category}</Badge>}
                  </div>
                  <div className="text-sm text-dynamic-text-secondary mt-1">
                    {s.estimatedDurationMinutes ?? s.duration ?? 30} min · ${s.price}
                  </div>
                  {s.description && (
                    <div className="text-sm text-dynamic-text-secondary mt-1 line-clamp-2">{s.description}</div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(s)} disabled={!!editing}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(s)} disabled={!!editing}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminServicesPage;
