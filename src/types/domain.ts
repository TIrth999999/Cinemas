export interface Movie {
    id: string;
    name: string;
    description: string;
    date: string; // ISO date string
    type: string;
    image: string;
    duration: string;
}

export interface Theater {
    id: string;
    name: string;
    location: string;
    image?: string;
}

export interface ShowTime {
    id: string;
    startTime: string; // ISO
    movie: {
        name: string;
    };
    price: Price[];
    screen: {
        layout: any;
    };
    orders: any[];
}

export interface Price {
    layoutType: string;
    price: number;
}
