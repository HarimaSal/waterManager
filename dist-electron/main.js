import { app as s, ipcMain as i, BrowserWindow as l, Notification as h, Tray as v, Menu as y, nativeImage as p, screen as B } from "electron";
import r from "node:path";
import a from "node:fs";
import { fileURLToPath as O } from "node:url";
const R = r.dirname(O(import.meta.url));
process.env.APP_ROOT = r.join(R, "..");
const u = process.env.VITE_DEV_SERVER_URL, J = r.join(process.env.APP_ROOT, "dist-electron"), b = r.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = u ? r.join(process.env.APP_ROOT, "public") : b;
let e = null, c = null, d = !1, m = !1;
const T = 460, j = 760, E = 250, w = 80, H = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFFElEQVR4nOVWbYhUVRh+3nPunXHuna3dlqwIrag0FM1cqx8tLBH+idCCxl9LQYZQIVooJEbjbIlSEWH//JEZ+cNdEpJqqaA21PrhDyNdvxLNyI82cT/c2fm495433jMz2+w6zo5mQfTCYc6dc57nfc77ce4F/vvGhP+vpdlBmqf9HQp1Tahu1vLjuVg8zcHqcTH/moB+lPJusJSA5WBbB+ZaqOiqEeKMiFvXclO+GcfIwS3a4N7hdXQSzApE5p+NwAZopFmZVrQXNW7LERQbdJbXrppPNb6VqZx7gwyZwVE8O+MGFO5vxtBIAcvTaVbIUFiqhevdmmkeF5pKsXbX8IIHt/K+M8P8DTPvenonn8Cr/ERHR1UhVmHqGU25Q069jKKONDsHfXQaB2svDaIQduEtAC+FEeBofEavY1GyBfNMAZvHTmEHtlJQwdajV404v/FNXvhDHPsuBtg2QpgT5fAJgN3ZIg4Y4DyAjxVhF7mYTS62eXdjj5fmhdZ5uWWvXkB3yXlTF3eOafS1JPDQu4/i7OdLMLBnJWJENLb/e7zyu8YzRHTmpmb0hSMY4gICIjwMH31+F3c2IuJyK+fP38zzEps5629i3nuaf2Hmo8x8jJmHmHm97GFm6vi2lPtEF3/hv8PsvcF5bxOzJ9iNPL+ac7Kpy/4pXSoCmKYibM9F8J68B0OPzERhLIAbRtAGuADgeWa+U7bOPl6qJUXYYbEEBwEi0vCMwfY7Ktd1hbuugA3Q0mZ+DC+QjweQR/TUHOSFNqbBjragEEATgMeIiFe0laBeiE9NDuehoSH3Qx6hSmLBBQcvCqflnlIASlcqR1jKIViIWhOoVclymhaZtLWBJc9/ZGgUjC8pZlcFQwjBhrGkmvvKAtL2MjHJjXwfO1iEIlgknBw0rmCN+attw8hQrojfkOrWW3p/1uiHRkqKLdzFLCcwwq24YAAXbcJpozCpFtQEAXNLDhiYQTH4MlUa2HFINQmXInBRTmSM52h1JBFDD/Usi1Y/PquADBXRQ1E+Hd+NPH6lmFKWjRSTi6RwVvuomFMjtHLYQMIf5EYprgjfHaPEe3upZXV7YrCkTzlb+ob2r+o+1+6v6XezBRXZ5BKpiAMT5kdOaHJmcpGNFB7pJJNBUMuVU1NADJoDUPHiKYaEgIGXd6qbvzroewtujxd7j4wmfjwdrNK+vyoncmJ2SzmkCYQjZxEO23RrmMjE4vNIOBsWoBmXDEwE7Shba0oSAPT+lPV7D2R9QTkxwBSytV+9RApUzq4mIphIs7pUa6ua8JQqVamfwyEwBlT8BsFKIVpz40DMB1vnXHFUY1TMRGw5GAOWs8pHbQFEtp3OZWhMadWrm6aD2UjPWwkRA6EBWedTGwtWOIRLOO2VLD6uKEAsVXJGjLe1dgOVaHbt+932VoNW6kMSrHAIVzV3fQFERpSOrqejxPjQ8VqPs4ny0C5LOBpwbmSvYAQrHMJVPr1prAtSkicmBHhNJz1FF7AYrvcRMEaIAkmJ5Np2ecWtBNw2sHYduB6omF+hk97XyJa5JuV+/Lxo0NTK/ufgJjfBcaYjLMCOSkSk8Jw47AjDAQSj68z7cz9oiBf1TN5eMlLdWgjN8PB8DvIZMB8G6RAxX9khc+bDsiZ7rPNUtx7H1zFqNAKWsGdZND6/q32WDgq3ymPkxs/j1N7jE9Yr8+tqLNGo83Uja1OceLJd4+czE9IgHC7j54CRkRab2OON2J/f8HLrvy7m8wAAAABJRU5ErkJggg==";
function P(...o) {
  const t = process.env.VITE_PUBLIC || r.join(process.env.APP_ROOT || "", "public");
  return r.join(t, ...o);
}
function g() {
  const o = s.isPackaged ? r.dirname(process.execPath) : process.env.APP_ROOT || process.cwd(), t = r.join(o, "data");
  if (!a.existsSync(t))
    try {
      a.mkdirSync(t, { recursive: !0 });
    } catch (n) {
      console.error("Failed to create data directory:", n);
    }
  return r.join(t, "vitalpulse_data.json");
}
function A() {
  const o = P("tray-icon.ico");
  try {
    const n = p.createFromPath(o);
    if (!n.isEmpty()) return n;
  } catch {
  }
  const t = P("tray-icon.png");
  try {
    const n = p.createFromPath(t);
    if (!n.isEmpty()) return n;
  } catch {
  }
  return p.createFromDataURL(H);
}
function I() {
  const o = A();
  e = new l({
    width: T,
    height: j,
    minWidth: 400,
    minHeight: 650,
    maxWidth: 540,
    maxHeight: 900,
    frame: !1,
    transparent: !0,
    hasShadow: !0,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: r.join(R, "preload.cjs"),
      sandbox: !1,
      contextIsolation: !0
    },
    icon: o
  }), u ? e.loadURL(u) : e.loadFile(r.join(b, "index.html")), e.on("close", (t) => {
    m || (t.preventDefault(), e == null || e.hide());
  });
}
function N() {
  const o = A();
  c = new v(o), c.setToolTip("VitalPulse 若水 · 健康打卡");
  const t = y.buildFromTemplate([
    {
      label: "打开主面板",
      click: () => {
        e && (d && f(!1), e.show(), e.focus());
      }
    },
    {
      label: "切换迷你桌面水滴",
      click: () => {
        f(!d);
      }
    },
    { type: "separator" },
    {
      label: "快速喝水 +250ml",
      click: () => {
        e == null || e.webContents.send("quick-add-water", 250);
      }
    },
    {
      label: "快速喝水 +500ml",
      click: () => {
        e == null || e.webContents.send("quick-add-water", 500);
      }
    },
    { type: "separator" },
    {
      label: "退出应用",
      click: () => {
        m = !0, s.quit();
      }
    }
  ]);
  c.setContextMenu(t), c.on("click", () => {
    e != null && e.isVisible() ? e.hide() : (e == null || e.show(), e == null || e.focus());
  });
}
function f(o) {
  if (!e) return;
  d = o;
  const t = B.getPrimaryDisplay(), { workArea: n } = t;
  o ? (e.setMinimumSize(220, 68), e.setMaximumSize(380, 120), e.setResizable(!0), e.setSize(E, w), e.setPosition(
    n.x + n.width - E - 28,
    n.y + n.height - w - 36
  ), e.setAlwaysOnTop(!0, "screen-saver"), e.webContents.send("mode-changed", "mini")) : (e.setMinimumSize(400, 650), e.setMaximumSize(540, 900), e.setSize(T, j), e.center(), e.setAlwaysOnTop(!1), e.webContents.send("mode-changed", "normal"));
}
s.whenReady().then(() => {
  I(), N(), i.on("window:minimize", (o) => {
    const t = l.fromWebContents(o.sender) || e;
    t && t.minimize();
  }), i.on("window:close", (o, t) => {
    if (t === "exit")
      m = !0, s.quit();
    else {
      const n = l.fromWebContents(o.sender) || e;
      n && n.hide();
    }
  }), i.on("window:toggle-mini", (o, t) => {
    f(t);
  }), i.on("window:set-always-on-top", (o, t) => {
    e == null || e.setAlwaysOnTop(t);
  }), i.on("notification:send", (o, { title: t, body: n }) => {
    h.isSupported() && new h({
      title: t || "VitalPulse 若水",
      body: n || "该补充水分啦！",
      icon: A(),
      silent: !1
    }).show();
  }), i.handle("data:load", () => {
    try {
      const o = g();
      if (a.existsSync(o))
        return a.readFileSync(o, "utf-8");
    } catch (o) {
      console.error("Error reading local data file:", o);
    }
    return null;
  }), i.handle("data:save", (o, t) => {
    try {
      const n = g();
      return a.writeFileSync(n, t, "utf-8"), !0;
    } catch (n) {
      return console.error("Error writing local data file:", n), !1;
    }
  }), s.on("activate", () => {
    l.getAllWindows().length === 0 ? I() : e == null || e.show();
  });
});
s.on("window-all-closed", () => {
  process.platform !== "darwin" && s.quit();
});
export {
  J as MAIN_DIST,
  b as RENDERER_DIST,
  u as VITE_DEV_SERVER_URL
};
