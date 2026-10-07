/*
 * Persistence. Everything lives in one localStorage record so it can be
 * exported/imported as a single JSON backup. If storage is unavailable
 * (private mode, blocked site data) the app still works in memory.
 */
window.IB = window.IB || {};

IB.store = (function () {
  const KEY = 'ib-toolkit.v1';
  const DEFAULTS = () => ({
    version: 1,
    cards: {},          // question id -> SRS state
    custom: [],         // user-added questions
    days: {},           // 'YYYY-MM-DD' -> { reviews, newSeen }
    superdays: [],      // mock interview history
    settings: { newPerDay: 15, targetDate: '', timer: 90, excludeFit: false }
  });

  let state = DEFAULTS();
  let persistent = true;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const d = DEFAULTS();
        state = Object.assign(d, parsed);
        state.settings = Object.assign(d.settings, parsed.settings || {});
      }
    } catch (e) {
      persistent = false;
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      persistent = false;
    }
  }

  function get() { return state; }

  function day(key) {
    key = key || IB.util.todayKey();
    if (!state.days[key]) state.days[key] = { reviews: 0, newSeen: 0 };
    return state.days[key];
  }

  function exportJSON() {
    return JSON.stringify(Object.assign({ exportedAt: new Date().toISOString() }, state), null, 2);
  }

  function importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || !parsed.cards) {
      throw new Error('This file does not look like a toolkit backup.');
    }
    const d = DEFAULTS();
    state = Object.assign(d, parsed);
    state.settings = Object.assign(d.settings, parsed.settings || {});
    delete state.exportedAt;
    save();
  }

  function reset() {
    const settings = state.settings;
    const custom = state.custom;
    state = DEFAULTS();
    state.settings = settings;
    state.custom = custom;
    save();
  }

  return { load, save, get, day, exportJSON, importJSON, reset, isPersistent: () => persistent };
})();
