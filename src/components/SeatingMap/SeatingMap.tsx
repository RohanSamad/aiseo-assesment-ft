import { useState, useMemo, useRef, useEffect } from 'react';
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
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

    // Touch zoom state
    const lastTouchDistance = useRef<number | null>(null);

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
        const padding = 200; // Increased padding for smoother panning
        return allSeatsData.filter(({ seat }) => {
            return (
                seat.x >= viewBox.x - padding &&
                seat.x <= viewBox.x + viewBox.width + padding &&
                seat.y >= viewBox.y - padding &&
                seat.y <= viewBox.y + viewBox.height + padding
            );
        });
    }, [allSeatsData, viewBox]);

    const handleZoom = (delta: number, centerX?: number, centerY?: number) => {
        setViewBox((prev) => {
            const newWidth = prev.width * delta;
            const newHeight = prev.height * delta;

            // Limit zoom
            if (newWidth < 400 || newWidth > venue.map.width * 2) {
                return prev;
            }

            // Zoom towards center/mouse position
            let xRatio = 0.5;
            let yRatio = 0.5;

            if (centerX !== undefined && centerY !== undefined && svgRef.current) {
                const rect = svgRef.current.getBoundingClientRect();
                xRatio = (centerX - rect.left) / rect.width;
                yRatio = (centerY - rect.top) / rect.height;
            }

            return {
                x: prev.x + (prev.width - newWidth) * xRatio,
                y: prev.y + (prev.height - newHeight) * yRatio,
                width: newWidth,
                height: newHeight,
            };
        });
    };

    // Pan handling
    const startPan = (clientX: number, clientY: number) => {
        setIsDragging(true);
        setLastMousePosition({ x: clientX, y: clientY });
    };

    const movePan = (clientX: number, clientY: number) => {
        if (!isDragging) return;

        const dx = clientX - lastMousePosition.x;
        const dy = clientY - lastMousePosition.y;

        if (svgRef.current) {
            const rect = svgRef.current.getBoundingClientRect();
            // Convert screen pixels to SVG units
            const svgDx = (dx / rect.width) * viewBox.width;
            const svgDy = (dy / rect.height) * viewBox.height;

            setViewBox(prev => ({
                ...prev,
                x: prev.x - svgDx,
                y: prev.y - svgDy
            }));

            setLastMousePosition({ x: clientX, y: clientY });
        }
    };

    const endPan = () => {
        setIsDragging(false);
        lastTouchDistance.current = null;
    };

    // Touch Handling for Pinch Zoom & Pan
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch start
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            lastTouchDistance.current = dist;
        } else if (e.touches.length === 1) {
            // Pan start
            startPan(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent page scroll

        if (e.touches.length === 2 && lastTouchDistance.current !== null) {
            // Pinch Zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

            // Calculate center of pinch for zoom origin
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;

            // Determine scale factor (inverse logic: smaller dist = zoom out)
            // If new dist is smaller than old, we pinch in (zoom out) -> factor > 1
            // If new dist is larger, we pinch out (zoom in) -> factor < 1
            const scaleFactor = lastTouchDistance.current / dist;

            // Apply a damper to make it less sensitive
            const dampedFactor = 1 + (scaleFactor - 1) * 0.8;

            handleZoom(dampedFactor, centerX, centerY);
            lastTouchDistance.current = dist;
        } else if (e.touches.length === 1) {
            // Pan
            movePan(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    // Unified wheel handler for non-passive listener
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            // Standardize delta
            const delta = e.deltaY > 0 ? 1.1 : 0.9;
            handleZoom(delta, e.clientX, e.clientY);
        };

        svg.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            svg.removeEventListener('wheel', onWheel);
        };
    }, []); // Empty dependency array might cause stale closures for handleZoom if it depends on state.
    // handleZoom uses setViewBox(prev => ...), so it is safe!

    return (
        <div className="seating-map-container">
            <div className="map-header">
                <div className="legend">
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#22c55e' }}></span>
                        <span>Available</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                        <span>Selected</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#f97316' }}></span>
                        <span>Reserved</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#6b7280' }}></span>
                        <span>Sold</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#eab308' }}></span>
                        <span>Held</span>
                    </div>
                </div>
                <div className="map-stats">
                    Showing {visibleSeats.length.toLocaleString()} seats
                </div>
            </div>

            <svg
                ref={svgRef}
                className="map-viewport"
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}

                // Mouse Events
                onMouseDown={(e) => startPan(e.clientX, e.clientY)}
                onMouseMove={(e) => movePan(e.clientX, e.clientY)}
                onMouseUp={endPan}
                onMouseLeave={endPan}

                // Touch Events
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={endPan}

                role="application"
                aria-label={`Seating map for ${venue.name}`}
                style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            >
                {/* Render section labels */}
                {venue.sections.map((section) => {
                    const firstSeat = section.rows[0]?.seats[0];
                    if (!firstSeat) return null;
                    return (
                        <text
                            key={`label-${section.id}`}
                            x={firstSeat.x - 20}
                            y={firstSeat.y - 15}
                            fontSize="14"
                            fontWeight="bold"
                            fill="rgba(255,255,255,0.7)"
                            style={{ pointerEvents: 'none' }}
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

            <div className="map-controls">
                <button
                    className="control-btn"
                    onClick={() => handleZoom(0.8)}
                    aria-label="Zoom In"
                    style={{ fontSize: '24px', fontWeight: '400', color: 'white' }}
                >
                    +
                </button>
                <button
                    className="control-btn"
                    onClick={() => handleZoom(1.2)}
                    aria-label="Zoom Out"
                    style={{ fontSize: '24px', fontWeight: '400', color: 'white' }}
                >
                    −
                </button>
            </div>
        </div>
    );
}
