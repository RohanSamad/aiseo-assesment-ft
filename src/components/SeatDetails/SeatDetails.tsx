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
            <div className="seat-details seat-details-empty">
                <p>Click or focus on a seat to see details</p>
            </div>
        );
    }

    const price = getPrice(seat.priceTier);
    const tierLabel = getPriceLabel(seat.priceTier);

    return (
        <div className="seat-details">
            <h3>Seat Information</h3>
            <div className="seat-details-grid">
                <div className="seat-detail-item">
                    <span className="seat-detail-label">Section:</span>
                    <span className="seat-detail-value">{sectionLabel}</span>
                </div>
                <div className="seat-detail-item">
                    <span className="seat-detail-label">Row:</span>
                    <span className="seat-detail-value">{rowIndex}</span>
                </div>
                <div className="seat-detail-item">
                    <span className="seat-detail-label">Seat:</span>
                    <span className="seat-detail-value">{seat.col}</span>
                </div>
                <div className="seat-detail-item">
                    <span className="seat-detail-label">Price Tier:</span>
                    <span className="seat-detail-value">{tierLabel}</span>
                </div>
                <div className="seat-detail-item">
                    <span className="seat-detail-label">Price:</span>
                    <span className="seat-detail-value">${price}</span>
                </div>
                <div className="seat-detail-item">
                    <span className="seat-detail-label">Status:</span>
                    <span className={`seat-detail-value status-${seat.status}`}>
                        {seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    );
}
