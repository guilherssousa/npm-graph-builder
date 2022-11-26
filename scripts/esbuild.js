const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["index.ts"],
    outdir: "dist",
    bundle: true,
    sourcemap: true,
    minify: true,
    platform: "node",
    target: ["node10.4"],
    format: "cjs",
  })
  .then((result) => console.log(result))
  .catch(() => process.exit(1));
