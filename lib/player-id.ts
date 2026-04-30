const KEY = 'il-ou-elle:player-id';

export function getOrCreatePlayerId(): string {
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(KEY, id);
    }
    return id;
}
