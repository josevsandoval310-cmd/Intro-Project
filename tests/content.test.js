// Run with: node tests/content.test.js
// Checks the question bank is well-formed and every statement scenario balances.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { window: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['js/util.js', 'data/questions.js', 'js/views/statements.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
}
const IB = ctx.IB;

// Question bank
const topics = new Set(IB.TOPICS.map(t => t.id));
const ids = new Set();
IB.QUESTIONS.forEach(q => {
  assert.ok(q.id && !ids.has(q.id), `duplicate or missing id: ${q.id}`);
  ids.add(q.id);
  assert.ok(topics.has(q.t), `${q.id}: unknown topic ${q.t}`);
  assert.ok(IB.SOURCES[q.s], `${q.id}: unknown source ${q.s}`);
  assert.ok([1, 2, 3].includes(q.d), `${q.id}: bad difficulty`);
  assert.ok(q.q.length > 10 && q.a.length > 20, `${q.id}: question or answer too short`);
});
IB.TOPICS.forEach(t => assert.ok(IB.QUESTIONS.some(q => q.t === t.id), `topic ${t.id} has no questions`));

// Statement scenarios: balance sheet balances, cash ties to CFS, NI ties to CFS.
const sim = IB.views.statements;
let checked = 0;
for (const s of sim.SCENARIOS) {
  for (const X of [10, 20, 50, 100]) {
    for (const t of [0, 0.2, 0.25, 0.4]) {
      const r = sim.build(s, X, t);
      assert.ok(Math.abs(r.totalAssets - r.totalLE) < 1e-9, `${s.id} X=${X} t=${t}: A ${r.totalAssets} != L+E ${r.totalLE}`);
      if (r.ni !== 0) {
        assert.ok(r.cfo.length && r.cfo[0][0] === 'Net income' && Math.abs(r.cfo[0][1] - r.ni) < 1e-9, `${s.id}: CFS must start from net income`);
        const re = (r.equity.find(([l]) => l === 'Retained earnings') || [, 0])[1];
        assert.ok(Math.abs(re - r.ni) < 1e-9, `${s.id}: retained earnings should move with net income`);
      }
      checked++;
    }
  }
}
// Spot-check the classic: depreciation +10 at 40% -> NI -6, cash +4, assets -6.
const dep = sim.build(sim.SCENARIOS.find(s => s.id === 'dep'), 10, 0.4);
assert.ok(Math.abs(dep.ni + 6) < 1e-9 && Math.abs(dep.cash - 4) < 1e-9 && Math.abs(dep.totalAssets + 6) < 1e-9, 'depreciation classic');

console.log(`Question bank OK (${IB.QUESTIONS.length} questions). ${checked} scenario cases balance.`);
