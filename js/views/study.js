/*
 * Study: daily spaced-repetition review, topic drills, and timed mock superdays.
 */
window.IB = window.IB || {};
IB.views = IB.views || {};

IB.views.study = (function () {
  const { esc, md, shuffle, intervalLabel } = IB.util;
  const DIFF = { 1: 'Basic', 2: 'Intermediate', 3: 'Advanced' };
  const DRILL_SIZE = 20;

  const topicName = id => (IB.TOPICS.find(t => t.id === id) || { name: id }).name;

  function metaChips(q) {
    return `<span class="chip accent">${esc(topicName(q.t))}</span>
      <span class="chip">${DIFF[q.d] || 'Intermediate'}</span>
      <span class="chip">${esc(IB.SOURCES[q.s] || q.s)}</span>`;
  }

  /* ───────── Queue builders ───────── */
  function dailyQueue() {
    const due = IB.srs.dueIds();
    const fresh = IB.srs.newIds().slice(0, IB.srs.newRemainingToday());
    // Interleave: one new card after every two reviews so new material is spread out.
    const out = [];
    let i = 0, j = 0;
    while (i < due.length || j < fresh.length) {
      if (i < due.length) out.push(due[i++]);
      if (i < due.length) out.push(due[i++]);
      if (j < fresh.length) out.push(fresh[j++]);
    }
    return out;
  }

  function drillQueue(topic) {
    const qs = IB.srs.allQuestions().filter(q => q.t === topic);
    const now = Date.now();
    const groups = { due: [], learning: [], new: [], mastered: [] };
    qs.forEach(q => {
      const c = IB.srs.card(q.id);
      const s = IB.srs.status(q.id);
      if (c && c.due <= now) groups.due.push(q.id);
      else groups[s].push(q.id);
    });
    return [].concat(shuffle(groups.due), shuffle(groups.learning), groups.new, shuffle(groups.mastered)).slice(0, DRILL_SIZE);
  }

  function superdayQueue(topics, count) {
    const qs = IB.srs.allQuestions().filter(q => topics.includes(q.t));
    return shuffle(qs).slice(0, count).map(q => q.id);
  }

  /* ───────── Mode chooser ───────── */
  function chooser(el, preset) {
    const st = IB.store.get();
    const due = IB.srs.dueIds().length;
    const newLeft = Math.min(IB.srs.newRemainingToday(), IB.srs.newIds().length);
    let mode = preset || 'daily';

    el.innerHTML = `
      <div class="page-head"><h1>Study</h1><p>Answer out loud before revealing. Rate yourself honestly; the schedule adapts.</p></div>
      <div class="mode-grid" role="radiogroup" aria-label="Study mode">
        <button class="mode" data-mode="daily" role="radio"><h3>Daily review</h3><p>${due} due · ${newLeft} new. Spaced repetition brings back what you miss.</p></button>
        <button class="mode" data-mode="drill" role="radio"><h3>Drill a topic</h3><p>Up to ${DRILL_SIZE} cards from one topic, weakest first.</p></button>
        <button class="mode" data-mode="superday" role="radio"><h3>Mock superday</h3><p>Random timed questions. Grade yourself after each answer.</p></button>
      </div>
      <div class="card" id="opts" style="margin-top:16px"></div>`;

    const opts = el.querySelector('#opts');

    function paint() {
      el.querySelectorAll('.mode').forEach(b => {
        const on = b.dataset.mode === mode;
        b.classList.toggle('on', on);
        b.setAttribute('aria-checked', on);
      });
      if (mode === 'daily') {
        opts.innerHTML = `<div class="row between"><div><strong>${due + newLeft}</strong> card${due + newLeft === 1 ? '' : 's'} in today's session
          <div class="muted small">Change new cards per day in Home → Settings.</div></div>
          <button class="btn primary" data-go="daily" ${due + newLeft ? '' : 'disabled'}>Start</button></div>`;
      } else if (mode === 'drill') {
        opts.innerHTML = `<label class="field">Topic
          <select id="drill-topic">${IB.TOPICS.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label>
          <div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn primary" data-go="drill">Start drill</button></div>`;
      } else {
        const defaults = IB.TOPICS.filter(t => !(st.settings.excludeFit && t.id === 'fit'));
        opts.innerHTML = `
          <div class="grid cols-2 collapse">
            <label class="field">Questions
              <select id="sd-count">${[5, 10, 15, 20].map(n => `<option ${n === 10 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label class="field">Seconds per answer
              <input type="number" id="sd-timer" min="15" max="600" step="15" value="${st.settings.timer}"></label>
          </div>
          <div style="margin-top:12px" class="field" role="group" aria-label="Topics"><span class="small" style="font-weight:600;color:var(--text-2)">Topics</span>
            <div class="topic-picks" style="margin-top:6px">${IB.TOPICS.map(t => `<label><input type="checkbox" value="${t.id}" ${defaults.includes(t) ? 'checked' : ''}>${esc(t.short)}</label>`).join('')}</div>
          </div>
          <div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn primary" data-go="superday">Start mock</button></div>`;
      }
    }

    el.addEventListener('click', e => {
      const m = e.target.closest('.mode');
      if (m) { mode = m.dataset.mode; paint(); return; }
      const go = e.target.closest('[data-go]');
      if (!go) return;
      if (go.dataset.go === 'daily') IB.go('#/study?mode=daily&run=1');
      if (go.dataset.go === 'drill') IB.go('#/study?mode=drill&topic=' + el.querySelector('#drill-topic').value);
      if (go.dataset.go === 'superday') {
        const topics = [...el.querySelectorAll('.topic-picks input:checked')].map(i => i.value);
        if (!topics.length) { IB.util.toast('Pick at least one topic'); return; }
        const count = parseInt(el.querySelector('#sd-count').value, 10);
        const secs = Math.max(15, parseInt(el.querySelector('#sd-timer').value, 10) || 90);
        st.settings.timer = secs;
        st.settings.excludeFit = !topics.includes('fit');
        IB.store.save();
        IB.go(`#/study?mode=superday&run=1&n=${count}&t=${secs}&topics=${topics.join(',')}`);
      }
    });
    paint();
  }

  /* ───────── Flashcard session (daily + drill) ───────── */
  function session(el, queue, title) {
    const total = queue.length;
    let done = 0, again = 0, revealed = false, current = null;

    if (!total) {
      el.innerHTML = `<div class="card empty"><div class="big">✓</div><h2>Nothing to review right now</h2>
        <p>You're caught up. Try drilling a topic or a mock superday.</p>
        <div class="row" style="justify-content:center"><a class="btn primary" href="#/study?mode=drill">Drill a topic</a><a class="btn" href="#/study?mode=superday">Mock superday</a></div></div>`;
      return null;
    }

    function paint() {
      if (!queue.length) return finish();
      current = IB.srs.byId(queue[0]);
      if (!current) { queue.shift(); return paint(); }
      revealed = false;
      const isNew = IB.srs.isNew(current.id);
      el.innerHTML = `
        <div class="session-head">
          <a class="btn ghost sm" href="#/study" aria-label="End session">✕</a>
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${done / total * 100}%"></span></div>
          <span class="small muted num">${done}/${total}</span>
        </div>
        <div class="small muted" style="margin-bottom:8px">${esc(title)}</div>
        <article class="card flash" aria-live="polite">
          <div class="meta">${metaChips(current)}${isNew ? '<span class="chip good">New</span>' : ''}</div>
          <div class="q">${esc(current.q)}</div>
          <div id="ans"></div>
          <div class="prompt" id="prompt">Answer out loud first, then reveal. <span class="kbd">Space</span></div>
        </article>
        <div id="controls"><button class="btn primary block" data-act="reveal">Reveal answer</button></div>`;
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      const p = IB.srs.preview(current.id);
      el.querySelector('#ans').innerHTML = `<div class="answer">${md(current.a)}${current.tip ? `<div class="tip"><b>Tip · </b>${IB.util.inline(current.tip)}</div>` : ''}</div>`;
      el.querySelector('#prompt').remove();
      el.querySelector('#controls').innerHTML = `
        <div class="small muted">How did you do?</div>
        <div class="rate">
          <button class="btn again" data-rate="0">Again<small>${intervalLabel(p[0])} · <span class="kbd">1</span></small></button>
          <button class="btn hard" data-rate="1">Hard<small>${intervalLabel(p[1])} · <span class="kbd">2</span></small></button>
          <button class="btn good" data-rate="2">Good<small>${intervalLabel(p[2])} · <span class="kbd">3</span></small></button>
          <button class="btn easy" data-rate="3">Easy<small>${intervalLabel(p[3])} · <span class="kbd">4</span></small></button>
        </div>`;
    }

    function rate(r) {
      if (!revealed) return;
      IB.srs.review(current.id, r);
      const id = queue.shift();
      if (r === 0) {
        again++;
        // Bring missed cards back later in this same session.
        queue.splice(Math.min(queue.length, 3), 0, id);
      } else {
        done++; // every card leaves the queue with exactly one non-Again rating
      }
      paint();
    }

    function finish() {
      current = null;
      el.innerHTML = `<div class="card empty"><div class="big">🎯</div><h2>Session complete</h2>
        <p>${total} card${total === 1 ? '' : 's'} reviewed${again ? ` · ${again} miss${again === 1 ? '' : 'es'} repeated until you got them` : ''}.</p>
        <div class="row" style="justify-content:center"><a class="btn primary" href="#/home">Back to home</a><a class="btn" href="#/study">Study more</a></div></div>`;
    }

    el.addEventListener('click', e => {
      const b = e.target.closest('[data-act="reveal"], [data-rate]');
      if (!b) return;
      if (b.dataset.act === 'reveal') reveal(); else rate(parseInt(b.dataset.rate, 10));
    });
    const onKey = e => {
      if (!current || e.target.matches('input, textarea, select')) return;
      if ((e.key === ' ' || e.key === 'Enter') && !revealed) { e.preventDefault(); reveal(); }
      else if (revealed && /^[1-4]$/.test(e.key)) rate(parseInt(e.key, 10) - 1);
    };
    document.addEventListener('keydown', onKey);
    paint();
    return () => document.removeEventListener('keydown', onKey);
  }

  /* ───────── Mock superday ───────── */
  function superday(el, queue, seconds) {
    const total = queue.length;
    const results = [];
    let idx = 0, revealed = false, started = 0, elapsed = 0, timer = null;

    if (!total) {
      el.innerHTML = '<div class="card empty"><h2>No questions match those topics.</h2><a class="btn" href="#/study?mode=superday">Back</a></div>';
      return null;
    }

    function tick() {
      const left = seconds - Math.floor((Date.now() - started) / 1000);
      const t = el.querySelector('#timer');
      if (!t) return;
      const abs = Math.abs(left);
      t.textContent = (left < 0 ? '+' : '') + Math.floor(abs / 60) + ':' + String(abs % 60).padStart(2, '0');
      t.classList.toggle('low', left <= 10 && left >= 0);
      t.classList.toggle('over', left < 0);
    }

    function paint() {
      if (idx >= total) return finish();
      const q = IB.srs.byId(queue[idx]);
      revealed = false;
      started = Date.now();
      el.innerHTML = `
        <div class="session-head">
          <a class="btn ghost sm" href="#/study?mode=superday" aria-label="End mock">✕</a>
          <div class="progress"><span style="width:${idx / total * 100}%"></span></div>
          <span class="small muted num">${idx + 1}/${total}</span>
        </div>
        <div class="row between" style="margin-bottom:8px">
          <span class="small muted">Mock superday · answer out loud</span>
          <span class="timer" id="timer" aria-live="off"></span>
        </div>
        <article class="card flash">
          <div class="meta"><span class="chip accent">${esc(topicName(q.t))}</span></div>
          <div class="q">${esc(q.q)}</div>
          <div id="ans"></div>
          <div class="prompt" id="prompt">Speak your answer, then stop the clock. <span class="kbd">Space</span></div>
        </article>
        <div id="controls"><button class="btn primary block" data-act="reveal">Done, show answer</button></div>`;
      tick();
      clearInterval(timer);
      timer = setInterval(tick, 250);
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      clearInterval(timer);
      elapsed = (Date.now() - started) / 1000;
      const q = IB.srs.byId(queue[idx]);
      el.querySelector('#ans').innerHTML = `<div class="answer">${md(q.a)}${q.tip ? `<div class="tip"><b>Tip · </b>${IB.util.inline(q.tip)}</div>` : ''}</div>`;
      el.querySelector('#prompt').textContent = `You took ${Math.round(elapsed)}s.`;
      el.querySelector('#controls').innerHTML = `
        <div class="small muted">Compared with the model answer:</div>
        <div class="rate three">
          <button class="btn again" data-grade="0">Missed<small><span class="kbd">1</span></small></button>
          <button class="btn hard" data-grade="1">Shaky<small><span class="kbd">2</span></small></button>
          <button class="btn good" data-grade="2">Nailed it<small><span class="kbd">3</span></small></button>
        </div>`;
    }

    function grade(g) {
      if (!revealed) return;
      const id = queue[idx];
      results.push({ id, grade: g, seconds: elapsed });
      IB.srs.review(id, g); // Missed → Again, Shaky → Hard, Nailed → Good
      idx++;
      paint();
    }

    function finish() {
      clearInterval(timer);
      const count = g => results.filter(r => r.grade === g).length;
      const summary = {
        at: Date.now(), total, nailed: count(2), shaky: count(1), missed: count(0),
        avgSeconds: results.reduce((s, r) => s + r.seconds, 0) / results.length
      };
      const st = IB.store.get();
      st.superdays.push(summary);
      st.superdays = st.superdays.slice(-30);
      IB.store.save();
      const label = ['Missed', 'Shaky', 'Nailed'];
      const cls = ['bad', 'warn', 'good'];
      const ordered = results.slice().sort((a, b) => a.grade - b.grade);
      el.innerHTML = `
        <div class="page-head"><h1>Mock superday results</h1><p>${summary.nailed}/${total} nailed · average ${Math.round(summary.avgSeconds)}s per answer (target ${seconds}s)</p></div>
        <div class="grid cols-3" style="margin-bottom:16px">
          <div class="stat"><div class="label">Nailed</div><div class="value" style="color:var(--good)">${summary.nailed}</div></div>
          <div class="stat"><div class="label">Shaky</div><div class="value" style="color:var(--warn)">${summary.shaky}</div></div>
          <div class="stat"><div class="label">Missed</div><div class="value" style="color:var(--bad)">${summary.missed}</div></div>
        </div>
        <div class="card">
          <h2>Review your answers</h2>
          ${ordered.map(r => {
            const q = IB.srs.byId(r.id);
            return `<details class="lib-item"><summary><span class="qtext">${esc(q.q)}</span>
              <span class="chip ${cls[r.grade]}">${label[r.grade]}</span>
              <span class="tags"><span class="chip">${esc(topicName(q.t))}</span><span class="chip">${Math.round(r.seconds)}s${r.seconds > seconds ? ' · over' : ''}</span></span></summary>
              <div class="lib-answer">${md(q.a)}</div></details>`;
          }).join('')}
        </div>
        <div class="row"><a class="btn primary" href="#/study?mode=superday">Run another</a><a class="btn" href="#/home">Home</a></div>`;
    }

    el.addEventListener('click', e => {
      const b = e.target.closest('[data-act="reveal"], [data-grade]');
      if (!b) return;
      if (b.dataset.act === 'reveal') reveal(); else grade(parseInt(b.dataset.grade, 10));
    });
    const onKey = e => {
      if (idx >= total || e.target.matches('input, textarea, select')) return;
      if ((e.key === ' ' || e.key === 'Enter') && !revealed) { e.preventDefault(); reveal(); }
      else if (revealed && /^[1-3]$/.test(e.key)) grade(parseInt(e.key, 10) - 1);
    };
    document.addEventListener('keydown', onKey);
    paint();
    return () => { clearInterval(timer); document.removeEventListener('keydown', onKey); };
  }

  return {
    render(root, params) {
      const el = document.createElement('div');
      root.replaceChildren(el);
      const mode = params.mode;
      if (mode === 'daily' && params.run) return session(el, dailyQueue(), 'Daily review');
      if (mode === 'drill' && params.topic) return session(el, drillQueue(params.topic), 'Drill · ' + topicName(params.topic));
      if (mode === 'superday' && params.run) {
        const topics = (params.topics || '').split(',').filter(Boolean);
        const n = Math.max(1, parseInt(params.n, 10) || 10);
        const secs = Math.max(15, parseInt(params.t, 10) || 90);
        return superday(el, superdayQueue(topics.length ? topics : IB.TOPICS.map(t => t.id), n), secs);
      }
      chooser(el, mode);
      return null;
    }
  };
})();
