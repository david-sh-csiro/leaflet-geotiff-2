import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        'leaflet-geotiff': resolve(__dirname, 'src/leaflet-geotiff.js'),
        'leaflet-geotiff-vector-arrows': resolve(__dirname, 'src/leaflet-geotiff-vector-arrows.js'),
        'leaflet-geotiff-rgb': resolve(__dirname, 'src/leaflet-geotiff-rgb.js'),
        'leaflet-geotiff-plotty': resolve(__dirname, 'src/leaflet-geotiff-plotty.js'),
      },
      name: 'leaflet-geotiff',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['geotiff', 'leaflet', 'plotly'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
            geotiff: 'geotiff',
            leaflet: 'leaflet',
            plotly: 'plotly'
        },
      },
    },
  },
})