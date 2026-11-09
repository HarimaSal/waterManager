import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, type NativeImage, Notification, screen } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isMiniMode = false
let isQuiting = false

// 参考 iOS 逻辑分辨率：默认 390×844（iPhone 14/15），最小 375×667（SE），最大 430×932（Pro Max）
const NORMAL_WIDTH = 390
const NORMAL_HEIGHT = 844
const MIN_WIDTH = 375
const MIN_HEIGHT = 667
const MAX_WIDTH = 430
const MAX_HEIGHT = 932
const MINI_WIDTH = 250
const MINI_HEIGHT = 80

// 高清 32x32 RGBA 纯净水滴 Base64，作为免除文件路径依赖的终极内嵌保底
const TRAY_ICON_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFFElEQVR4nOVWbYhUVRh+3nPunXHuna3dlqwIrag0FM1cqx8tLBH+idCCxl9LQYZQIVooJEbjbIlSEWH//JEZ+cNdEpJqqaA21PrhDyNdvxLNyI82cT/c2fm495433jMz2+w6zo5mQfTCYc6dc57nfc77ce4F/vvGhP+vpdlBmqf9HQp1Tahu1vLjuVg8zcHqcTH/moB+lPJusJSA5WBbB+ZaqOiqEeKMiFvXclO+GcfIwS3a4N7hdXQSzApE5p+NwAZopFmZVrQXNW7LERQbdJbXrppPNb6VqZx7gwyZwVE8O+MGFO5vxtBIAcvTaVbIUFiqhevdmmkeF5pKsXbX8IIHt/K+M8P8DTPvenonn8Cr/ERHR1UhVmHqGU25Q069jKKONDsHfXQaB2svDaIQduEtAC+FEeBofEavY1GyBfNMAZvHTmEHtlJQwdajV404v/FNXvhDHPsuBtg2QpgT5fAJgN3ZIg4Y4DyAjxVhF7mYTS62eXdjj5fmhdZ5uWWvXkB3yXlTF3eOafS1JPDQu4/i7OdLMLBnJWJENLb/e7zyu8YzRHTmpmb0hSMY4gICIjwMH31+F3c2IuJyK+fP38zzEps5629i3nuaf2Hmo8x8jJmHmHm97GFm6vi2lPtEF3/hv8PsvcF5bxOzJ9iNPL+ac7Kpy/4pXSoCmKYibM9F8J68B0OPzERhLIAbRtAGuADgeWa+U7bOPl6qJUXYYbEEBwEi0vCMwfY7Ktd1hbuugA3Q0mZ+DC+QjweQR/TUHOSFNqbBjragEEATgMeIiFe0laBeiE9NDuehoSH3Qx6hSmLBBQcvCqflnlIASlcqR1jKIViIWhOoVclymhaZtLWBJc9/ZGgUjC8pZlcFQwjBhrGkmvvKAtL2MjHJjXwfO1iEIlgknBw0rmCN+attw8hQrojfkOrWW3p/1uiHRkqKLdzFLCcwwq24YAAXbcJpozCpFtQEAXNLDhiYQTH4MlUa2HFINQmXInBRTmSM52h1JBFDD/Usi1Y/PquADBXRQ1E+Hd+NPH6lmFKWjRSTi6RwVvuomFMjtHLYQMIf5EYprgjfHaPEe3upZXV7YrCkTzlb+ob2r+o+1+6v6XezBRXZ5BKpiAMT5kdOaHJmcpGNFB7pJJNBUMuVU1NADJoDUPHiKYaEgIGXd6qbvzroewtujxd7j4wmfjwdrNK+vyoncmJ2SzmkCYQjZxEO23RrmMjE4vNIOBsWoBmXDEwE7Shba0oSAPT+lPV7D2R9QTkxwBSytV+9RApUzq4mIphIs7pUa6ua8JQqVamfwyEwBlT8BsFKIVpz40DMB1vnXHFUY1TMRGw5GAOWs8pHbQFEtp3OZWhMadWrm6aD2UjPWwkRA6EBWedTGwtWOIRLOO2VLD6uKEAsVXJGjLe1dgOVaHbt+932VoNW6kMSrHAIVzV3fQFERpSOrqejxPjQ8VqPs4ny0C5LOBpwbmSvYAQrHMJVPr1prAtSkicmBHhNJz1FF7AYrvcRMEaIAkmJ5Np2ecWtBNw2sHYduB6omF+hk97XyJa5JuV+/Lxo0NTK/ufgJjfBcaYjLMCOSkSk8Jw47AjDAQSj68z7cz9oiBf1TN5eMlLdWgjN8PB8DvIZMB8G6RAxX9khc+bDsiZ7rPNUtx7H1zFqNAKWsGdZND6/q32WDgq3ymPkxs/j1N7jE9Yr8+tqLNGo83Uja1OceLJd4+czE9IgHC7j54CRkRab2OON2J/f8HLrvy7m8wAAAABJRU5ErkJggg=='

function getPublicPath(...paths: string[]): string {
  const base = process.env.VITE_PUBLIC || path.join(process.env.APP_ROOT || '', 'public')
  return path.join(base, ...paths)
}

// 绿色便携数据文件路径（生产环境：安装包/exe 所在目录下的 data 目录；开发环境：项目根目录下的 data 目录）
function getDataFilePath(): string {
  const baseDir = app.isPackaged
    ? path.dirname(process.execPath)
    : (process.env.APP_ROOT || process.cwd())
  const dataDir = path.join(baseDir, 'data')
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true })
    } catch (e) {
      console.error('Failed to create data directory:', e)
    }
  }
  return path.join(dataDir, 'vitalpulse_data.json')
}

function getAppIcon(): NativeImage {
  // 1. 首选 Windows 原生多分辨率 ICO (16x16, 24x24, 32x32, 48x48, 256x256)
  const icoPath = getPublicPath('tray-icon.ico')
  try {
    const ico = nativeImage.createFromPath(icoPath)
    if (!ico.isEmpty()) return ico
  } catch {
    // 忽略异常并降级
  }

  // 2. 备选 PNG
  const pngPath = getPublicPath('tray-icon.png')
  try {
    const png = nativeImage.createFromPath(pngPath)
    if (!png.isEmpty()) return png
  } catch {
    // 忽略异常并降级
  }

  // 3. 终极自包含 Base64 降级保障
  return nativeImage.createFromDataURL(TRAY_ICON_DATA_URL)
}

function createWindow() {
  const appIcon = getAppIcon()

  mainWindow = new BrowserWindow({
    width: NORMAL_WIDTH,
    height: NORMAL_HEIGHT,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    maxWidth: MAX_WIDTH,
    maxHeight: MAX_HEIGHT,
    frame: false,
    transparent: true,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: false,
      contextIsolation: true
    },
    icon: appIcon
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // 窗口关闭时转为后台隐藏，保留系统托盘常驻
  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })
}

// 创建系统托盘
function createTray() {
  const trayIcon = getAppIcon()
  
  tray = new Tray(trayIcon)
  tray.setToolTip('VitalPulse 若水 · 健康打卡')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主面板',
      click: () => {
        if (mainWindow) {
          if (isMiniMode) toggleMiniMode(false)
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '切换迷你桌面水滴',
      click: () => {
        toggleMiniMode(!isMiniMode)
      }
    },
    { type: 'separator' },
    {
      label: '快速喝水 +250ml',
      click: () => {
        mainWindow?.webContents.send('quick-add-water', 250)
      }
    },
    {
      label: '快速喝水 +500ml',
      click: () => {
        mainWindow?.webContents.send('quick-add-water', 500)
      }
    },
    { type: 'separator' },
    {
      label: '退出应用',
      click: () => {
        isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })
}

// 切换迷你悬浮窗 / 正常窗口
function toggleMiniMode(toMini: boolean) {
  if (!mainWindow) return
  isMiniMode = toMini

  const primaryDisplay = screen.getPrimaryDisplay()
  const { workArea } = primaryDisplay

  if (toMini) {
    // 关键修复：必须先修改最小/最大尺寸限制，否则 Windows 会强制截断或导致巨大透明留白！
    mainWindow.setMinimumSize(220, 68)
    mainWindow.setMaximumSize(380, 120)
    mainWindow.setResizable(true)
    mainWindow.setSize(MINI_WIDTH, MINI_HEIGHT)
    mainWindow.setPosition(
      workArea.x + workArea.width - MINI_WIDTH - 28,
      workArea.y + workArea.height - MINI_HEIGHT - 36
    )
    mainWindow.setAlwaysOnTop(true, 'screen-saver')
    mainWindow.webContents.send('mode-changed', 'mini')
  } else {
    // 恢复标准大窗口前，重新设定合理的卡片窗口边界
    mainWindow.setMinimumSize(MIN_WIDTH, MIN_HEIGHT)
    mainWindow.setMaximumSize(MAX_WIDTH, MAX_HEIGHT)
    mainWindow.setSize(NORMAL_WIDTH, NORMAL_HEIGHT)
    mainWindow.center()
    mainWindow.setAlwaysOnTop(false)
    mainWindow.webContents.send('mode-changed', 'normal')
  }
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  ipcMain.on('window:minimize', (event) => {
    const targetWin = BrowserWindow.fromWebContents(event.sender) || mainWindow
    if (targetWin) {
      targetWin.minimize()
    }
  })

  ipcMain.on('window:close', (event, behavior?: string) => {
    if (behavior === 'exit') {
      isQuiting = true
      app.quit()
    } else {
      const targetWin = BrowserWindow.fromWebContents(event.sender) || mainWindow
      if (targetWin) {
        targetWin.hide()
      }
    }
  })

  ipcMain.on('window:toggle-mini', (_, reqMini: boolean) => {
    toggleMiniMode(reqMini)
  })

  ipcMain.on('window:set-always-on-top', (_, flag: boolean) => {
    mainWindow?.setAlwaysOnTop(flag)
  })

  ipcMain.on('notification:send', (_, { title, body }) => {
    if (Notification.isSupported()) {
      const notif = new Notification({
        title: title || 'VitalPulse 若水',
        body: body || '该补充水分啦！',
        icon: getAppIcon(),
        silent: false
      })
      notif.show()
    }
  })

  // 绿色便携本地数据读取 (data/vitalpulse_data.json)
  ipcMain.handle('data:load', () => {
    try {
      const filePath = getDataFilePath()
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8')
      }
    } catch (e) {
      console.error('Error reading local data file:', e)
    }
    return null
  })

  // 绿色便携本地数据保存 (data/vitalpulse_data.json)
  ipcMain.handle('data:save', (_, jsonString: string) => {
    try {
      const filePath = getDataFilePath()
      fs.writeFileSync(filePath, jsonString, 'utf-8')
      return true
    } catch (e) {
      console.error('Error writing local data file:', e)
      return false
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
