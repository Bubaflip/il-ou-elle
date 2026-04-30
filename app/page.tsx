'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getOrCreatePlayerId } from '@/lib/player-id';
import { createRoom } from '@/lib/room';
import Shell from './shell';
import Mascot from './mascot';

export default function Home() {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCreate() {
        setBusy(true);
        setError(null);
        try {
            const playerId = getOrCreatePlayerId();
            const room = await createRoom(playerId);
            router.push(`/room/${room.id}`);
        } catch (err) {
            console.error(err);
            setError('Oups ! Réessaye dans une seconde.');
            setBusy(false);
        }
    }

    return (
        <Shell>
            <div className="stage stage--center">
                <Mascot mood="hello" priority />

                <h1 className="bigtitle" aria-label="Il ou Elle">
                    <span>I</span><span>l</span>
                    <span className="gap"> </span>
                    <span>o</span><span>u</span>
                    <span className="gap"> </span>
                    <span>E</span><span>l</span><span>l</span><span>e</span>
                </h1>

                <button
                    className="btn btn--xl btn--coral btn--block"
                    onClick={handleCreate}
                    disabled={busy}
                >
                    {busy ? 'Préparation…' : 'Jouer'}
                    {!busy && <span className="arrow" aria-hidden="true">→</span>}
                </button>

                {error && <p className="notice" role="alert">{error}</p>}

                <details className="rules">
                    <summary>Comment jouer ?</summary>
                    <ol>
                        <li>Pense à une personne que l’autre connaît.</li>
                        <li>L’autre pose des questions à voix haute.</li>
                        <li>Quand il sait, il tape le nom.</li>
                    </ol>
                </details>
            </div>
        </Shell>
    );
}
