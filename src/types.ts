
export type CardType = {
  id: string;
  name: string;
  description: string;
  duration: number;
  image: string;
  category: string[];
  languages: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type TheaterType = {
  id: string;
  name: string;
  location: string;
}

export type MovieType = {
  id: string;
  name: string;
  description: string;
  duration: number;
  image: string;
  category: string[];
  languages: string[];
  createdAt: Date;
  updatedAt: Date;
  theaters: TheaterType[];
}

export type LayoutBlock = {
  type: string
  layout: {
    rows: string[]
    columns: [number, number]
  }
}

export type PriceType = {
  price: number
  layoutType: string
}

export type SeatData = {
  row: string;
  column: number;
  layoutType: string;
}

export type Order = {
  id: string;
  transactionId: string;
  userId: string;
  showtimeId: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  seatData: {
    seats: SeatData[];
  };
  createdAt: string;
  updatedAt: string;
  showtime: {
    id: string;
    startTime: string;
    movie: {
      id: string;
      name: string;
    };
    screen: {
      id: string;
      theaterName: string;
    };
  };
}