/* Hash router. Views register on IB.views and may return a cleanup function. */
(function () {
  IB.store.load();

  const root = document.getElementById('main');
  let cleanup = null;

  function parse() {
    const hash = location.hash.replace(/^#\/?/, '') || 'home';
    const [path, query] = hash.split('?');
    const params = {};
    new URLSearchParams(query || '').forEach((v, k) => { params[k] = v; });
    return { name: path.split('/')[0] || 'home', params };
  }

  function route() {
    const { name, params } = parse();
    const view = IB.views[name] || IB.views.home;
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
    document.querySelectorAll('.nav a').forEach(a => {
      const on = a.dataset.route === name;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    root.innerHTML = '';
    cleanup = view.render(root, params) || null;
    window.scrollTo(0, 0);
  }

  IB.go = function (hash) {
    if (location.hash === hash) route(); else location.hash = hash;
  };

  window.addEventListener('hashchange', route);
  route();
})();
