import './home.css';

import Minigrid from 'minigrid';

const grid = new Minigrid({
  container: '.home-articles-list',
  item: '.home-articles-item',
  gutter: 12
});

grid.mount();

window.addEventListener('resize', () => grid.mount());
