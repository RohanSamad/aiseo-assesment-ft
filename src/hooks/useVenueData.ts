import { useState, useEffect } from 'react';
import type { Venue } from '../types/venue';

export function useVenueData() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/venue.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch venue data');
        }
        return response.json();
      })
      .then((data: Venue) => {
        setVenue(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { venue, loading, error };
}
