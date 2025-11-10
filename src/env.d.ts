// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite/client" />
/// <reference types="../vendor/integration/types.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime;
type D1Database = import('@cloudflare/workers-types').D1Database;

declare namespace App {
  interface Locals extends Runtime {
    user?: {
      name: string;
      surname: string;
    };
    runtime: {
      env: {
        DB: D1Database;
      };
    };
  }
}
