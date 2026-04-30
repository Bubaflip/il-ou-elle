import type { Metadata, Viewport } from 'next';
import { Fredoka } from 'next/font/google';
import './globals.css';
import Floaters from './floaters';
import Music from './music';

const fredoka = Fredoka({
    variable: '--font-fredoka',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title: 'Il ou Elle',
    description: 'Un jeu à deux pour deviner une personne.',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#FFFBE7',
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="fr" className={fredoka.variable}>
            <body>
                <Floaters />
                {children}
                <Music />
            </body>
        </html>
    );
}
