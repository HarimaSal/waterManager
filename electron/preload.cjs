const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: (behavior) => ipcRenderer.send('window:close', behavior),
  toggleMiniMode: (isMini) => ipcRenderer.send('window:toggle-mini', isMini),
  sendNotification: (title, body) => {
    ipcRenderer.send('notification:send', { title, body })
  },
  setAlwaysOnTop: (alwaysOnTop) => {
    ipcRenderer.send('window:set-always-on-top', alwaysOnTop)
  }
})
