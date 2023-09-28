import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://domainpulse.app',
    //'baseUrl': 'http://dev.dp.cos301.thuthuka.me',
    chromeWebSecurity: false,
  },
});
