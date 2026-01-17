import React from 'react';

type GraphicProps = {
    className?: string;
};

export const SkylineGraphic1 = ({ className }: GraphicProps) => (
    <svg viewBox="0 0 400 200" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
        {/* Complex Metropolis Skyline */}
        <path d="M20 200 V150 H50 V180 H70 V120 H100 V160 H120 V80 H160 V140 H190 V50 H240 V130 H270 V90 H310 V160 H340 V110 H380 V200"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Windows and Details */}
        <path d="M125 90 H155 M125 100 H155 M125 110 H155 M125 120 H155 M125 130 H155" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <path d="M195 60 H235 M195 70 H235 M195 80 H235 M195 90 H235 M195 100 H235 M195 110 H235" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <rect x="200" y="60" width="30" height="60" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />

        {/* Crane/Antenna Details */}
        <line x1="215" y1="50" x2="215" y2="20" stroke="currentColor" strokeWidth="1" />
        <line x1="215" y1="20" x2="230" y2="30" stroke="currentColor" strokeWidth="1" />

        {/* Bridge Structure in background */}
        <path d="M0 180 Q100 140 200 180 T400 180" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="4,2" />
    </svg>
);

export const SkylineGraphic2 = ({ className }: GraphicProps) => (
    <svg viewBox="0 0 400 200" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
        {/* Industrial/Urban Complex */}
        <path d="M380 200 V100 L350 70 L320 100 V200 M320 140 H280 V200 M280 160 H220 V200 M220 120 H160 V200 M160 150 H120 V180 H80 V200"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Truss Pattern */}
        <path d="M160 120 L220 160 M220 120 L160 160" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        <path d="M280 160 L320 200 M320 160 L280 200" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />

        {/* Ventilation/Pipes */}
        <path d="M100 150 V120 H120 V150" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="100" y1="130" x2="120" y2="130" stroke="currentColor" strokeWidth="0.5" />

        {/* Clouds/Smoke stylized */}
        <path d="M300 60 Q320 40 340 60 T380 60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
);

export const CinemaFacadeGraphic = ({ className }: GraphicProps) => (
    <svg viewBox="0 0 400 200" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
        {/* Art Deco Detailed Cinema */}
        <path d="M360 200 V80 H320 V200 M320 80 L300 60 H240 L220 80 M220 200 V80 H180 V200 M240 60 V40 H300 V60"
            fill="none" stroke="currentColor" strokeWidth="1.5" />

        {/* Marquee Detail */}
        <rect x="230" y="80" width="80" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="230" y1="90" x2="310" y2="90" stroke="currentColor" strokeWidth="0.5" />
        <line x1="230" y1="110" x2="310" y2="110" stroke="currentColor" strokeWidth="0.5" />
        <text x="270" y="105" textAnchor="middle" fontSize="12" fill="currentColor" fontFamily="serif" letterSpacing="2">CINEMA</text>

        {/* Decorative Rays */}
        <path d="M270 40 L250 20 M270 40 L270 10 M270 40 L290 20" stroke="currentColor" strokeWidth="1" opacity="0.6" />

        {/* Pillars */}
        <path d="M190 80 V200 M200 80 V200 M210 80 V200" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        <path d="M330 80 V200 M340 80 V200 M350 80 V200" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
    </svg>
);

export const CityNetworkGraphic = ({ className }: GraphicProps) => (
    <svg viewBox="0 0 400 200" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
        {/* Complex Connected City */}
        <path d="M380 180 L340 100 L280 140 L220 60 L160 120 L100 80 L60 160" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M360 200 L320 120 L260 160 L200 80 L140 140 L80 100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeDasharray="4,4" />

        {/* Nodes */}
        <circle cx="220" cy="60" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="280" cy="140" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="160" cy="120" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="80" r="3" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Vertical Data Lines */}
        <line x1="220" y1="60" x2="220" y2="200" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="280" y1="140" x2="280" y2="200" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="100" y1="80" x2="100" y2="200" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
);

export const ModernBuildingGraphic = ({ className }: GraphicProps) => (
    <svg viewBox="0 0 400 200" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
        {/* Gherkin/Shard Style Complex */}
        <path d="M340 200 L340 60 Q300 20 260 60 V200 M260 150 H200 V200 M200 100 L160 140 V200"
            fill="none" stroke="currentColor" strokeWidth="1.5" />

        {/* Diamond Pattern on main tower */}
        <path d="M260 60 L300 90 L340 60 M260 90 L300 120 L340 90 M260 120 L300 150 L340 120 M260 150 L300 180 L340 150"
            stroke="currentColor" strokeWidth="0.5" opacity="0.6" fill="none" />

        {/* Glass lines on smaller buildings */}
        <line x1="200" y1="160" x2="260" y2="160" stroke="currentColor" strokeWidth="0.5" />
        <line x1="200" y1="170" x2="260" y2="170" stroke="currentColor" strokeWidth="0.5" />
        <line x1="200" y1="180" x2="260" y2="180" stroke="currentColor" strokeWidth="0.5" />

        <line x1="160" y1="150" x2="180" y2="150" stroke="currentColor" strokeWidth="0.5" />
        <line x1="160" y1="160" x2="190" y2="160" stroke="currentColor" strokeWidth="0.5" />
    </svg>
);

const graphics = [SkylineGraphic1, SkylineGraphic2, CinemaFacadeGraphic, CityNetworkGraphic, ModernBuildingGraphic];

export const getCinemaGraphic = (id: number | string) => {
    const numericId = typeof id === 'string' ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : id;
    const Index = Math.abs(Number(numericId)) % graphics.length;
    return graphics[Index];
};
