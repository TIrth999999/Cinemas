import React from 'react';
import Seat from './Seat';
import type { LayoutBlock, PriceType } from '../../types';

interface SeatGridProps {
    layout: LayoutBlock[];
    prices: PriceType[];
    selectedSeats: Array<{ seat: string }>;
    bookedSeatsSet: Set<string>;
    onSeatAction: (seat: string, type: 'down' | 'enter', event?: React.PointerEvent) => void;
}

const SeatGrid = React.memo(({ layout, prices, selectedSeats, bookedSeatsSet, onSeatAction }: SeatGridProps) => {

    const getPriceForType = (layoutType: string) => {
        const priceObj = prices.find(p => p.layoutType === layoutType);
        return priceObj?.price || prices[0]?.price || 0;
    };

    return (
        <div className='seats'>
            {layout.map(section => {
                const price = getPriceForType(section.type);

                return (
                    <div key={section.type} className="seat-section">
                        <h6>₹{price} {section.type}</h6>
                        <hr />
                        {section.layout.rows.map(row => (
                            <div key={row} className="seat-row">
                                {Array.from({ length: section.layout.columns[1] }, (_, i) => {
                                    const seat = `${row}${i + 1}`;
                                    const isSelected = selectedSeats.some(s => s.seat === seat);
                                    const isBooked = bookedSeatsSet.has(seat);

                                    return (
                                        <Seat
                                            key={seat}
                                            seat={seat}
                                            isSelected={isSelected}
                                            isBooked={isBooked}
                                            onPointerDown={(e) => onSeatAction(seat, 'down', e)}
                                            onPointerEnter={() => onSeatAction(seat, 'enter')}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                );
            })}
            <div className='theater-screen'></div>
            <p>All eyes this way please!</p>
        </div>
    );
});

export default SeatGrid;
