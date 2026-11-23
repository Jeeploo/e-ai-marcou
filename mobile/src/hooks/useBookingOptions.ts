import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { loadBookingOptions } from '../controllers/bookingController';
import type { RootStackParamList } from '../navigation/types';

type OptionsState =
  | { status: 'loading' | 'error' }
  | { status: 'ready'; options: Awaited<ReturnType<typeof loadBookingOptions>> };

export function useBookingOptions(route: RootStackParamList['BookingSlots']) {
  const [attempt, setAttempt] = useState(0);
  const [fallback, setFallback] = useState(false);
  const demo = Boolean(route.demo || fallback);
  const [state, setState] = useState<OptionsState>({ status: 'loading' });

  useFocusEffect(useCallback(() => {
    let active = true;
    setState({ status: 'loading' });
    void loadBookingOptions({ ...route, demo }).then(
      (options) => { if (active) setState({ status: 'ready', options }); },
      () => { if (active) setState({ status: 'error' }); },
    );
    return () => { active = false; };
  }, [route, demo, attempt]));

  return {
    demo,
    loading: state.status === 'loading',
    error: state.status === 'error',
    options: state.status === 'ready' ? state.options : null,
    retry: () => {
      setState({ status: 'loading' });
      setFallback(false);
      setAttempt((current) => current + 1);
    },
    useDemo: () => {
      setState({ status: 'loading' });
      setFallback(true);
    },
  };
}
