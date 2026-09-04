import { createApp } from 'vue';
import App from './App.vue';
import { initToken } from './api/client';
import './styles/editor.css';

initToken();

createApp(App).mount('#app');
