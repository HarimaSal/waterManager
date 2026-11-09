import { contextBridge as o, ipcRenderer as n } from "electron";
o.exposeInMainWorld("electronAPI", {
  minimize: () => n.send("window:minimize"),
  close: (e) => n.send("window:close", e),
  toggleMiniMode: (e) => n.send("window:toggle-mini", e),
  sendNotification: (e, i) => {
    n.send("notification:send", { title: e, body: i });
  },
  setAlwaysOnTop: (e) => {
    n.send("window:set-always-on-top", e);
  },
  loadData: () => n.invoke("data:load"),
  saveData: (e) => n.invoke("data:save", e)
});
