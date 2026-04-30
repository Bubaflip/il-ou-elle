'use client';

const COLORS = ['#FF6B6B', '#FFD93D', '#A8E6CF', '#6BC8EF', '#FFFBE7'];

/** deterministic pseudo-random — visually random, render-pure. */
function rand(seed: number) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

export default function Confetti({ count = 60 }: { count?: number }) {
    const pieces = Array.from({ length: count }, (_, i) => {
        const left  = rand(i + 1) * 100;
        const delay = rand(i + 2) * 1.2;
        const dur   = 2.4 + rand(i + 3) * 2.5;
        const rot   = rand(i + 4) * 360;
        const w     = 8 + rand(i + 5) * 8;
        const h     = 12 + rand(i + 6) * 10;
        const color = COLORS[i % COLORS.length];
        return { left, delay, dur, rot, w, h, color, key: i };
    });

    return (
        <div className="confetti" aria-hidden="true">
            {pieces.map((p) => (
                <i
                    key={p.key}
                    style={{
                        left: `${p.left}%`,
                        background: p.color,
                        width: p.w,
                        height: p.h,
                        transform: `rotate(${p.rot}deg)`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.dur}s`,
                    }}
                />
            ))}
        </div>
    );
}
