// tsup.config.native.ts
import { copy } from "esbuild-plugin-copy";
import svgrPlugin from "esbuild-plugin-svgr";
import { defineConfig } from "tsup";
var tsup_config_native_default = defineConfig({
  entry: ["native.ts"],
  esbuildPlugins: [
    svgrPlugin({ native: true, typescript: true }),
    copy({
      assets: [
        {
          from: ["./src/assets/**/*"],
          to: ["./src/assets"]
        },
        {
          from: ["./src/assets-native/**/*"],
          to: ["./src/assets-native"]
        }
      ],
      copyOnStart: true,
      watch: true
    })
  ],
  inject: ["./react-shim.js"],
  format: ["esm"],
  tsconfig: "tsconfig.native.json",
  outDir: "dist-native",
  experimentalDts: true,
  clean: false,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  splitting: true,
  treeshake: true,
  target: "es2022",
  loader: {
    ".js": "jsx",
    ".otf": "file",
    ".png": "file",
    ".svg": "jsx",
    ".ttf": "file"
  }
});
export {
  tsup_config_native_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcubmF0aXZlLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIi9Vc2Vycy9reXJhbmphbWllL2Rldi9sZWF0aGVyL21vbm8vcGFja2FnZXMvdWkvdHN1cC5jb25maWcubmF0aXZlLnRzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIi9Vc2Vycy9reXJhbmphbWllL2Rldi9sZWF0aGVyL21vbm8vcGFja2FnZXMvdWlcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL1VzZXJzL2t5cmFuamFtaWUvZGV2L2xlYXRoZXIvbW9uby9wYWNrYWdlcy91aS90c3VwLmNvbmZpZy5uYXRpdmUudHNcIjtpbXBvcnQgeyBjb3B5IH0gZnJvbSAnZXNidWlsZC1wbHVnaW4tY29weSc7XG5pbXBvcnQgc3ZnclBsdWdpbiBmcm9tICdlc2J1aWxkLXBsdWdpbi1zdmdyJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3RzdXAnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBlbnRyeTogWyduYXRpdmUudHMnXSxcbiAgZXNidWlsZFBsdWdpbnM6IFtcbiAgICBzdmdyUGx1Z2luKHsgbmF0aXZlOiB0cnVlLCB0eXBlc2NyaXB0OiB0cnVlIH0pLFxuICAgIGNvcHkoe1xuICAgICAgYXNzZXRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBmcm9tOiBbJy4vc3JjL2Fzc2V0cy8qKi8qJ10sXG4gICAgICAgICAgdG86IFsnLi9zcmMvYXNzZXRzJ10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBmcm9tOiBbJy4vc3JjL2Fzc2V0cy1uYXRpdmUvKiovKiddLFxuICAgICAgICAgIHRvOiBbJy4vc3JjL2Fzc2V0cy1uYXRpdmUnXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBjb3B5T25TdGFydDogdHJ1ZSxcbiAgICAgIHdhdGNoOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICBpbmplY3Q6IFsnLi9yZWFjdC1zaGltLmpzJ10sXG4gIGZvcm1hdDogWydlc20nXSxcbiAgdHNjb25maWc6ICd0c2NvbmZpZy5uYXRpdmUuanNvbicsXG4gIG91dERpcjogJ2Rpc3QtbmF0aXZlJyxcbiAgZXhwZXJpbWVudGFsRHRzOiB0cnVlLFxuICBjbGVhbjogZmFsc2UsXG4gIG1pbmlmeTogdHJ1ZSxcbiAgbWluaWZ5SWRlbnRpZmllcnM6IHRydWUsXG4gIG1pbmlmeVN5bnRheDogdHJ1ZSxcbiAgbWluaWZ5V2hpdGVzcGFjZTogdHJ1ZSxcbiAgc3BsaXR0aW5nOiB0cnVlLFxuICB0cmVlc2hha2U6IHRydWUsXG4gIHRhcmdldDogJ2VzMjAyMicsXG4gIGxvYWRlcjoge1xuICAgICcuanMnOiAnanN4JyxcbiAgICAnLm90Zic6ICdmaWxlJyxcbiAgICAnLnBuZyc6ICdmaWxlJyxcbiAgICAnLnN2Zyc6ICdqc3gnLFxuICAgICcudHRmJzogJ2ZpbGUnLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNTLFNBQVMsWUFBWTtBQUMzVCxPQUFPLGdCQUFnQjtBQUN2QixTQUFTLG9CQUFvQjtBQUU3QixJQUFPLDZCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPLENBQUMsV0FBVztBQUFBLEVBQ25CLGdCQUFnQjtBQUFBLElBQ2QsV0FBVyxFQUFFLFFBQVEsTUFBTSxZQUFZLEtBQUssQ0FBQztBQUFBLElBQzdDLEtBQUs7QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNOO0FBQUEsVUFDRSxNQUFNLENBQUMsbUJBQW1CO0FBQUEsVUFDMUIsSUFBSSxDQUFDLGNBQWM7QUFBQSxRQUNyQjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU0sQ0FBQywwQkFBMEI7QUFBQSxVQUNqQyxJQUFJLENBQUMscUJBQXFCO0FBQUEsUUFDNUI7QUFBQSxNQUNGO0FBQUEsTUFDQSxhQUFhO0FBQUEsTUFDYixPQUFPO0FBQUEsSUFDVCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUSxDQUFDLGlCQUFpQjtBQUFBLEVBQzFCLFFBQVEsQ0FBQyxLQUFLO0FBQUEsRUFDZCxVQUFVO0FBQUEsRUFDVixRQUFRO0FBQUEsRUFDUixpQkFBaUI7QUFBQSxFQUNqQixPQUFPO0FBQUEsRUFDUCxRQUFRO0FBQUEsRUFDUixtQkFBbUI7QUFBQSxFQUNuQixjQUFjO0FBQUEsRUFDZCxrQkFBa0I7QUFBQSxFQUNsQixXQUFXO0FBQUEsRUFDWCxXQUFXO0FBQUEsRUFDWCxRQUFRO0FBQUEsRUFDUixRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsRUFDVjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
