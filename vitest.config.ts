import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/SudokuGame/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
