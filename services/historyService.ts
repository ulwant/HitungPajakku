import { HistoryItem } from '../types';
import { supabase } from './supabaseClient';

const KEY = 'hitungpajakku_history_v1';

export const getHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to parse history', e);
    return [];
  }
};

const setLocalHistory = (items: HistoryItem[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to write history to localStorage', e);
  }
};

export const saveHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    timestamp: Date.now(),
  };

  // Keep only last 50 items to prevent storage bloat
  const updatedHistory = [newItem, ...history].slice(0, 50);
  setLocalHistory(updatedHistory);

  // Background upload to Supabase (fire-and-forget)
  try {
    if (supabase) {
      // attempt to include user_id when available (for RLS)
      supabase.auth.getUser().then(({ data }) => {
        const userId = data?.user?.id ?? null;
        const payload: any = {
          id: newItem.id,
          type: newItem.type,
          title: newItem.title,
          summary: newItem.summary,
          result_amount: newItem.resultAmount,
          details: newItem.details || null,
          metadata: null,
        };
        if (userId) payload.user_id = userId;

        supabase
          .from('histories')
          .insert(payload)
          .then(({ error }) => {
            if (error) console.warn('Supabase insert failed', error);
          });
      }).catch(err => {
        console.warn('Supabase getUser failed', err);
      });
    }
  } catch (err) {
    console.warn('Supabase upload error', err);
  }

  return newItem;
};

export const deleteHistoryItem = (id: string) => {
  const history = getHistory().filter(item => item.id !== id);
  setLocalHistory(history);

  try {
    if (supabase) {
      supabase
        .from('histories')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase delete failed', error);
        });
    }
  } catch (err) {
    console.warn('Supabase delete error', err);
  }

  return history;
};

export const clearHistory = () => {
  setLocalHistory([]);
  // Optionally: do not delete remote history automatically for safety
};

export const syncRemoteToLocal = async () => {
  if (!supabase) return;
  try {
    // Ensure we only fetch histories for the currently authenticated user.
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;
    if (!userId) return; // no signed-in user => nothing to sync

    const { data, error } = await supabase
      .from('histories')
      .select('*')
      .eq('user_id', userId)
      .order('inserted_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Supabase fetch histories failed', error);
      return;
    }

    if (!data) return;

    const remoteItems: HistoryItem[] = data.map((r: any) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      summary: r.summary,
      resultAmount: Number(r.result_amount) || 0,
      details: r.details,
      timestamp: new Date(r.inserted_at).getTime(),
    }));

    const local = getHistory();
    const combined = [...remoteItems, ...local];
    const unique: Record<string, HistoryItem> = {};
    const merged: HistoryItem[] = [];
    for (const it of combined) {
      if (!unique[it.id]) {
        unique[it.id] = it;
        merged.push(it);
      }
      if (merged.length >= 50) break;
    }
    setLocalHistory(merged);
  } catch (err) {
    console.warn('syncRemoteToLocal error', err);
  }
};

// Realtime subscription handling
let _realtimeSubscription: any = null;

export const startRealtimeHistorySync = async (onChange?: (items: HistoryItem[]) => void) => {
  if (!supabase) return;
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;
    if (!userId) return;

    if ((supabase as any).channel) {
      const channel = (supabase as any).channel(`public:histories:user:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'histories', filter: `user_id=eq.${userId}` }, (payload: any) => {
          try {
            const local = getHistory();
            if (payload.eventType === 'INSERT') {
              const r = payload.new;
              const newItem: HistoryItem = {
                id: r.id,
                type: r.type,
                title: r.title,
                summary: r.summary,
                resultAmount: Number(r.result_amount) || 0,
                details: r.details,
                timestamp: new Date(r.inserted_at).getTime(),
              };
              const updated = [newItem, ...local].slice(0, 50);
              setLocalHistory(updated);
              onChange?.(updated);
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old?.id;
              const updated = local.filter(i => i.id !== deletedId);
              setLocalHistory(updated);
              onChange?.(updated);
            } else if (payload.eventType === 'UPDATE') {
              const r = payload.new;
              const updated = local.map(it => it.id === r.id ? ({
                id: r.id,
                type: r.type,
                title: r.title,
                summary: r.summary,
                resultAmount: Number(r.result_amount) || 0,
                details: r.details,
                timestamp: new Date(r.inserted_at).getTime(),
              }) : it);
              setLocalHistory(updated);
              onChange?.(updated);
            }
          } catch (err) {
            console.warn('realtime payload handling failed', err);
          }
        });

      await channel.subscribe();
      _realtimeSubscription = channel;
      return;
    }

    if ((supabase as any).from) {
      const sub = (supabase as any).from(`histories:user_id=eq.${userId}`).on('*', (payload: any) => {
        const local = getHistory();
        if (payload.eventType === 'INSERT' || payload.type === 'INSERT') {
          const r = payload.new ?? payload.record;
          const newItem: HistoryItem = {
            id: r.id,
            type: r.type,
            title: r.title,
            summary: r.summary,
            resultAmount: Number(r.result_amount) || 0,
            details: r.details,
            timestamp: new Date(r.inserted_at).getTime(),
          };
          const updated = [newItem, ...local].slice(0, 50);
          setLocalHistory(updated);
          onChange?.(updated);
        } else if (payload.eventType === 'DELETE' || payload.type === 'DELETE') {
          const id = payload.old?.id ?? payload.record?.id;
          const updated = local.filter(i => i.id !== id);
          setLocalHistory(updated);
          onChange?.(updated);
        }
      }).subscribe();
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