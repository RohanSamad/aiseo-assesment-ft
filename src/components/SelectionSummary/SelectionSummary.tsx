import type { Venue, Seat } from '../../types/venue';
import { getPrice, getPriceLabel } from '../../utils/priceCalculator';
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
            <div className="summary-header">
                <h2>Your Selection</h2>
                <span className="seat-count">
                    {selectedIds.length} / {maxSeats} seats
                </span>
            </div>

            {selectedIds.length === 0 ? (
                <div className="empty-state">
                    <p>No seats selected</p>
                    <p>Click on available seats to select (max {maxSeats})</p>
                </div>
            ) : (
                <>
                    <div className="summary-content">
                        <ul className="selected-list">
                            {selectedSeats.map(({ seat, section, row }) => (
                                <li key={seat.id} className="selected-item">
                                    <div className="item-info">
                                        <div className="item-location">
                                            {section} - Row {row}, Seat {seat.col}
                                        </div>
                                        <div className="item-tier">
                                            {getPriceLabel(seat.priceTier)} Tier
                                        </div>
                                    </div>

                                    <div className="item-price-actions">
                                        <div className="item-price">${getPrice(seat.priceTier)}</div>
                                        <button
                                            onClick={() => onRemoveSeat(seat.id)}
                                            className="remove-btn"
                                            aria-label={`Remove seat`}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="summary-footer">
                        <div className="total-row">
                            <span className="total-label">Subtotal</span>
                            <span className="total-amount">${subtotal}</span>
                        </div>
                        <button className="checkout-btn" disabled={selectedIds.length === 0}>
                            Proceed to Checkout
                        </button>
                        <button onClick={onClearAll} className="clear-btn">
                            Clear Selection
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
