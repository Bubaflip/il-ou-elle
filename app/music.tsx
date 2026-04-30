'use client';

import { useEffect, useRef, useState } from 'react';

export default function Music() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.25;

        const start = () => {
            audio.play()
                .then(() => {
                    document.removeEventListener('click', start);
                    document.removeEventListener('touchend', start);
                    document.removeEventListener('keydown', start);
                })
                .catch(() => {});
        };

        document.addEventListener('click', start);
        document.addEventListener('touchend', start);
        document.addEventListener('keydown', start);

        return () => {
            document.removeEventListener('click', start);
            document.removeEventListener('touchend', start);
            document.removeEventListener('keydown', start);
        };
    }, []);

    function toggle() {
        const audio = audioRef.current;
        if (!audio) return;
        const next = !muted;
        audio.muted = next;
        setMuted(next);
        if (!next) audio.play().catch(() => {});
    }

    return (
        <>
            <audio ref={audioRef} src="/flim.mp3" loop preload="auto" />
            <button
                type="button"
                className={`music-toggle ${muted ? 'is-muted' : 'is-playing'}`}
                onClick={toggle}
                aria-label={muted ? 'Activer la musique' : 'Couper la musique'}
                aria-pressed={muted}
            >
                <svg className="music-toggle-svg" viewBox="0 0 40 40" aria-hidden="true">
                    <g className="music-note">
                        <path d="M22 8 L22 26" stroke="#2D3561" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                        <path d="M22 8 C 28 10, 32 14, 30 20" stroke="#2D3561" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <ellipse cx="17" cy="27" rx="6.2" ry="4.6" transform="rotate(-18 17 27)" fill="#FF6B6B" stroke="#2D3561" strokeWidth="3" />
                    </g>
                    <g className="music-waves">
                        <path className="wave wave-1" d="M30 14 Q 34 17, 32 22" stroke="#2D3561" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                        <path className="wave wave-2" d="M34 10 Q 40 16, 36 24" stroke="#2D3561" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                    </g>
                    <path className="music-slash" d="M7 7 L 33 33" stroke="#FF6B6B" strokeWidth="3.6" strokeLinecap="round" fill="none" />
                </svg>
            </button>
        </>
    );
}
