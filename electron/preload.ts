import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: (behavior?: 'minimize' | 'exit') => ipcRenderer.send('window:close', behavior),
  toggleMiniMode: (isMini: boolean) => ipcRenderer.send('window:toggle-mini', isMini),
  sendNotification: (title: string, body: string) => {
    ipcRenderer.send('notification:send', { title, body })
  },
  setAlwaysOnTop: (alwaysOnTop: boolean) => {
    ipcRenderer.send('window:set-always-on-top', alwaysOnTop)
  },
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (json: string) => ipcRenderer.invoke('data:save', json)
})
