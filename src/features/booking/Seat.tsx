import React from 'react';

interface SeatProps {
    seat: string;
    isSelected: boolean;
    isBooked: boolean;
    onPointerDown: (e: React.PointerEvent, seat: string) => void;
    onPointerEnter: (seat: string) => void;
}

const Seat = React.memo(({ seat, isSelected, isBooked, onPointerDown, onPointerEnter }: SeatProps) => {
    return (
        <button
            disabled={isBooked}
            onPointerDown={(e) => onPointerDown(e, seat)}
            onPointerEnter={() => onPointerEnter(seat)}
            style={{
                cursor: isBooked ? 'not-allowed' : 'pointer',
                touchAction: 'none',
                backgroundColor: isBooked
                    ? '#444'
                    : isSelected
                        ? '#4caf50'
                        : '#fff',
                color: isBooked ? '#aaa' : '#000',
                border: isBooked ? '1px solid #666' : '1px solid #000',
                opacity: isBooked ? 0.6 : 1,
            }}
        >
            {seat}
        </button>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isBooked === nextProps.isBooked &&
        prevProps.seat === nextProps.seat
    );
});

export default Seat;
