import contentCollections from '@content-collections/vinxi';
import {} from '@tanstack/react-start';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  vite: {
    plugins: [
      contentCollections(),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
});
