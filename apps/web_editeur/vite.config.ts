import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiProxyTarget =
        env.VITE_API_PROXY_TARGET || 'http://192.168.100.101:8000';

    return {
        plugins: [react()],

        server: {
            port: 3003,
            proxy: {
                '/api': {
                    target: apiProxyTarget,
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
    };
});
