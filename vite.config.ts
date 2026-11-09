import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'node:path'
import fs from 'node:fs'

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      },
    ]),
    renderer(),
    {
      name: 'copy-preload-cjs',
      closeBundle() {
        if (!fs.existsSync(path.resolve(__dirname, 'dist-electron'))) {
          fs.mkdirSync(path.resolve(__dirname, 'dist-electron'), { recursive: true })
        }
        fs.copyFileSync(
          path.resolve(__dirname, 'electron/preload.cjs'),
          path.resolve(__dirname, 'dist-electron/preload.cjs')
        )
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173
  }
})
