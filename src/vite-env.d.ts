/// <reference types="vite/client" />

declare interface Window {
  electronAPI?: {
    minimize: () => void
    close: (behavior?: 'minimize' | 'exit') => void
    toggleMiniMode: (isMini: boolean) => void
    sendNotification: (title: string, body: string) => void
    setAlwaysOnTop: (alwaysOnTop: boolean) => void
    loadData: () => Promise<string | null>
    saveData: (json: string) => Promise<boolean>
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
