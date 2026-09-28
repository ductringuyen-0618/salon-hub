import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import { apiService, Employee } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { Plus, Pencil, Trash2, Save, X, ArrowLeft } from 'lucide-react';

/**
 * Admin → Staff. Lists every Employee with inline edit/delete, an
 * "+ Add staff member" affordance and an availability switch per row.
 * All mutations hit /api/employees (the existing backend CRUD; ADMIN
 * protected). The backend model only carries name/role/available — no
 * contact fields — so the form doesn't invent any.
 */
type Draft = Partial<Employee> & { _isNew?: boolean };

const ROLES: Employee['role'][] = ['TECHNICIAN', 'FRONT_DESK', 'MANAGER', 'ADMIN'];

const emptyDraft = (): Draft => ({
  _isNew: true,
  name: '',
  role: 'TECHNICIAN',
  available: true,
});

const AdminStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiService.getEmployees();
      setEmployees(data || []);
    } catch (err) {
      showError('Could not load staff', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startNew = () => setEditing(emptyDraft());
  const startEdit = (e: Employee) => setEditing({ ...e });
  const cancelEdit = () => setEditing(null);

  const saveDraft = async () => {
    if (!editing) return;
    if (!editing.name || !editing.name.trim()) {
      showError('Name is required');
      return;
    }
    setSaving(true);
    try {
      const { _isNew, id, ...rest } = editing;
      const payload = {
        name: rest.name,
        role: rest.role || 'TECHNICIAN',
        available: rest.available !== false,
      };
      if (_isNew) {
        await apiService.createEmployee(payload as Omit<Employee, 'id'>);
        success('Staff member added');
      } else if (id) {
        await apiService.updateEmployee(id, payload);
        success('Staff member updated');
      }
      setEditing(null);
      await load();
    } catch (err: any) {
      showError('Save failed', err?.message || 'Try again');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (e: Employee) => {
    if (!confirm(`Remove "${e.name}"? This can't be undone.`)) return;
    try {
      await apiService.deleteEmployee(e.id);
      success(`Removed "${e.name}"`);
      await load();
    } catch (err: any) {
      showError('Delete failed', err?.message || 'Try again');
    }
  };

  const toggleAvailability = async (e: Employee) => {
    const next = !e.available;
    try {
      await apiService.updateEmployeeAvailability(e.id, next);
      success(next ? `${e.name} is now available` : `${e.name} marked unavailable`);
      await load();
    } catch (err: any) {
      showError('Could not update availability', err?.message || 'Try again');
    }
  };

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setEditing(prev => prev ? { ...prev, [key]: value } : prev);
  };

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation showBackButton title="Staff Management" subtitle="Add, edit and manage your team" />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
          </Button>
          <Button onClick={startNew} disabled={!!editing}>
            <Plus className="h-4 w-4 mr-2" /> Add staff member
          </Button>
        </div>

        {editing && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">{editing._isNew ? 'New staff member' : 'Edit staff member'}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Name *</Label>
                  <Input value={editing.name ?? ''} onChange={ev => setField('name', ev.target.value)} placeholder="e.g. Jamie Rivera" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={editing.role ?? 'TECHNICIAN'} onValueChange={v => setField('role', v as Employee['role'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Switch checked={editing.available !== false} onCheckedChange={c => setField('available', c)} />
                    <Label>Available</Label>
                  </div>
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
            {loading && <div className="p-6 text-dynamic-text-secondary">Loading staff...</div>}
            {!loading && employees.length === 0 && (
              <div className="p-6 text-dynamic-text-secondary">No staff yet — add your first team member.</div>
            )}
            {employees.map(e => (
              <div key={e.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{e.name}</span>
                    <Badge variant="outline">{e.role.replace('_', ' ')}</Badge>
                    {!e.available && <Badge variant="secondary">Unavailable</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2 mr-2">
                    <Switch checked={!!e.available} onCheckedChange={() => toggleAvailability(e)} disabled={!!editing} />
                    <Label className="text-sm text-dynamic-text-secondary">Available</Label>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(e)} disabled={!!editing}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(e)} disabled={!!editing}>
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

export default AdminStaffPage;
