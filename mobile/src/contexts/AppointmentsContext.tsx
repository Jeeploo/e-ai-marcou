import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { demoPatient } from '../config/api';
import { canCancelAppointment, cancelLocalAppointment, createMockAppointments } from '../controllers/appointmentController';
import type { Appointment } from '../models/AppointmentModel';
import { getApiErrorMessage } from '../services/api';
import * as service from '../services/appointmentsService';

type AppointmentsState = {
  appointments: readonly Appointment[];
  loading: boolean;
  error: string | null;
  demoMode: boolean;
  refresh: (updatedAppointment?: Appointment) => Promise<void>;
  useDemoData: () => void;
  cancelAppointment: (appointment: Appointment) => Promise<void>;
};

const AppointmentsContext = createContext<AppointmentsState | null>(null);

export function AppointmentsProvider({ children }: PropsWithChildren) {
  const [remoteAppointments, setRemoteAppointments] = useState<Appointment[]>([]);
  const [demoAppointments, setDemoAppointments] = useState(createMockAppointments);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshRequest = useRef<Promise<void> | null>(null);
  const cancellationPending = useRef(false);

  const refresh = useCallback(async (updatedAppointment?: Appointment) => {
    if (updatedAppointment) {
      // Uma leitura iniciada antes do POST/PATCH pode retornar a lista anterior.
      await refreshRequest.current;
      setRemoteAppointments((current) => [
        ...current.filter(({ id }) => id !== updatedAppointment.id),
        updatedAppointment,
      ]);
      setDemoMode(false);
    }
    if (refreshRequest.current) return refreshRequest.current;
    if (cancellationPending.current) return;

    setLoading(true);
    refreshRequest.current = (async () => {
      try {
        setRemoteAppointments(await service.getAppointments(demoPatient.id));
        setError(null);
        setDemoMode(false);
      } catch (error) {
        setError(getApiErrorMessage(error));
      } finally {
        refreshRequest.current = null;
        setLoading(false);
      }
    })();
    return refreshRequest.current;
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function cancelAppointment(appointment: Appointment) {
    if (cancellationPending.current) throw new Error('Cancelamento em andamento.');
    if (!canCancelAppointment(appointment)) throw new Error('A consulta não pode mais ser cancelada.');
    if (demoMode) {
      setDemoAppointments((current) => cancelLocalAppointment(current, appointment.id));
      return;
    }

    cancellationPending.current = true;
    try {
      // Aguarda a leitura em curso para que ela não sobrescreva o resultado do DELETE.
      await refreshRequest.current;
      const cancelled = await service.cancelAppointment(appointment.id, demoPatient.id);
      setRemoteAppointments((current) => {
        const previous = current.find(({ id }) => id === appointment.id) ?? appointment;
        const updated = {
          ...cancelled,
          professionalName: previous.professionalName,
          photoUrl: previous.photoUrl,
          specialty: previous.specialty,
          location: previous.location,
        };
        return current.some(({ id }) => id === appointment.id)
          ? current.map((item) => item.id === appointment.id ? updated : item)
          : [...current, updated];
      });
    } finally {
      cancellationPending.current = false;
    }
  }

  return (
    <AppointmentsContext.Provider value={{
      appointments: demoMode ? demoAppointments : remoteAppointments,
      loading,
      error,
      demoMode,
      refresh,
      useDemoData: () => setDemoMode(true),
      cancelAppointment,
    }}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) throw new Error('useAppointments requires AppointmentsProvider');
  return context;
}
