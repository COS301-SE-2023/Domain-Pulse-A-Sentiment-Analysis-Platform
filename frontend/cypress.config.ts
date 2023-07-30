import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // baseUrl: 'http://localhost:4200',
    'baseUrl': 'http://dev.dp.cos301.thuthuka.me',
    chromeWebSecurity: false,
  },
});
