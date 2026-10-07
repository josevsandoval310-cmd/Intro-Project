/*
 * Spaced repetition (a simplified SM-2).
 *
 * Each card keeps: ease, interval (days), due (ms timestamp), reps, lapses.
 * Ratings: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy.
 * A card is "mastered" once its interval reaches MASTERED_DAYS.
 */
window.IB = window.IB || {};

IB.srs = (function () {
  const { DAY } = IB.util;
  const MIN_EASE = 1.3;
  const AGAIN_DELAY = 10 * 60 * 1000;
  const MASTERED_DAYS = 21;

  function allQuestions() {
    const st = IB.store.get();
    const priv = (IB.PRIVATE_QUESTIONS || []).map((q, i) => Object.assign({ id: 'priv-' + i, s: 'private', d: 2 }, q));
    const custom = (st.custom || []).map(q => Object.assign({ s: 'mine', d: 2 }, q));
    return IB.QUESTIONS.concat(priv, custom);
  }

  function byId(id) { return allQuestions().find(q => q.id === id); }

  function card(id) { return IB.store.get().cards[id]; }

  function isNew(id) { return !card(id); }

  // What the next interval would be for each rating (used for button labels).
  function preview(id) {
    return [0, 1, 2, 3].map(r => next(card(id), r).interval);
  }

  function next(c, rating) {
    c = c ? Object.assign({}, c) : { ease: 2.5, interval: 0, reps: 0, lapses: 0 };
    if (rating === 0) {
      c.lapses += 1;
      c.reps = 0;
      c.interval = 0;
      c.ease = Math.max(MIN_EASE, c.ease - 0.2);
      c.due = Date.now() + AGAIN_DELAY;
    } else {
      let ivl;
      if (rating === 1) {
        ivl = c.reps === 0 ? 1 : Math.max(c.interval + 1, Math.round(c.interval * 1.2));
        c.ease = Math.max(MIN_EASE, c.ease - 0.15);
      } else if (rating === 2) {
        ivl = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.interval * c.ease);
      } else {
        ivl = c.reps === 0 ? 4 : Math.round(Math.max(c.interval, 1) * c.ease * 1.3);
        c.ease += 0.15;
      }
      c.interval = Math.max(1, ivl);
      c.reps += 1;
      c.due = IB.util.startOfDay() + c.interval * DAY;
    }
    c.last = Date.now();
    c.lastRating = rating;
    return c;
  }

  function review(id, rating) {
    const st = IB.store.get();
    const wasNew = !st.cards[id];
    st.cards[id] = next(st.cards[id], rating);
    const day = IB.store.day();
    day.reviews += 1;
    if (wasNew) day.newSeen += 1;
    IB.store.save();
    return st.cards[id];
  }

  function status(id) {
    const c = card(id);
    if (!c) return 'new';
    if (c.interval >= MASTERED_DAYS) return 'mastered';
    return 'learning';
  }

  function dueIds(now) {
    now = now || Date.now();
    const st = IB.store.get();
    const valid = new Set(allQuestions().map(q => q.id));
    return Object.keys(st.cards)
      .filter(id => valid.has(id) && st.cards[id].due <= now)
      .sort((a, b) => st.cards[a].due - st.cards[b].due);
  }

  function newIds(topics) {
    const st = IB.store.get();
    return allQuestions()
      .filter(q => !st.cards[q.id] && (!topics || topics.includes(q.t)))
      .sort((a, b) => (a.d - b.d) || 0)
      .map(q => q.id);
  }

  function newRemainingToday() {
    const st = IB.store.get();
    return Math.max(0, st.settings.newPerDay - IB.store.day().newSeen);
  }

  // Recommended new cards per day to finish the bank by the target date.
  function pace() {
    const st = IB.store.get();
    if (!st.settings.targetDate) return null;
    const daysLeft = IB.util.daysBetween(IB.util.todayKey(), st.settings.targetDate);
    const remaining = newIds().length;
    if (daysLeft <= 0) return { daysLeft, remaining, perDay: remaining };
    return { daysLeft, remaining, perDay: Math.ceil(remaining / daysLeft) };
  }

  function topicStats() {
    const qs = allQuestions();
    const st = IB.store.get();
    return IB.TOPICS.map(t => {
      const items = qs.filter(q => q.t === t.id);
      let n = 0, learning = 0, mastered = 0, lapses = 0, seen = 0;
      items.forEach(q => {
        const s = status(q.id);
        if (s === 'new') n++;
        else {
          seen++;
          lapses += st.cards[q.id].lapses;
          if (s === 'mastered') mastered++; else learning++;
        }
      });
      // Weakness score: share of reviewed cards that were missed, weighted toward low mastery.
      const weakness = seen ? (lapses / seen) + (1 - mastered / items.length) * 0.5 : null;
      return Object.assign({}, t, { total: items.length, new: n, learning, mastered, seen, lapses, weakness });
    });
  }

  function streak() {
    const days = IB.store.get().days;
    let count = 0;
    const d = new Date();
    // Today counts if studied; otherwise the streak can still be alive from yesterday.
    if (!(days[IB.util.todayKey(d)] && days[IB.util.todayKey(d)].reviews)) d.setDate(d.getDate() - 1);
    while (days[IB.util.todayKey(d)] && days[IB.util.todayKey(d)].reviews > 0) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }

  return { allQuestions, byId, card, isNew, preview, review, status, dueIds, newIds, newRemainingToday, pace, topicStats, streak, MASTERED_DAYS };
})();
