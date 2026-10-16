import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],

    server: {
        port: 3002,

        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },

    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});









 /*
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3002,
        proxy: {
            //  PROXY POUR LE GATEWAY (PORT 8000)
            '/gateway': {
                target: 'http://192.168.100.101:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/gateway/, '/api/v1'),
            },
            //  PROXY POUR L'AUTH (PORT 4000)
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});

  */
