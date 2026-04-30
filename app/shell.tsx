'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = {
    children: React.ReactNode;
    showQuit?: boolean;
    onQuit?: () => void | Promise<void>;
};

export default function Shell({ children, showQuit = false, onQuit }: Props) {
    const router = useRouter();

    async function handleQuit() {
        if (onQuit) {
            try {
                await onQuit();
            } catch {
                /* swallow — leaving is more important than the side-effect */
            }
        }
        router.push('/');
    }

    return (
        <div className="shell">
            <header className="shell-header">
                {onQuit ? (
                    <button
                        type="button"
                        className="shell-title shell-title--button"
                        onClick={handleQuit}
                        aria-label="Retour à l'accueil"
                    >
                        <span className="shell-title-dot" aria-hidden="true" />
                        Il ou Elle
                    </button>
                ) : (
                    <Link
                        href="/"
                        className="shell-title"
                        aria-label="Retour à l'accueil"
                    >
                        <span className="shell-title-dot" aria-hidden="true" />
                        Il ou Elle
                    </Link>
                )}
                {showQuit ? (
                    <button
                        className="btn btn--ghost"
                        onClick={handleQuit}
                        aria-label="Quitter la partie"
                    >
                        Quitter
                    </button>
                ) : (
                    <span aria-hidden="true" />
                )}
            </header>
            <main className="shell-main">{children}</main>
        </div>
    );
}
