/**
 * App Entry Point
 *
 * Bootstraps the Vue app using the shell package.
 * The shell provides router, auth, and layout.
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from '@{{org}}/shell';
import App from './App.vue';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');
