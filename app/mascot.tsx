'use client';

import Image from 'next/image';

export type Mood = 'hello' | 'loading' | 'yay';

const SOURCES: Record<Mood, { src: string; w: number; h: number }> = {
    hello:   { src: '/mascot/hello.png',   w: 320, h: 300 },
    loading: { src: '/mascot/loading.png', w: 300, h: 340 },
    yay:     { src: '/mascot/yay.png',     w: 320, h: 360 },
};

const ALT: Record<Mood, string> = {
    hello: 'Mascotte qui salue',
    loading: 'Mascotte qui dort',
    yay: 'Mascotte qui célèbre',
};

const ANIM: Record<Mood, string> = {
    hello: 'mascot-bounce',
    loading: 'mascot-snore',
    yay: 'mascot-jump',
};

type Props = { mood?: Mood; size?: number; priority?: boolean };

export default function Mascot({ mood = 'hello', size, priority = false }: Props) {
    const { src, w, h } = SOURCES[mood];
    const style = size ? { width: size } : undefined;
    return (
        <div className="mascot-frame">
            <div className={`mascot-img ${ANIM[mood]}`} style={style}>
                <Image
                    src={src}
                    alt={ALT[mood]}
                    width={w}
                    height={h}
                    priority={priority}
                    sizes="(max-width: 380px) 110px, (max-width: 768px) 32vw, 180px"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                />
            </div>
        </div>
    );
}
