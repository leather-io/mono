import { defineConfig } from 'tsup';

/*
 // "main": "dist/preset.js", // this works but it seems this doesn't get build in the CI properly
*/

export default defineConfig({
  //   dts: true,
  entry: ['src/preset.ts'],
  external: ['leather-styles'],
  format: ['esm'],
});


>
// made good progress but going in circles with bundling

panda-preset seems OK as I could publish and install that 

not sure how to handle Button. 

Maybe just try exporting that from preset too to avoid all the weird setup in ui? ??


