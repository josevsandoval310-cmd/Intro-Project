/* Shared helpers: escaping, light markdown, dates, number formatting. */
window.IB = window.IB || {};

IB.util = (function () {
  const DAY = 24 * 60 * 60 * 1000;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }

  // Light markdown: paragraphs, "- " bullets, "1. " numbered lists, **bold**.
  function md(text) {
    const lines = String(text || '').split('\n');
    let html = '';
    let list = null; // 'ul' | 'ol'
    let para = [];
    const flushPara = () => {
      if (para.length) { html += '<p>' + para.map(inline).join('<br>') + '</p>'; para = []; }
    };
    const closeList = () => { if (list) { html += '</' + list + '>'; list = null; } };
    for (const raw of lines) {
      const line = raw.trim();
      const ul = /^- (.*)$/.exec(line);
      const ol = /^\d+\. (.*)$/.exec(line);
      if (ul || ol) {
        flushPara();
        const want = ul ? 'ul' : 'ol';
        if (list !== want) { closeList(); html += '<' + want + '>'; list = want; }
        html += '<li>' + inline((ul || ol)[1]) + '</li>';
      } else if (!line) {
        flushPara(); closeList();
      } else {
        closeList(); para.push(line);
      }
    }
    flushPara(); closeList();
    return html;
  }

  function todayKey(d) {
    d = d || new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function startOfDay(d) {
    const x = new Date(d || Date.now());
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  }

  function daysBetween(fromKey, toKey) {
    const a = new Date(fromKey + 'T00:00:00');
    const b = new Date(toKey + 'T00:00:00');
    return Math.round((b - a) / DAY);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function num(v, fallback) {
    const n = parseFloat(String(v).replace(/[,$%x\s]/g, ''));
    return isFinite(n) ? n : (fallback === undefined ? 0 : fallback);
  }

  function fmt(n, dp) {
    if (!isFinite(n)) return '–';
    dp = dp === undefined ? 1 : dp;
    const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
    return n < 0 ? '(' + s + ')' : s;
  }

  function signed(n, dp) {
    if (!isFinite(n)) return '–';
    dp = dp === undefined ? 1 : dp;
    if (Math.abs(n) < 1e-9) return '0';
    const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: dp });
    return (n > 0 ? '+' : '−') + s;
  }

  function pct(n, dp) {
    if (!isFinite(n)) return '–';
    return (n * 100).toFixed(dp === undefined ? 1 : dp) + '%';
  }

  function mult(n, dp) {
    if (!isFinite(n)) return '–';
    return n.toFixed(dp === undefined ? 1 : dp) + 'x';
  }

  function intervalLabel(days) {
    if (days <= 0) return '<10m';
    if (days < 30) return days + 'd';
    if (days < 365) return Math.round(days / 30) + 'mo';
    return (days / 365).toFixed(1) + 'y';
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  return { DAY, esc, inline, md, todayKey, startOfDay, daysBetween, shuffle, pick, num, fmt, signed, pct, mult, intervalLabel, download, toast };
})();
