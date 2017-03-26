import './home.css';

import Minigrid from 'minigrid';

const $articles = document.getElementById('articles');

const grid = new Minigrid({
  container: '.home-articles-list',
  item: '.home-articles-item',
  gutter: 36
});

setTimeout(() => {
  grid.mount();

  $articles.classList.remove('lazy');
}, 300);

window.addEventListener('resize', () => grid.mount());
