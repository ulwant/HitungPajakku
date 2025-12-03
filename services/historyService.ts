// File: services/historyService.ts

import { HistoryItem } from '../types';
import { supabase } from './supabaseClient';
import { getCurrentUser } from './auth'; 

// HAPUS SEMUA: KEY, getHistory, setLocalHistory, claimLocalHistoryForUser, syncRemoteToLocal
// Fungsi getHistoryItems yang ASINKRONUS untuk mengambil riwayat langsung dari Supabase
export const getHistoryItems = async (userId: string | null): Promise<HistoryItem[]> => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('histories')
      .select('id, type, title, summary, result_amount, details, inserted_at') // Pilih kolom yang diperlukan
      .eq('user_id', userId)
      .order('inserted_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase fetch histories failed:', error);
      return [];
    }

    if (!data) return [];

    return data.map((r: any) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      summary: r.summary,
      resultAmount: Number(r.result_amount) || 0,
      details: r.details,
      timestamp: new Date(r.inserted_at).getTime(),
    }));
  } catch (err) {
    console.error('getHistoryItems error:', err);
    return [];
  }
};

// Fungsi saveHistoryItem diubah menjadi ASINKRONUS dan hanya menyimpan ke Supabase
export const saveHistoryItem = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  if (!supabase) {
    console.warn('saveHistoryItem: Supabase client is not initialized.');
    return null; 
  }

  try {
    // Mendapatkan user ID dari sesi saat ini
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.warn('saveHistoryItem: Gagal mendapatkan user untuk RLS:', userError);
      return null;
    }
    const userId = userData?.user?.id;
    if (!userId) {
      console.warn('saveHistoryItem: User tidak login, tidak dapat menyimpan ke Supabase.');
      return null;
    }

    const newItemId = Date.now().toString(36) + Math.random().toString(36).slice(2);
    
    const payload: any = {
      id: newItemId,
      user_id: userId,
      type: item.type,
      title: item.title,
      summary: item.summary,
      result_amount: item.resultAmount,
      details: item.details || null,
      metadata: null, // Asumsi kolom metadata ada atau dihapus
    };

    const { error } = await supabase
      .from('histories')
      .insert(payload);

    if (error) {
      console.error('Supabase insert failed:', error);
      return null;
    }
    
    return { 
        id: newItemId, 
        timestamp: Date.now(), 
        ...item 
    } as HistoryItem;
    
  } catch (err) {
    console.error('saveHistoryItem error:', err);
    return null;
  }
};

// Fungsi deleteHistoryItem diubah menjadi ASINKRONUS
export const deleteHistoryItem = async (id: string) => {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('histories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete failed:', error);
    }
  } catch (err) {
    console.error('deleteHistoryItem error:', err);
  }
};

// Fungsi clearHistory diubah menjadi ASINKRONUS dan menghapus data user yang login
export const clearHistory = async () => {
  if (!supabase) return;
  
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;
    if (!userId) {
        console.warn('clearHistory: User not logged in, cannot clear remote history.');
        return;
    }

    const { error } = await supabase
        .from('histories')
        .delete()
        .eq('user_id', userId); 

    if (error) {
      console.error('Supabase clear history failed:', error);
    }
  } catch (err) {
    console.error('clearHistory error:', err);
  }
};

// Realtime subscription handling (Membutuhkan getHistoryItems untuk refresh UI)
let _realtimeSubscription: any = null;

export const startRealtimeHistorySync = async (userId: string, onChange?: (items: HistoryItem[]) => void) => {
  if (!supabase || !userId) return;
  
  try {
    await stopRealtimeHistorySync(); 

    const refetchAndCallback = async () => {
        const updatedHistory = await getHistoryItems(userId);
        onChange?.(updatedHistory);
    };

    if ((supabase as any).channel) {
      const channel = (supabase as any).channel(`public:histories:user:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'histories', filter: `user_id=eq.${userId}` }, refetchAndCallback);

      await channel.subscribe();
      _realtimeSubscription = channel;
      return;
    }

    if ((supabase as any).from) {
      const sub = (supabase as any).from(`histories:user_id=eq.${userId}`).on('*', refetchAndCallback).subscribe();
      _realtimeSubscription = sub;
    }
  } catch (err) {
    console.warn('startRealtimeHistorySync error', err);
  }
};

export const stopRealtimeHistorySync = async () => {
  try {
    if (!_realtimeSubscription) return;
    if (_realtimeSubscription.unsubscribe) {
      await _realtimeSubscription.unsubscribe();
    } else if (_realtimeSubscription.remove) {
      _realtimeSubscription.remove();
    }
  } catch (err) {
    console.warn('stopRealtimeHistorySync error', err);
  } finally {
    _realtimeSubscription = null;
  }
};
