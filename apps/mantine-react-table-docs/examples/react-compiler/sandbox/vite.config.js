import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    //compile the app's components with the React Compiler (node_modules, including MRT, are not compiled)
    babel({ presets: [reactCompilerPreset({ compilationMode: 'infer' })] }),
  ],
});
