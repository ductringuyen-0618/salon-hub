import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { apiService, Appointment, Customer, Employee } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

type ViewMode = 'day' | 'upcoming';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  CONFIRMED: 'default',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  NO_SHOW: 'destructive',
};

// Statuses staff can move an appointment to directly from this list. Full
// editing (e.g. re-scheduling) still goes through the existing booking flow.
const STATUS_ACTIONS: { value: Appointment['status']; label: string }[] = [
  { value: 'CONFIRMED', label: 'Confirm' },
  { value: 'IN_PROGRESS', label: 'Start' },
  { value: 'COMPLETED', label: 'Complete' },
];

/**
 * Admin → Bookings. Lists every appointment for the tenant (defaulting to
 * today) and lets front desk/managers confirm, progress or cancel from one
 * place. Backed by GET /api/appointments and the existing status/cancel
 * endpoints.
 */
const AdminBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [day, setDay] = useState(new Date());
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const from = viewMode === 'day' ? format(day, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const to = viewMode === 'day' ? format(day, 'yyyy-MM-dd') : undefined;
      const [appts, custs, emps] = await Promise.all([
        apiService.getAppointments(from, to),
        apiService.getCustomers(),
        apiService.getEmployees(),
      ]);
      setAppointments(appts || []);
      setCustomers(custs || []);
      setEmployees(emps || []);
    } catch (err) {
      setLoadError((err as Error).message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [viewMode, day]);

  const customerName = (id: number) => customers.find(c => c.id === id)?.name || `Customer #${id}`;
  const employeeName = (id?: number) => (id ? employees.find(e => e.id === id)?.name : undefined) || 'Unassigned';

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments]
  );

  const changeStatus = async (appt: Appointment, status: Appointment['status']) => {
    setBusyId(appt.id);
    try {
      await apiService.updateAppointmentStatus(appt.id, status);
      success('Appointment updated');
      await load();
    } catch (err: any) {
      showError('Update failed', err?.message || 'Try again');
    } finally {
      setBusyId(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setBusyId(cancelTarget.id);
    try {
      await apiService.deleteAppointment(cancelTarget.id);
      success('Appointment cancelled');
      setCancelTarget(null);
      await load();
    } catch (err: any) {
      showError('Cancel failed', err?.message || 'Try again');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation showBackButton title="Bookings" subtitle="See and manage every appointment on the books" />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant={viewMode === 'day' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('day')}>
              Day
            </Button>
            <Button variant={viewMode === 'upcoming' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('upcoming')}>
              All upcoming
            </Button>
          </div>
        </div>

        {viewMode === 'day' && (
          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setDay(d => addDays(d, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 font-medium min-w-[12rem] justify-center">
              <CalendarDays className="h-4 w-4 text-dynamic-text-secondary" />
              {format(day, 'EEEE, MMMM d, yyyy')}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDay(d => addDays(d, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            {format(day, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
              <Button variant="link" size="sm" onClick={() => setDay(new Date())}>Today</Button>
            )}
          </div>
        )}

        <Card>
          <CardContent className="p-0 divide-y divide-dynamic-border">
            {loading && <div className="p-6 text-dynamic-text-secondary">Loading bookings...</div>}
            {!loading && loadError && (
              <div className="p-6 text-red-600">Could not load bookings: {loadError}</div>
            )}
            {!loading && !loadError && sorted.length === 0 && (
              <div className="p-6 text-dynamic-text-secondary">
                {viewMode === 'day' ? 'No appointments for this day.' : 'No upcoming appointments.'}
              </div>
            )}
            {!loading && !loadError && sorted.map(appt => (
              <div key={appt.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{customerName(appt.customerId)}</span>
                    <Badge variant={STATUS_VARIANT[appt.status] ?? 'outline'}>{appt.status}</Badge>
                  </div>
                  <div className="text-sm text-dynamic-text-secondary mt-1">
                    {format(new Date(appt.startTime), 'MMM d, h:mm a')} · {employeeName(appt.employeeId)}
                  </div>
                  {appt.services?.length > 0 && (
                    <div className="text-sm text-dynamic-text-secondary mt-1">
                      {appt.services.map(s => s.name).join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 flex-wrap">
                  {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                    <>
                      {STATUS_ACTIONS.filter(a => a.value !== appt.status).map(action => (
                        <Button
                          key={action.value}
                          size="sm"
                          variant="outline"
                          disabled={busyId === appt.id}
                          onClick={() => changeStatus(appt, action.value)}
                        >
                          {action.label}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        disabled={busyId === appt.id}
                        onClick={() => setCancelTarget(appt)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Cancel this appointment?</h2>
              <p className="text-sm text-dynamic-text-secondary">
                {customerName(cancelTarget.customerId)} on {format(new Date(cancelTarget.startTime), 'MMM d, h:mm a')}.
                This can't be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={busyId === cancelTarget.id}>
                  Keep it
                </Button>
                <Button variant="destructive" onClick={confirmCancel} disabled={busyId === cancelTarget.id}>
                  {busyId === cancelTarget.id ? 'Cancelling...' : 'Cancel appointment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
