import React from 'react';
import './filmStrip.css';

interface FilmStripProps {
    children?: React.ReactNode;
    animated?: boolean;
    direction?: 'left' | 'right';
    className?: string;
    style?: React.CSSProperties;
}

const FilmStrip: React.FC<FilmStripProps> = ({
    children,
    animated = false,
    direction = 'left',
    className = '',
    style
}) => {
    return (
        <div className={`film-strip-container ${className}`} style={style}>
            <div className={`film-perforations top ${animated ? 'animate-' + direction : ''}`}></div>

            <div className="film-content">
                {children}
            </div>

            <div className={`film-perforations bottom ${animated ? 'animate-' + direction : ''}`}></div>
        </div>
    );
};

export default FilmStrip;
