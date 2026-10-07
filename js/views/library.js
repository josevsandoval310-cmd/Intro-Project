/*
 * Library: browse/search every question, and manage your own questions
 * (added here, imported from JSON, or loaded from data/private-questions.js).
 */
window.IB = window.IB || {};
IB.views = IB.views || {};

IB.views.library = (function () {
  const { esc, md } = IB.util;
  const filters = { text: '', topic: '', source: '', status: '' };

  const topicName = id => (IB.TOPICS.find(t => t.id === id) || { name: id }).name;
  const isClass = s => /^sib/.test(s);

  function matches(q) {
    if (filters.topic && q.t !== filters.topic) return false;
    if (filters.source === 'class' && !isClass(q.s)) return false;
    if (filters.source === 'core' && q.s !== 'core') return false;
    if (filters.source === 'mine' && q.s !== 'mine' && q.s !== 'private') return false;
    if (filters.status && IB.srs.status(q.id) !== filters.status) return false;
    if (filters.text) {
      const hay = (q.q + ' ' + q.a + ' ' + (q.tip || '')).toLowerCase();
      if (!filters.text.toLowerCase().split(/\s+/).every(w => hay.includes(w))) return false;
    }
    return true;
  }

  function item(q) {
    const s = IB.srs.status(q.id);
    const c = IB.srs.card(q.id);
    const statusLabel = { new: 'New', learning: 'Learning', mastered: 'Mastered' }[s];
    const next = c && c.due ? new Date(c.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    return `<details class="lib-item" data-id="${esc(q.id)}">
      <summary>
        <span class="qtext">${esc(q.q)}</span>
        <span class="status-dot ${s}" title="${statusLabel}" aria-label="${statusLabel}"></span>
        <span class="tags"><span class="chip">${esc(topicName(q.t))}</span><span class="chip">${esc(IB.SOURCES[q.s] || q.s)}</span>
          ${c ? `<span class="chip">${statusLabel}${c.lapses ? ` · ${c.lapses} miss${c.lapses === 1 ? '' : 'es'}` : ''}${next ? ' · next ' + next : ''}</span>` : ''}</span>
      </summary>
      <div class="lib-answer">${md(q.a)}${q.tip ? `<div class="tip"><b>Tip · </b>${IB.util.inline(q.tip)}</div>` : ''}
        ${q.s === 'mine' ? `<div class="row" style="margin-top:10px"><button class="btn sm" data-edit="${esc(q.id)}">Edit</button><button class="btn sm danger" data-del="${esc(q.id)}">Delete</button></div>` : ''}
      </div>
    </details>`;
  }

  function formHtml(q) {
    q = q || {};
    return `<form id="qform" class="stack">
      <input type="hidden" name="id" value="${esc(q.id || '')}">
      <div class="grid cols-2 collapse">
        <label class="field">Topic<select name="t">${IB.TOPICS.map(t => `<option value="${t.id}" ${q.t === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>
        <label class="field">Difficulty<select name="d">${[[1, 'Basic'], [2, 'Intermediate'], [3, 'Advanced']].map(([v, l]) => `<option value="${v}" ${(q.d || 2) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <label class="field">Question<textarea name="q" required rows="2">${esc(q.q || '')}</textarea></label>
      <label class="field">Answer <span class="muted" style="font-weight:400">(start a line with "- " for bullets, **bold** for emphasis)</span><textarea name="a" required rows="6">${esc(q.a || '')}</textarea></label>
      <label class="field">Tip (optional)<input type="text" name="tip" value="${esc(q.tip || '')}"></label>
      <div class="row" style="justify-content:flex-end">
        <button type="button" class="btn ghost" data-act="cancel">Cancel</button>
        <button class="btn primary">${q.id ? 'Save changes' : 'Add question'}</button>
      </div>
    </form>`;
  }

  return {
    render(root) {
      const el = document.createElement('div');
      root.replaceChildren(el);
      const st = IB.store.get();
      const privCount = (IB.PRIVATE_QUESTIONS || []).length;

      el.innerHTML = `
        <div class="page-head row between">
          <div><h1>Library</h1><p>Every question in your bank. Tap one to see the answer.</p></div>
          <button class="btn primary" data-act="add">+ Add question</button>
        </div>
        <div class="card" id="editor" hidden></div>
        <div class="card">
          <div class="grid cols-4" style="margin-bottom:6px">
            <label class="field" style="grid-column:span 2">Search<input type="search" id="f-text" placeholder="e.g. goodwill, WACC, catch-up" value="${esc(filters.text)}"></label>
            <label class="field">Topic<select id="f-topic"><option value="">All topics</option>${IB.TOPICS.map(t => `<option value="${t.id}" ${filters.topic === t.id ? 'selected' : ''}>${esc(t.short)}</option>`).join('')}</select></label>
            <label class="field">Status<select id="f-status">${[['', 'Any status'], ['new', 'New'], ['learning', 'Learning'], ['mastered', 'Mastered']].map(([v, l]) => `<option value="${v}" ${filters.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
          </div>
          <div class="seg" id="f-source" role="group" aria-label="Source">
            ${[['', 'All'], ['class', 'From class'], ['core', 'Core'], ['mine', 'Mine']].map(([v, l]) => `<button data-v="${v}" class="${filters.source === v ? 'on' : ''}">${l}</button>`).join('')}
          </div>
          <div class="small muted" id="count" style="margin-top:10px"></div>
          <div id="list"></div>
        </div>
        <details class="card">
          <summary style="cursor:pointer;font-weight:700">Bulk import your own questions</summary>
          <div class="stack" style="margin-top:12px">
            <p class="small muted">Import a JSON array like <code>[{"t":"dcf","q":"…","a":"…"}]</code>. Topic ids: ${IB.TOPICS.map(t => `<code>${t.id}</code>`).join(' ')}.
            Imported questions are stored only in this browser (include them in your backup from Home → Settings).</p>
            <p class="small muted">To keep a larger set in files (e.g., notes from the 400 Questions guide), put them in <code>data/private-questions.js</code>. That file is gitignored, so it never gets pushed to GitHub. ${privCount ? `<span class="chip good">${privCount} loaded</span>` : '<span class="chip">not found</span>'}</p>
            <div class="row">
              <label class="btn">Import JSON<input type="file" accept="application/json,.json" id="bulk" hidden></label>
              <button class="btn" data-act="export-mine" ${st.custom.length ? '' : 'disabled'}>Export my ${st.custom.length} question${st.custom.length === 1 ? '' : 's'}</button>
            </div>
          </div>
        </details>`;

      const list = el.querySelector('#list');
      const editor = el.querySelector('#editor');

      const paint = () => {
        const qs = IB.srs.allQuestions().filter(matches);
        el.querySelector('#count').textContent = `${qs.length} question${qs.length === 1 ? '' : 's'}`;
        list.innerHTML = qs.length ? qs.map(item).join('') : '<div class="empty">No questions match.</div>';
      };

      const openEditor = q => {
        editor.hidden = false;
        editor.innerHTML = `<h2>${q ? 'Edit question' : 'Add your own question'}</h2>` + formHtml(q);
        editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        editor.querySelector('textarea[name="q"]').focus();
      };

      el.querySelector('#f-text').addEventListener('input', e => { filters.text = e.target.value.trim(); paint(); });
      el.querySelector('#f-topic').addEventListener('change', e => { filters.topic = e.target.value; paint(); });
      el.querySelector('#f-status').addEventListener('change', e => { filters.status = e.target.value; paint(); });
      el.querySelector('#f-source').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        filters.source = b.dataset.v;
        el.querySelectorAll('#f-source button').forEach(x => x.classList.toggle('on', x === b));
        paint();
      });

      el.addEventListener('submit', e => {
        if (e.target.id !== 'qform') return;
        e.preventDefault();
        const f = new FormData(e.target);
        const q = { t: f.get('t'), d: parseInt(f.get('d'), 10), q: f.get('q').trim(), a: f.get('a').trim() };
        if (f.get('tip').trim()) q.tip = f.get('tip').trim();
        const id = f.get('id');
        if (id) {
          const i = st.custom.findIndex(x => x.id === id);
          if (i >= 0) st.custom[i] = Object.assign({ id }, q);
        } else {
          st.custom.push(Object.assign({ id: 'my-' + Date.now().toString(36) }, q));
        }
        IB.store.save();
        editor.hidden = true;
        IB.util.toast(id ? 'Question updated' : 'Question added. It will show up as new in your reviews.');
        this.render(root);
      });

      el.addEventListener('click', e => {
        const t = e.target.closest('[data-act], [data-edit], [data-del]');
        if (!t) return;
        if (t.dataset.act === 'add') openEditor(null);
        else if (t.dataset.act === 'cancel') editor.hidden = true;
        else if (t.dataset.act === 'export-mine') IB.util.download('my-questions.json', JSON.stringify(st.custom.map(({ id, ...rest }) => rest), null, 2));
        else if (t.dataset.edit) openEditor(st.custom.find(q => q.id === t.dataset.edit));
        else if (t.dataset.del) {
          if (!confirm('Delete this question and its review history?')) return;
          st.custom = st.custom.filter(q => q.id !== t.dataset.del);
          delete st.cards[t.dataset.del];
          IB.store.save();
          this.render(root);
        }
      });

      el.querySelector('#bulk').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        file.text().then(text => {
          try {
            const arr = JSON.parse(text);
            if (!Array.isArray(arr)) throw new Error('Expected a JSON array of questions.');
            const valid = new Set(IB.TOPICS.map(t => t.id));
            let added = 0;
            arr.forEach((x, i) => {
              if (!x || !x.q || !x.a) return;
              const topic = valid.has(x.t) ? x.t : 'valuation';
              st.custom.push({ id: 'my-' + Date.now().toString(36) + '-' + i, t: topic, d: [1, 2, 3].includes(x.d) ? x.d : 2, q: String(x.q), a: String(x.a), tip: x.tip ? String(x.tip) : undefined });
              added++;
            });
            IB.store.save();
            IB.util.toast(`Imported ${added} question${added === 1 ? '' : 's'}`);
            this.render(root);
          } catch (err) { alert('Could not import: ' + err.message); }
        });
      });

      paint();
      return null;
    }
  };
})();
