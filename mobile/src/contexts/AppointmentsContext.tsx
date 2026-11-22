import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { cancelLocalAppointment, createMockAppointments } from '../controllers/appointmentController';
import type { Appointment } from '../models/AppointmentModel';

type AppointmentsState = {
  appointments: readonly Appointment[];
  cancelAppointment: (appointmentId: string) => void;
};

const AppointmentsContext = createContext<AppointmentsState | null>(null);

export function AppointmentsProvider({ children }: PropsWithChildren) {
  const [appointments, setAppointments] = useState(() => createMockAppointments());

  function cancelAppointment(appointmentId: string) {
    setAppointments((current) => cancelLocalAppointment(current, appointmentId));
  }

  return (
    <AppointmentsContext.Provider value={{ appointments, cancelAppointment }}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) throw new Error('useAppointments requires AppointmentsProvider');
  return context;
}
