import { useState } from 'react';
import { useVenueData } from './hooks/useVenueData';
import { useSelection } from './hooks/useSelection';
import { SeatingMap } from './components/SeatingMap/SeatingMap';
import { SeatDetails } from './components/SeatDetails/SeatDetails';
import { SelectionSummary } from './components/SelectionSummary/SelectionSummary';
import type { Seat } from './types/venue';
import './App.css';

function App() {
  const { venue, loading, error } = useVenueData();
  const { selectedIds, toggleSeat, removeSeat, clearSelection, maxSeats } = useSelection();

  const [focusedSeat, setFocusedSeat] = useState<{
    seat: Seat;
    sectionLabel: string;
    rowIndex: number;
  } | null>(null);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading venue data...</p>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="app-error">
        <h1>Error Loading Venue</h1>
        <p>{error?.message || 'Failed to load venue data'}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{venue.name}</h1>
        <p className="app-subtitle">Interactive Seating Map</p>
      </header>

      <div className="app-content">
        <div className="app-main">
          <SeatingMap
            venue={venue}
            selectedIds={selectedIds}
            onToggleSeat={toggleSeat}
            onSeatFocus={(seat, sectionLabel, rowIndex) =>
              setFocusedSeat({ seat, sectionLabel, rowIndex })
            }
          />
          <div className="app-details">
            <SeatDetails
              seat={focusedSeat?.seat || null}
              sectionLabel={focusedSeat?.sectionLabel || ''}
              rowIndex={focusedSeat?.rowIndex || 0}
            />
          </div>
        </div>

        <aside className="app-sidebar">
          <SelectionSummary
            selectedIds={selectedIds}
            venue={venue}
            onRemoveSeat={removeSeat}
            onClearAll={clearSelection}
            maxSeats={maxSeats}
          />
        </aside>
      </div>

      {/* Accessibility announcement region */}
      <div role="status" aria-live="polite" className="sr-only">
        {selectedIds.length > 0 && `${selectedIds.length} seat${selectedIds.length > 1 ? 's' : ''} selected`}
      </div>
    </div>
  );
}

export default App;
