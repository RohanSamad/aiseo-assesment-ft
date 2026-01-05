import { useState, useMemo, useRef } from 'react';
import type { Venue, Seat as SeatType } from '../../types/venue';
import { Seat } from '../Seat/Seat';
import './SeatingMap.css';

interface SeatingMapProps {
    venue: Venue;
    selectedIds: string[];
    onToggleSeat: (seatId: string) => void;
    onSeatFocus: (seat: SeatType, sectionLabel: string, rowIndex: number) => void;
}

export function SeatingMap({ venue, selectedIds, onToggleSeat, onSeatFocus }: SeatingMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: venue.map.width, height: venue.map.height });

    // Flatten all seats with their metadata for easier rendering
    const allSeatsData = useMemo(() => {
        const seats: Array<{
            seat: SeatType;
            sectionLabel: string;
            rowIndex: number;
            sectionId: string;
        }> = [];

        for (const section of venue.sections) {
            for (const row of section.rows) {
                for (const seat of row.seats) {
                    seats.push({
                        seat,
                        sectionLabel: section.label,
                        rowIndex: row.index,
                        sectionId: section.id,
                    });
                }
            }
        }

        return seats;
    }, [venue]);

    // Simple viewport culling - only render seats within viewport (with padding)
    const visibleSeats = useMemo(() => {
        const padding = 100; // Extra padding to avoid pop-in
        return allSeatsData.filter(({ seat }) => {
            return (
                seat.x >= viewBox.x - padding &&
                seat.x <= viewBox.x + viewBox.width + padding &&
                seat.y >= viewBox.y - padding &&
                seat.y <= viewBox.y + viewBox.height + padding
            );
        });
    }, [allSeatsData, viewBox]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1.1 : 0.9;

        setViewBox((prev) => {
            const newWidth = prev.width * delta;
            const newHeight = prev.height * delta;

            // Limit zoom
            if (newWidth < 400 || newWidth > venue.map.width * 2) {
                return prev;
            }

            // Zoom towards mouse position
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect) {
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                return {
                    x: prev.x + (prev.width - newWidth) * x,
                    y: prev.y + (prev.height - newHeight) * y,
                    width: newWidth,
                    height: newHeight,
                };
            }

            return {
                ...prev,
                width: newWidth,
                height: newHeight,
            };
        });
    };

    return (
        <div className="seating-map-container">
            <div className="seating-map-controls">
                <div className="seating-map-legend">
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#22c55e' }}></span>
                        <span>Available</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#3b82f6' }}></span>
                        <span>Selected</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#f97316' }}></span>
                        <span>Reserved</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#6b7280' }}></span>
                        <span>Sold</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#eab308' }}></span>
                        <span>Held</span>
                    </div>
                </div>
                <div className="seating-map-info">
                    <p>
                        Showing {visibleSeats.length} of {allSeatsData.length} seats
                    </p>
                    <p className="seating-map-hint">Use mouse wheel to zoom, drag to pan</p>
                </div>
            </div>

            <svg
                ref={svgRef}
                className="seating-map-svg"
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                onWheel={handleWheel}
                role="application"
                aria-label={`Seating map for ${venue.name}`}
            >
                {/* Render section labels */}
                {venue.sections.map((section) => {
                    // Calculate section center for label
                    const firstSeat = section.rows[0]?.seats[0];
                    if (!firstSeat) return null;

                    return (
                        <text
                            key={`label-${section.id}`}
                            x={firstSeat.x - 20}
                            y={firstSeat.y - 15}
                            fontSize="12"
                            fontWeight="bold"
                            fill="#374151"
                        >
                            {section.label}
                        </text>
                    );
                })}

                {/* Render visible seats */}
                {visibleSeats.map(({ seat, sectionLabel, rowIndex }) => (
                    <Seat
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedIds.includes(seat.id)}
                        onToggle={onToggleSeat}
                        onFocus={(s) => onSeatFocus(s, sectionLabel, rowIndex)}
                        sectionLabel={sectionLabel}
                        rowIndex={rowIndex}
                    />
                ))}
            </svg>
        </div>
    );
}
