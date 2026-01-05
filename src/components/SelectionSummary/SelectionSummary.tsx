import type { Venue, Seat } from '../../types/venue';
import { getPrice } from '../../utils/priceCalculator';
import './SelectionSummary.css';

interface SelectionSummaryProps {
    selectedIds: string[];
    venue: Venue;
    onRemoveSeat: (seatId: string) => void;
    onClearAll: () => void;
    maxSeats: number;
}

export function SelectionSummary({
    selectedIds,
    venue,
    onRemoveSeat,
    onClearAll,
    maxSeats,
}: SelectionSummaryProps) {
    // Find seat details for selected IDs
    const selectedSeats: Array<{ seat: Seat; section: string; row: number }> = [];

    for (const section of venue.sections) {
        for (const row of section.rows) {
            for (const seat of row.seats) {
                if (selectedIds.includes(seat.id)) {
                    selectedSeats.push({ seat, section: section.label, row: row.index });
                }
            }
        }
    }

    const subtotal = selectedSeats.reduce((total, { seat }) => total + getPrice(seat.priceTier), 0);

    return (
        <div className="selection-summary">
            <div className="selection-header">
                <h2>Your Selection</h2>
                <span className="selection-count">
                    {selectedIds.length} / {maxSeats} seats
                </span>
            </div>

            {selectedIds.length === 0 ? (
                <div className="selection-empty">
                    <p>No seats selected</p>
                    <p className="selection-hint">Click on available seats to select (max {maxSeats})</p>
                </div>
            ) : (
                <>
                    <div className="selection-list">
                        {selectedSeats.map(({ seat, section, row }) => (
                            <div key={seat.id} className="selection-item">
                                <div className="selection-item-info">
                                    <span className="selection-item-name">
                                        {section} - Row {row}, Seat {seat.col}
                                    </span>
                                    <span className="selection-item-price">${getPrice(seat.priceTier)}</span>
                                </div>
                                <button
                                    onClick={() => onRemoveSeat(seat.id)}
                                    className="selection-item-remove"
                                    aria-label={`Remove ${section} Row ${row} Seat ${seat.col}`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="selection-footer">
                        <div className="selection-subtotal">
                            <span>Subtotal:</span>
                            <span className="selection-subtotal-amount">${subtotal}</span>
                        </div>
                        <button onClick={onClearAll} className="selection-clear-btn">
                            Clear All
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
