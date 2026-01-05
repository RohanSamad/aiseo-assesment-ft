export type SeatStatus = 'available' | 'reserved' | 'sold' | 'held';
export type PriceTier = 1 | 2 | 3 | 4;

export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: PriceTier;
  status: SeatStatus;
}

export interface Row {
  index: number;
  seats: Seat[];
}

export interface Section {
  id: string;
  label: string;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  rows: Row[];
}

export interface Venue {
  venueId: string;
  name: string;
  map: {
    width: number;
    height: number;
  };
  sections: Section[];
}

export interface PriceTierConfig {
  tier: PriceTier;
  price: number;
  label: string;
}
