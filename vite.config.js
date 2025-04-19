import { resolve } from 'path';
import { defineConfig } from 'vite';

const libraryName = 'changetrackableproxy';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/ctp.js'),
            name: libraryName,
            fileName: (format) => `${libraryName}.${format}.js`,
        },
        sourcemap:true,
    },
});
