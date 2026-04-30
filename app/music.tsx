'use client';

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'iloull:muted';

export default function Music() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [muted, setMuted] = useState(false);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        const initialMuted = saved === '1';
        setMuted(initialMuted);

        const audio = new Audio('/flim.mp3');
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0.25;
        audio.muted = initialMuted;
        audioRef.current = audio;

        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        // Try autoplay immediately. Will fail on most mobile browsers
        // (autoplay-with-sound policy) — the interaction listeners below
        // will retry on the joiner's first tap/keypress.
        audio.play().catch(() => { /* will retry on interaction */ });

        const tryStart = () => {
            if (!audioRef.current) return;
            const a = audioRef.current;
            if (a.muted) return; // user has chosen muted — respect it
            a.play().then(() => {
                window.removeEventListener('pointerdown', tryStart, true);
                window.removeEventListener('touchstart', tryStart, true);
                window.removeEventListener('click', tryStart, true);
                window.removeEventListener('keydown', tryStart, true);
            }).catch(() => { /* will retry on next event */ });
        };

        window.addEventListener('pointerdown', tryStart, true);
        window.addEventListener('touchstart', tryStart, true);
        window.addEventListener('click', tryStart, true);
        window.addEventListener('keydown', tryStart, true);

        return () => {
            window.removeEventListener('pointerdown', tryStart, true);
            window.removeEventListener('touchstart', tryStart, true);
            window.removeEventListener('click', tryStart, true);
            window.removeEventListener('keydown', tryStart, true);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    function toggle() {
        const audio = audioRef.current;
        if (!audio) return;
        const next = !muted;
        setMuted(next);
        audio.muted = next;
        try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
        if (!next) {
            // Unmuting — also start if it was paused (autoplay blocked earlier).
            audio.play().catch(() => { /* ignore */ });
        }
    }

    // Visual state: only show "playing" if not muted AND audio is actually playing.
    // If autoplay was blocked, the icon shows muted/idle — a clear cue to tap.
    const visuallyMuted = muted || !playing;

    return (
        <button
            type="button"
            className={`music-toggle ${visuallyMuted ? 'is-muted' : 'is-playing'}`}
            onClick={toggle}
            aria-label={visuallyMuted ? 'Activer la musique' : 'Couper la musique'}
            aria-pressed={visuallyMuted}
        >
            <svg
                className="music-toggle-svg"
                viewBox="0 0 40 40"
                aria-hidden="true"
            >
                <g className="music-note">
                    <path
                        d="M22 8 L22 26"
                        stroke="#2D3561"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M22 8 C 28 10, 32 14, 30 20"
                        stroke="#2D3561"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    <ellipse
                        cx="17"
                        cy="27"
                        rx="6.2"
                        ry="4.6"
                        transform="rotate(-18 17 27)"
                        fill="#FF6B6B"
                        stroke="#2D3561"
                        strokeWidth="3"
                    />
                </g>

                <g className="music-waves">
                    <path
                        className="wave wave-1"
                        d="M30 14 Q 34 17, 32 22"
                        stroke="#2D3561"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        className="wave wave-2"
                        d="M34 10 Q 40 16, 36 24"
                        stroke="#2D3561"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        fill="none"
                    />
                </g>

                <path
                    className="music-slash"
                    d="M7 7 L 33 33"
                    stroke="#FF6B6B"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </button>
    );
}
