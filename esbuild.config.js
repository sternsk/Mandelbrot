// const esbuild = require('esbuild');

// esbuild.build({
//     entryPoints: ['./src/index.ts', './src/waveformworker.ts'],
//     bundle: true,
//     outdir: './dist',
//     format: 'esm', // oder 'iife' für ältere Browser
//     target: 'esnext',
//     splitting: true, // Unterstützt Code-Splitting, falls notwendig
//     loader: {
//         '.ts': 'ts',
//     },
// }).catch(() => process.exit(1));