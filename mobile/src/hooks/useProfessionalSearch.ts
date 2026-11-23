import { useEffect, useState } from 'react';
import { searchDemoProfessionals, searchRemoteProfessionals } from '../controllers/searchController';
import type { LocationReference, Professional, SearchFilters } from '../models/SearchModel';

type SearchState =
  | { status: 'loading' | 'error' }
  | { status: 'ready'; results: Professional[] };

export function useProfessionalSearch(query: string, filters: SearchFilters, location: LocationReference) {
  const [demo, setDemo] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SearchState>({ status: 'loading' });

  useEffect(() => {
    if (demo) return;
    let active = true;
    setState({ status: 'loading' });
    const timer = setTimeout(() => {
      void searchRemoteProfessionals(query, filters, location).then(
        (results) => { if (active) setState({ status: 'ready', results }); },
        () => { if (active) setState({ status: 'error' }); },
      );
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, filters, location, demo, attempt]);

  function retry() {
    setState({ status: 'loading' });
    setDemo(false);
    setAttempt((current) => current + 1);
  }

  const results = demo ? searchDemoProfessionals(query, filters) : state.status === 'ready' ? state.results : [];
  return {
    results,
    demo,
    loading: !demo && state.status === 'loading',
    error: !demo && state.status === 'error',
    retry,
    useDemo: () => setDemo(true),
  };
}
