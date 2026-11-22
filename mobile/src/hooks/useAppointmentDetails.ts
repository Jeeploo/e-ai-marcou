import { useEffect, useState } from 'react';
import { demoPatient } from '../config/api';
import { useAppointments } from '../contexts/AppointmentsContext';
import { findAppointmentById } from '../controllers/appointmentController';
import type { Appointment } from '../models/AppointmentModel';
import { ApiError, getApiErrorMessage } from '../services/api';
import { getAppointment } from '../services/appointmentsService';

type DetailState =
  | { status: 'loading' | 'missing' }
  | { status: 'ready'; appointment: Appointment }
  | { status: 'error'; message: string };

export function useAppointmentDetails(id: string) {
  const { appointments, loading, demoMode } = useAppointments();
  const cached = findAppointmentById(appointments, id);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ id: string; attempt: number; detail: DetailState }>();
  const shouldFetch = !cached && !loading && !demoMode;

  useEffect(() => {
    if (!shouldFetch) return;
    let active = true;
    function finish(detail: DetailState) {
      if (active) setResult({ id, attempt, detail });
    }

    void getAppointment(id, demoPatient.id).then(
      (appointment) => finish(appointment ? { status: 'ready', appointment } : { status: 'missing' }),
      (error: unknown) => finish(error instanceof ApiError && error.status === 404
        ? { status: 'missing' }
        : { status: 'error', message: getApiErrorMessage(error) }),
    );
    return () => { active = false; };
  }, [id, attempt, shouldFetch]);

  const detail: DetailState = cached
    ? { status: 'ready', appointment: cached }
    : demoMode ? { status: 'missing' }
      : result?.id === id && result.attempt === attempt ? result.detail : { status: 'loading' };

  return { detail, retry: () => setAttempt((current) => current + 1) };
}
