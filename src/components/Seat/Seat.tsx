import { memo } from 'react';
import type { Seat as SeatType, SeatStatus } from '../../types/venue';
import './Seat.css';

interface SeatProps {
    seat: SeatType;
    isSelected: boolean;
    onToggle: (seatId: string) => void;
    onFocus: (seat: SeatType) => void;
    sectionLabel: string;
    rowIndex: number;
}

const STATUS_COLORS: Record<SeatStatus | 'selected', string> = {
    available: '#22c55e',
    reserved: '#f97316',
    sold: '#6b7280',
    held: '#eab308',
    selected: '#3b82f6',
};

function SeatComponent({ seat, isSelected, onToggle, onFocus, sectionLabel, rowIndex }: SeatProps) {
    const isClickable = seat.status === 'available' || isSelected;

    const handleClick = () => {
        if (isClickable) {
            onToggle(seat.id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onToggle(seat.id);
        }
    };

    const color = isSelected ? STATUS_COLORS.selected : STATUS_COLORS[seat.status];

    const ariaLabel = `Section ${sectionLabel}, Row ${rowIndex}, Seat ${seat.col}, ${seat.status}${isSelected ? ', selected' : ''}`;

    return (
        <circle
            cx={seat.x}
            cy={seat.y}
            r={5}
            fill={color}
            stroke={isSelected ? '#1e40af' : 'none'}
            strokeWidth={isSelected ? 2 : 0}
            className={`seat ${isClickable ? 'seat-clickable' : 'seat-disabled'}`}
            onClick={handleClick}
            onFocus={() => onFocus(seat)}
            onMouseEnter={() => onFocus(seat)}
            onKeyDown={handleKeyDown}
            tabIndex={isClickable ? 0 : -1}
            role="button"
            aria-label={ariaLabel}
            aria-pressed={isSelected}
        />
    );
}

export const Seat = memo(SeatComponent);
