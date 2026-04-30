'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getOrCreatePlayerId } from '@/lib/player-id';
import {
    Room,
    abandonRoom,
    fetchRoom,
    joinRoom,
    playAgain,
    submitGuess,
    submitSecret,
} from '@/lib/room';
import Shell from '../../shell';
import Mascot from '../../mascot';
import Confetti from '../../confetti';

type RoomState = { playerId: string; room: Room | null; missing?: boolean };

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = use(params);
    const [state, setState] = useState<RoomState | null>(null);

    useEffect(() => {
        let cancelled = false;
        const myId = getOrCreatePlayerId();

        (async () => {
            const initial = await fetchRoom(roomId);
            if (cancelled) return;
            if (!initial) {
                setState({ playerId: myId, room: null, missing: true });
                return;
            }
            let final = initial;
            const isCreator = initial.player1_id === myId;
            const isJoiner = initial.player2_id === myId;
            if (!isCreator && !isJoiner && initial.player2_id === null) {
                await joinRoom(initial, myId);
                const refreshed = await fetchRoom(roomId);
                if (cancelled) return;
                if (refreshed) final = refreshed;
            }
            setState({ playerId: myId, room: final });
        })();

        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'il_ou_elle_rooms',
                    filter: `id=eq.${roomId}`,
                },
                (payload) => {
                    setState((prev) =>
                        prev ? { ...prev, room: payload.new as Room } : prev
                    );
                }
            )
            .subscribe();

        const pollId = setInterval(async () => {
            const fresh = await fetchRoom(roomId);
            if (cancelled || !fresh) return;
            setState((prev) =>
                prev ? { ...prev, room: fresh } : { playerId: myId, room: fresh }
            );
        }, 2000);

        return () => {
            cancelled = true;
            clearInterval(pollId);
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    if (!state) {
        return (
            <Shell>
                <div className="stage stage--center">
                    <Mascot mood="loading" priority />
                    <p className="lead">Chargement…</p>
                </div>
            </Shell>
        );
    }

    const { playerId, room } = state;
    if (!room) return <NotFoundScreen />;

    const isPlayer1 = room.player1_id === playerId;
    const isPlayer2 = room.player2_id === playerId;
    if (!isPlayer1 && !isPlayer2) return <FullScreen />;

    const isThinker = room.thinker_id === playerId;

    const onQuit =
        room.status === 'abandoned'
            ? undefined
            : async () => { await abandonRoom(room.id); };

    return (
        <Shell showQuit onQuit={onQuit}>
            {room.status === 'waiting' && <Waiting roomId={room.id} />}
            {room.status === 'thinking' &&
                (isThinker ? <ThinkerInput room={room} /> : <WaitingForOther label="L’autre joueur choisit…" />)}
            {room.status === 'guessing' &&
                (isThinker ? <ThinkerAnswering secret={room.secret ?? ''} /> : <GuesserInput room={room} playerId={playerId} />)}
            {room.status === 'done' && <Done room={room} playerId={playerId} />}
            {room.status === 'abandoned' && <Abandoned />}
        </Shell>
    );
}

/* ---------------- screens ---------------- */

function NotFoundScreen() {
    const router = useRouter();
    return (
        <Shell>
            <div className="stage stage--center">
                <Mascot mood="loading" />
                <h1>Partie introuvable</h1>
                <button className="btn btn--xl btn--coral btn--block" onClick={() => router.push('/')}>
                    Nouvelle partie
                </button>
            </div>
        </Shell>
    );
}

function Abandoned() {
    const router = useRouter();
    return (
        <div className="stage stage--center">
            <Mascot mood="loading" />
            <h1>L’autre est parti</h1>
            <button
                className="btn btn--xl btn--coral btn--block"
                onClick={() => router.push('/')}
            >
                Nouvelle partie
                <span aria-hidden="true">→</span>
            </button>
        </div>
    );
}

function FullScreen() {
    const router = useRouter();
    return (
        <Shell>
            <div className="stage stage--center">
                <Mascot mood="loading" />
                <h1>Partie complète</h1>
                <button className="btn btn--xl btn--yellow btn--block" onClick={() => router.push('/')}>
                    Créer ma partie
                </button>
            </div>
        </Shell>
    );
}

function Waiting({ roomId }: { roomId: string }) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : '';

    async function share() {
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
            try {
                await navigator.share({
                    title: 'Il ou Elle',
                    text: 'Viens jouer avec moi !',
                    url,
                });
                return;
            } catch { /* fall through */ }
        }
        await copy();
    }

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard blocked */
        }
    }

    return (
        <div className="stage stage--center">
            <Mascot mood="hello" />
            <h1>Invite l’autre joueur</h1>

            <button className="btn btn--xl btn--coral btn--block" onClick={share}>
                Partager le lien
                <span aria-hidden="true">📨</span>
            </button>

            <button className="btn btn--mint btn--block" onClick={copy}>
                {copied ? 'Lien copié ✓' : 'Copier le lien'}
            </button>

            <div className="dots-row">
                <div className="dots" aria-hidden="true"><span /><span /><span /></div>
                <span>En attente…</span>
            </div>
        </div>
    );
}

function WaitingForOther({ label }: { label: string }) {
    return (
        <div className="stage stage--center">
            <Mascot mood="loading" />
            <h1>{label}</h1>
            <div className="dots" aria-hidden="true"><span /><span /><span /></div>
        </div>
    );
}

function ThinkerInput({ room }: { room: Room }) {
    const [value, setValue] = useState('');
    const [busy, setBusy] = useState(false);
    return (
        <form
            className="stage stage--center"
            onSubmit={async (e) => {
                e.preventDefault();
                if (!value.trim()) return;
                setBusy(true);
                try {
                    await submitSecret(room.id, value);
                } catch (err) {
                    console.error(err);
                    setBusy(false);
                }
            }}
        >
            <Mascot mood="hello" />
            <h1>Pense à une personne</h1>
            <p className="lead">Chuut — l’autre ne le verra pas.</p>

            <div className="input-wrap" style={{ width: '100%' }}>
                <PencilIcon />
                <input
                    autoFocus
                    className="input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="ex : Marie Curie"
                    aria-label="Nom de la personne"
                />
            </div>

            <button
                type="submit"
                className="btn btn--xl btn--mint btn--block"
                disabled={busy || !value.trim()}
            >
                {busy ? 'Envoi…' : 'C’est bon !'}
                {!busy && <span className="arrow" aria-hidden="true">→</span>}
            </button>
        </form>
    );
}

function ThinkerAnswering({ secret }: { secret: string }) {
    return (
        <div className="stage stage--center">
            <Mascot mood="hello" />
            <h1>Réponds par oui ou non</h1>
            <div className="reminder" aria-label="Rappel de ta personne">
                <span className="reminder-label">Tu as choisi</span>
                <span className="reminder-value">{secret}</span>
            </div>
        </div>
    );
}

function GuesserInput({ room, playerId }: { room: Room; playerId: string }) {
    const [value, setValue] = useState('');
    const [wrong, setWrong] = useState(false);
    const [busy, setBusy] = useState(false);
    return (
        <form
            className="stage stage--center"
            onSubmit={async (e) => {
                e.preventDefault();
                if (!value.trim()) return;
                setBusy(true);
                setWrong(false);
                try {
                    const ok = await submitGuess(room, value, playerId);
                    if (!ok) {
                        setWrong(true);
                        setValue('');
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setBusy(false);
                }
            }}
        >
            <Mascot mood="hello" />
            <h1>Pose tes questions</h1>
            <p className="lead">Quand tu sais, écris le nom.</p>

            <div className="input-wrap" style={{ width: '100%' }}>
                <PencilIcon />
                <input
                    autoFocus
                    className={`input ${wrong ? 'shake' : ''}`}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Nom de la personne"
                    aria-label="Ta réponse"
                />
            </div>

            <button
                type="submit"
                className="btn btn--xl btn--coral btn--block"
                disabled={busy || !value.trim()}
            >
                {busy ? 'On vérifie…' : 'Deviner'}
                {!busy && <span aria-hidden="true">🔎</span>}
            </button>

            {wrong && <p className="notice" role="alert">Ce n’est pas ça ! 💪</p>}
        </form>
    );
}

function Done({ room, playerId }: { room: Room; playerId: string }) {
    const router = useRouter();
    const youWon = room.winner_id === playerId;
    const [busy, setBusy] = useState(false);
    return (
        <div className="stage stage--center">
            {youWon && <Confetti count={70} />}
            <Mascot mood={youWon ? 'yay' : 'loading'} />
            <h1>{youWon ? 'Bravo, trouvé !' : 'L’autre a trouvé !'}</h1>

            <div className="card card--yellow card--tilt-l" style={{ alignSelf: 'stretch' }}>
                <span className="reminder-label">C’était</span>
                <span className="reminder-value" style={{ fontSize: 30 }}>{room.secret}</span>
            </div>

            <div className="actions">
                <button
                    className="btn btn--xl btn--coral btn--block"
                    disabled={busy}
                    onClick={async () => {
                        setBusy(true);
                        try {
                            await playAgain(room);
                        } catch (err) {
                            console.error(err);
                            setBusy(false);
                        }
                    }}
                >
                    {busy ? '…' : 'Rejouer'}
                    {!busy && <span aria-hidden="true">🔁</span>}
                </button>
                <button
                    className="btn btn--ghost"
                    onClick={async () => {
                        try { await abandonRoom(room.id); } catch { /* navigate anyway */ }
                        router.push('/');
                    }}
                >
                    Accueil
                </button>
            </div>
        </div>
    );
}

/* ---------------- bits ---------------- */

function PencilIcon() {
    return (
        <svg className="pencil" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 21l3-1 11-11-2-2L4 18l-1 3z" stroke="#2D3561" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M14 6l4 4" stroke="#2D3561" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M16 4l4 4-2 2-4-4 2-2z" fill="#FFD93D" stroke="#2D3561" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
    );
}
