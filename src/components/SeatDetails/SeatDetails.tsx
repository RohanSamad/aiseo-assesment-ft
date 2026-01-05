import type { Seat } from '../../types/venue';
import { getPrice, getPriceLabel } from '../../utils/priceCalculator';
import './SeatDetails.css';

interface SeatDetailsProps {
    seat: Seat | null;
    sectionLabel: string;
    rowIndex: number;
}

export function SeatDetails({ seat, sectionLabel, rowIndex }: SeatDetailsProps) {
    if (!seat) {
        return (
            <div className="seat-details">
                <div className="no-selection">
                    <p>Select a seat</p>
                    <p>Hover or click to view details</p>
                </div>
            </div>
        );
    }

    const price = getPrice(seat.priceTier);
    const tierLabel = getPriceLabel(seat.priceTier);

    return (
        <div className="seat-details">
            <div className="details-header">
                <h3>Seat Information</h3>
            </div>
            <div className="details-grid">
                <div className="detail-item">
                    <span className="detail-label">Section</span>
                    <span className="detail-value">{sectionLabel}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Row</span>
                    <span className="detail-value">{rowIndex}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Seat</span>
                    <span className="detail-value">{seat.col}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className="detail-value status">
                        <span className="status-dot" style={{
                            background: seat.status === 'available' ? '#22c55e' :
                                seat.status === 'sold' ? '#6b7280' :
                                    seat.status === 'reserved' ? '#f97316' :
                                        '#eab308'
                        }}></span>
                        {seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Tier</span>
                    <span className="detail-value">{tierLabel} Tier</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Price</span>
                    <span className="detail-value price">${price}</span>
                </div>
            </div>
        </div>
    );
}
