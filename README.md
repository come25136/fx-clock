## FX Clock

世界の主要 FX セッションを都市別クロックと 24 時間タイムラインで表示する Next.js 16 アプリです。

### Development

```bash
npm install
npm run dev
```

### Commands

- `npm run dev`: 開発サーバー
- `npm run lint`: ESLint 実行
- `npm run build`: 静的書き出しを含む本番ビルド

### Deploy

`next.config.ts` で `output: "export"` を使っているため、`npm run build` 後の `out/` を静的ホスティングできます。`wrangler.jsonc` は `out/` を配信する設定です。
