// Standalone page entry (index.html): mounts the game into #app.
import { mount } from './app.js';

window.scoreFour = mount(document.getElementById('app'));
