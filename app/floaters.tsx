'use client';

import React from 'react';

export default function Floaters() {
    return (
        <div className="floaters" aria-hidden="true">
            <Star  className="float float--a" color="#FFD93D" size={42} />
            <Heart className="float float--b" color="#FF6B6B" size={36} />
            <Cloud className="float float--c" size={70} />
            <Star  className="float float--d" color="#6BC8EF" size={28} />
            <Sparkle4 className="float float--e" color="#FF6B6B" size={26} />
            <Sparkle4 className="float float--f" color="#A8E6CF" size={32} />
        </div>
    );
}

function Star({ className, color, size }: { className?: string; color: string; size: number }) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 40 40">
            <path
                d="M20 3 L24 15 L37 16 L27 25 L30 38 L20 31 L10 38 L13 25 L3 16 L16 15 Z"
                fill={color}
                stroke="#2D3561"
                strokeWidth="3"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Heart({ className, color, size }: { className?: string; color: string; size: number }) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 40 40">
            <path
                d="M20 35 C 6 25, 2 15, 10 9 C 15 6, 19 10, 20 13 C 21 10, 25 6, 30 9 C 38 15, 34 25, 20 35 Z"
                fill={color}
                stroke="#2D3561"
                strokeWidth="3"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Cloud({ className, size }: { className?: string; size: number }) {
    return (
        <svg className={className} width={size} height={size * 0.65} viewBox="0 0 80 50">
            <path
                d="M18 38 C 6 38, 4 22, 18 22 C 20 12, 36 10, 40 22 C 50 14, 66 22, 62 32 C 74 30, 78 44, 64 44 L 22 44 C 14 44, 12 40, 18 38 Z"
                fill="#ffffff"
                stroke="#2D3561"
                strokeWidth="3"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Sparkle4({ className, color, size }: { className?: string; color: string; size: number }) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 40 40">
            <path
                d="M20 2 L23 17 L38 20 L23 23 L20 38 L17 23 L2 20 L17 17 Z"
                fill={color}
                stroke="#2D3561"
                strokeWidth="3"
                strokeLinejoin="round"
            />
        </svg>
    );
}
