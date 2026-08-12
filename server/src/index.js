import { createApp } from './app.js';
import { config } from './config.js';
import { store } from './store.js';

const app = createApp();

app.listen(config.port, () => {
  console.log('┌──────────────────────────────────────────────────┐');
  console.log('│  Qarabağ Dirçəliş Xəritəsi — API server          │');
  console.log(`│  env: ${config.env.padEnd(43)}│`);
  console.log(`│  http://localhost:${String(config.port).padEnd(31)}│`);
  console.log(`│  docs: http://localhost:${config.port}/api/docs${' '.repeat(17)}│`);
  console.log(`│  seed: ${String(store.locations.size).padStart(2)} locations · ${String(store.reviews.size).padStart(2)} reviews · ${String(store.posts.size)} posts       │`);
  console.log('└──────────────────────────────────────────────────┘');
});
