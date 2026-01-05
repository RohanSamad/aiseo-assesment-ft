import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MAX_SEATS = 8;

export function useSelection() {
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>('selected-seats', []);

  const toggleSeat = useCallback(
    (seatId: string) => {
      setSelectedIds((current) => {
        if (current.includes(seatId)) {
          // Remove seat
          return current.filter((id) => id !== seatId);
        } else {
          // Add seat if under limit
          if (current.length >= MAX_SEATS) {
            return current;
          }
          return [...current, seatId];
        }
      });
    },
    [setSelectedIds]
  );

  const removeSeat = useCallback(
    (seatId: string) => {
      setSelectedIds((current) => current.filter((id) => id !== seatId));
    },
    [setSelectedIds]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, [setSelectedIds]);

  const isSelected = useCallback(
    (seatId: string) => {
      return selectedIds.includes(seatId);
    },
    [selectedIds]
  );

  const canAddMore = selectedIds.length < MAX_SEATS;

  return {
    selectedIds,
    toggleSeat,
    removeSeat,
    clearSelection,
    isSelected,
    canAddMore,
    maxSeats: MAX_SEATS,
  };
}
