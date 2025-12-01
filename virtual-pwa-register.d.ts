declare module 'virtual:pwa-register' {
  export function registerSW(opts?: {
    onRegistered?: (r: unknown) => void;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }): () => void;
}

export {};
