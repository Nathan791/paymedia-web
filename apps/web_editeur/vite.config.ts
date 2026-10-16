import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],

    server: {
        port: 3003,
        proxy: {
            '/api': {
                target: 'http://192.168.100.101:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },

    resolve: {
        alias: {
            '@': resolve(import.meta.dirname, './src'),
        },
        dedupe: ['react', 'react-dom'],
    },

    optimizeDeps: {
        include: ['react', 'react-dom', '@mantine/core'],
        force: true,
    },
});