// Script to generate venue.json with 15,000+ seats for performance testing

const SEAT_RADIUS = 6;
const SEAT_SPACING = 16;
const ROW_SPACING = 20;

function generateSeats(
  sectionId,
  startRow,
  numRows,
  seatsPerRow,
  startX,
  startY,
  priceTier
) {
  const rows = [];
  const statuses = ['available', 'reserved', 'sold', 'held'];

  for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
    const seats = [];
    const actualRow = startRow + rowIdx;
    const rowY = startY + rowIdx * ROW_SPACING;

    for (let col = 1; col <= seatsPerRow; col++) {
      const seatX = startX + (col - 1) * SEAT_SPACING;
      
      // Randomize status: 70% available, 15% reserved, 10% sold, 5% held
      const rand = Math.random();
      let status;
      if (rand < 0.7) status = 'available';
      else if (rand < 0.85) status = 'reserved';
      else if (rand < 0.95) status = 'sold';
      else status = 'held';

      seats.push({
        id: `${sectionId}-${actualRow}-${String(col).padStart(2, '0')}`,
        col,
        x: seatX,
        y: rowY,
        priceTier,
        status,
      });
    }

    rows.push({
      index: actualRow,
      seats,
    });
  }

  return rows;
}

function generateVenue() {
  const sections = [];

  // VIP Section - Front center (Tier 1 - $150)
  sections.push({
    id: 'VIP',
    label: 'VIP Section',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('VIP', 1, 20, 60, 400, 50, 1),
  });

  // Lower Bowl A - Left (Tier 2 - $100)
  sections.push({
    id: 'LB-A',
    label: 'Lower Bowl A',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('LB-A', 1, 35, 50, 50, 250, 2),
  });

  // Lower Bowl B - Right (Tier 2 - $100)
  sections.push({
    id: 'LB-B',
    label: 'Lower Bowl B',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('LB-B', 1, 35, 50, 700, 250, 2),
  });

  // Lower Bowl C - Back Left (Tier 3 - $75)
  sections.push({
    id: 'LB-C',
    label: 'Lower Bowl C',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('LB-C', 1, 25, 45, 50, 750, 3),
  });

  // Lower Bowl D - Back Right (Tier 3 - $75)
  sections.push({
    id: 'LB-D',
    label: 'Lower Bowl D',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('LB-D', 1, 25, 45, 700, 750, 3),
  });

  // Upper Bowl A - Far Left (Tier 4 - $50)
  sections.push({
    id: 'UB-A',
    label: 'Upper Bowl A',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('UB-A', 1, 35, 55, 50, 1200, 4),
  });

  // Upper Bowl B - Far Right (Tier 4 - $50)
  sections.push({
    id: 'UB-B',
    label: 'Upper Bowl B',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('UB-B', 1, 35, 55, 700, 1200, 4),
  });

  // Upper Bowl C - Top Left (Tier 4 - $50)
  sections.push({
    id: 'UB-C',
    label: 'Upper Bowl C',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('UB-C', 1, 30, 50, 50, 1800, 4),
  });

  // Upper Bowl D - Top Right (Tier 4 - $50)
  sections.push({
    id: 'UB-D',
    label: 'Upper Bowl D',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('UB-D', 1, 30, 50, 700, 1800, 4),
  });

  // Balcony Section - Top center (Tier 4 - $50)
  sections.push({
    id: 'BAL',
    label: 'Balcony',
    transform: { x: 0, y: 0, scale: 1 },
    rows: generateSeats('BAL', 1, 25, 50, 400, 2200, 4),
  });

  const venue = {
    venueId: 'arena-01',
    name: 'Metropolis Arena',
    map: { width: 1400, height: 2600 },
    sections,
  };

  return venue;
}

// Calculate total seats
const venue = generateVenue();
const totalSeats = venue.sections.reduce(
  (total, section) =>
    total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0),
  0
);

console.error(`Generated venue with ${totalSeats} seats`);
console.log(JSON.stringify(venue, null, 2));
