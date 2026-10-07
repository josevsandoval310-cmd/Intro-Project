/* Home: today's queue, progress by topic, weak spots, settings and backup. */
window.IB = window.IB || {};
IB.views = IB.views || {};

IB.views.home = {
  render(root) {
    const { esc, pct } = IB.util;
    const st = IB.store.get();
    const all = IB.srs.allQuestions();
    const due = IB.srs.dueIds().length;
    const newLeft = Math.min(IB.srs.newRemainingToday(), IB.srs.newIds().length);
    const stats = IB.srs.topicStats();
    const mastered = stats.reduce((s, t) => s + t.mastered, 0);
    const seen = stats.reduce((s, t) => s + t.seen, 0);
    const streak = IB.srs.streak();
    const pace = IB.srs.pace();
    const today = IB.store.day();

    const weak = stats
      .filter(t => t.seen >= 3 && t.weakness !== null)
      .sort((a, b) => b.weakness - a.weakness)
      .slice(0, 3);

    const lastMock = st.superdays[st.superdays.length - 1];
    const el = document.createElement('div');
    root.replaceChildren(el);

    let paceHtml = '';
    if (pace) {
      const label = pace.daysLeft > 0
        ? `<strong>${pace.daysLeft}</strong> day${pace.daysLeft === 1 ? '' : 's'} to your target date`
        : 'Your target date is today or has passed';
      const advice = pace.remaining === 0
        ? 'You have seen every question. Keep up with reviews.'
        : `Learn about <strong>${pace.perDay}</strong> new question${pace.perDay === 1 ? '' : 's'}/day to see all ${pace.remaining} remaining in time` +
          (pace.perDay > st.settings.newPerDay ? ` <span class="chip warn">above your ${st.settings.newPerDay}/day setting</span>` : '') + '.';
      paceHtml = `<div class="card"><div class="row between"><div>${label}<div class="muted small">${advice}</div></div>
        ${pace.perDay > st.settings.newPerDay && pace.remaining ? `<button class="btn sm" data-act="matchpace">Set ${pace.perDay}/day</button>` : ''}</div></div>`;
    }

    el.innerHTML = `
      <div class="page-head">
        <h1>${greeting()}</h1>
        <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · ${all.length} questions in your bank</p>
      </div>

      <div class="grid cols-4" style="margin-bottom:16px">
        <div class="stat"><div class="label">Due now</div><div class="value">${due}</div><div class="sub">reviews</div></div>
        <div class="stat"><div class="label">New today</div><div class="value">${newLeft}</div><div class="sub">of ${st.settings.newPerDay}/day</div></div>
        <div class="stat"><div class="label">Streak</div><div class="value">${streak}</div><div class="sub">day${streak === 1 ? '' : 's'}${today.reviews ? ' · ' + today.reviews + ' today' : ''}</div></div>
        <div class="stat"><div class="label">Mastered</div><div class="value">${mastered}</div><div class="sub">${pct(mastered / all.length, 0)} of bank · ${seen} seen</div></div>
      </div>

      <div class="card">
        <div class="row between">
          <div>
            <h2 style="margin:0">${due + newLeft > 0 ? 'Ready for today\'s session' : 'All caught up'}</h2>
            <div class="muted small">${due + newLeft > 0
              ? `${due} review${due === 1 ? '' : 's'} + ${newLeft} new question${newLeft === 1 ? '' : 's'}`
              : 'Nothing due. Drill a weak topic or run a mock superday.'}</div>
          </div>
          <div class="row">
            <a class="btn primary" href="#/study?mode=daily&run=1">${due + newLeft > 0 ? 'Start review' : 'Study anyway'}</a>
            <a class="btn" href="#/study?mode=superday">Mock superday</a>
          </div>
        </div>
      </div>

      ${paceHtml}

      <div class="card">
        <div class="row between" style="margin-bottom:6px">
          <h2 style="margin:0">Progress by topic</h2>
          <div class="legend"><span><i style="background:var(--mastered)"></i>Mastered</span><span><i style="background:var(--learning)"></i>Learning</span><span><i style="background:var(--new)"></i>New</span></div>
        </div>
        ${stats.map(t => `
          <div class="topic-row">
            <div><span class="name">${esc(t.name)}</span> <span class="counts">${t.mastered}/${t.total} mastered${t.lapses ? ` · ${t.lapses} miss${t.lapses === 1 ? '' : 'es'}` : ''}</span></div>
            <a class="btn sm" href="#/study?mode=drill&topic=${t.id}">Drill</a>
            <div class="bar" role="img" aria-label="${esc(t.name)}: ${t.mastered} mastered, ${t.learning} learning, ${t.new} new">
              <span class="m" style="width:${t.total ? t.mastered / t.total * 100 : 0}%"></span>
              <span class="l" style="width:${t.total ? t.learning / t.total * 100 : 0}%"></span>
            </div>
          </div>`).join('')}
      </div>

      <div class="grid cols-2 collapse">
        <div class="card">
          <h2>Weak spots</h2>
          ${weak.length ? `<ul class="flags">${weak.map(t => `<li><span class="chip bad">${t.lapses} miss${t.lapses === 1 ? '' : 'es'}</span><span><a href="#/study?mode=drill&topic=${t.id}">${esc(t.name)}</a> · ${t.mastered}/${t.total} mastered</span></li>`).join('')}</ul>`
            : '<p class="muted small">Review a few cards in each topic and your weakest areas will show up here.</p>'}
        </div>
        <div class="card">
          <h2>Last mock superday</h2>
          ${lastMock ? `<p style="margin:0"><strong>${lastMock.nailed}/${lastMock.total}</strong> nailed · ${lastMock.shaky} shaky · ${lastMock.missed} missed</p>
            <p class="muted small" style="margin:0">${new Date(lastMock.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · avg ${Math.round(lastMock.avgSeconds)}s per answer</p>`
            : '<p class="muted small">Timed, random questions answered out loud, like a real superday.</p>'}
        </div>
      </div>

      <details class="card" id="settings">
        <summary style="cursor:pointer;font-weight:700">Settings &amp; backup</summary>
        <div class="stack" style="margin-top:14px">
          <div class="grid cols-3">
            <label class="field">New questions per day
              <input type="number" min="0" max="200" id="set-new" value="${st.settings.newPerDay}">
            </label>
            <label class="field">Target date (first superday)
              <input type="date" id="set-target" value="${esc(st.settings.targetDate)}">
            </label>
            <label class="field">Superday answer timer (sec)
              <input type="number" min="15" max="600" step="15" id="set-timer" value="${st.settings.timer}">
            </label>
          </div>
          <div class="row">
            <span class="muted small">Theme</span>
            <div class="seg" id="theme">
              ${['auto', 'light', 'dark'].map(t => `<button data-theme="${t}" class="${(document.documentElement.dataset.theme || 'auto') === t ? 'on' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
            </div>
          </div>
          <p class="muted small" style="margin:0">Progress is saved in this browser${IB.store.isPersistent() ? '' : ' <span class="chip warn">storage unavailable: progress will not persist</span>'}. Export a backup to move it to another device.</p>
          <div class="row">
            <button class="btn" data-act="export">Export backup</button>
            <label class="btn">Import backup<input type="file" accept="application/json,.json" id="import" hidden></label>
            <button class="btn danger" data-act="reset">Reset progress</button>
          </div>
        </div>
      </details>
    `;

    const save = () => { IB.store.save(); IB.util.toast('Saved'); };
    el.querySelector('#set-new').addEventListener('change', e => {
      st.settings.newPerDay = Math.max(0, Math.min(200, parseInt(e.target.value, 10) || 0)); save(); this.render(root); root.querySelector('#settings').open = true;
    });
    el.querySelector('#set-target').addEventListener('change', e => {
      st.settings.targetDate = e.target.value; save(); this.render(root); root.querySelector('#settings').open = true;
    });
    el.querySelector('#set-timer').addEventListener('change', e => {
      st.settings.timer = Math.max(15, Math.min(600, parseInt(e.target.value, 10) || 90)); save();
    });
    el.querySelector('#theme').addEventListener('click', e => {
      const t = e.target.dataset.theme;
      if (!t) return;
      IB.setTheme(t);
      el.querySelectorAll('#theme button').forEach(b => b.classList.toggle('on', b.dataset.theme === t));
    });
    el.querySelector('#import').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      f.text().then(text => {
        try { IB.store.importJSON(text); IB.util.toast('Backup restored'); this.render(root); }
        catch (err) { alert(err.message); }
      });
    });
    el.addEventListener('click', e => {
      const act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'export') {
        IB.util.download('ib-toolkit-backup-' + IB.util.todayKey() + '.json', IB.store.exportJSON());
      } else if (act.dataset.act === 'reset') {
        if (confirm('Reset all review progress? Your own questions and settings are kept.')) { IB.store.reset(); this.render(root); }
      } else if (act.dataset.act === 'matchpace' && pace) {
        st.settings.newPerDay = pace.perDay; save(); this.render(root);
      }
    });

    function greeting() {
      const h = new Date().getHours();
      return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    }
  }
};

/* Theme preference (auto / light / dark), stored per browser. */
IB.setTheme = function (t) {
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  try { localStorage.setItem('ib-toolkit.theme', t); } catch (e) { /* ignore */ }
};
(function () {
  try {
    const t = localStorage.getItem('ib-toolkit.theme');
    if (t && t !== 'auto') document.documentElement.dataset.theme = t;
  } catch (e) { /* ignore */ }
})();
