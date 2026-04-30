import { supabase } from './supabase';

export type RoomStatus = 'waiting' | 'thinking' | 'guessing' | 'done' | 'abandoned';

export type Room = {
    id: string;
    created_at: string;
    player1_id: string;
    player2_id: string | null;
    thinker_id: string | null;
    secret: string | null;
    status: RoomStatus;
    winner_id: string | null;
};

export async function createRoom(playerId: string): Promise<Room> {
    const { data, error } = await supabase
        .from('il_ou_elle_rooms')
        .insert({ player1_id: playerId })
        .select()
        .single();
    if (error) throw error;
    return data as Room;
}

export async function fetchRoom(roomId: string): Promise<Room | null> {
    const { data, error } = await supabase
        .from('il_ou_elle_rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle();
    if (error) throw error;
    return data as Room | null;
}

export async function joinRoom(room: Room, playerId: string): Promise<void> {
    const thinkerId = Math.random() < 0.5 ? room.player1_id : playerId;
    const { error } = await supabase
        .from('il_ou_elle_rooms')
        .update({
            player2_id: playerId,
            thinker_id: thinkerId,
            status: 'thinking',
        })
        .eq('id', room.id)
        .is('player2_id', null);
    if (error) throw error;
}

export async function submitSecret(roomId: string, secret: string): Promise<void> {
    const { error } = await supabase
        .from('il_ou_elle_rooms')
        .update({ secret: secret.trim(), status: 'guessing' })
        .eq('id', roomId);
    if (error) throw error;
}

export async function submitGuess(
    room: Room,
    guess: string,
    playerId: string
): Promise<boolean> {
    const isMatch =
        !!room.secret &&
        room.secret.trim().toLowerCase() === guess.trim().toLowerCase();
    if (!isMatch) return false;
    const { error } = await supabase
        .from('il_ou_elle_rooms')
        .update({ status: 'done', winner_id: playerId })
        .eq('id', room.id);
    if (error) throw error;
    return true;
}

export async function abandonRoom(roomId: string): Promise<void> {
    const { error } = await supabase
        .from('il_ou_elle_rooms')
        .update({ status: 'abandoned' })
        .eq('id', roomId)
        .neq('status', 'abandoned');
    if (error) throw error;
}

export async function playAgain(room: Room): Promise<void> {
    const nextThinker =
        room.thinker_id === room.player1_id ? room.player2_id : room.player1_id;
    const { error } = await supabase
        .from('il_ou_elle_rooms')
        .update({
            secret: null,
            winner_id: null,
            thinker_id: nextThinker,
            status: 'thinking',
        })
        .eq('id', room.id)
        .eq('status', 'done');
    if (error) throw error;
}
