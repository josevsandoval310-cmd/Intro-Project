// Run with: node tests/calc.test.js
const assert = require('assert');
const calc = require('../js/calc.js');
const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`);

// SIB 6 Bowl Corp case: 15x $10M entry, $75M equity, scheduled repayments, exit 15x $15M, $10M cash.
const bowl = calc.lbo({
  ebitda0: 10, entryMult: 15, feesPct: 0, debtMult: 7.5, rate: 0.06,
  growth: Math.pow(1.5, 1 / 5) - 1, years: 5, exitMult: 15, tax: 0.25,
  daPct: 0.1, capexPct: 0.1, nwcPct: 0.05, mode: 'schedule', repay1: 4, step: 0.5, exitCash: 10
});
close(bowl.equity0, 75, 1e-9, 'Bowl equity at entry');
close(bowl.exitDebt, 50, 1e-9, 'Bowl debt at exit');
close(bowl.exitEV, 225, 1e-6, 'Bowl exit EV');
close(bowl.exitEquity, 185, 1e-6, 'Bowl exit equity');
close(bowl.irr, 0.198, 0.0005, 'Bowl IRR');
const bridgeSum = bowl.bridge.reduce((s, [, v]) => s + v, 0);
close(bridgeSum, bowl.exitEquity - bowl.equity0, 1e-6, 'Returns bridge reconciles');

// SIB 6 leverage example: 20 equity -> 200 in 5 years = 10x, 58.5%
close(calc.irrFromMoic(10, 5), 0.585, 0.0005, '10x in 5 years');
close(calc.irrFromMoic(3, 5), 0.246, 0.0005, '3x in 5 years');
close(calc.irrFromMoic(1.5, 0.5), 1.25, 1e-9, '1.5x in 6 months');

// Cash sweep: debt never goes negative, bridge reconciles.
const sweep = calc.lbo({
  ebitda0: 100, entryMult: 10, feesPct: 0.02, debtMult: 6, rate: 0.08, growth: 0.06, years: 5,
  exitMult: 10, tax: 0.25, daPct: 0.2, capexPct: 0.2, nwcPct: 0.1, mode: 'sweep'
});
assert.ok(sweep.rows.every(r => r.debt >= 0), 'debt stays >= 0');
close(sweep.bridge.reduce((s, [, v]) => s + v, 0), sweep.exitEquity - sweep.equity0, 1e-6, 'Sweep bridge reconciles');

// SIB 3 beta example (wacc-06): 1.2 at D/E 0.5, t 40% -> 0.923 -> 1.477 at D/E 1.0
const w = calc.wacc({ rf: 0.045, mrp: 0.04, betaE: 1.2, deComp: 0.5, tax: 0.4, deTarget: 1.0, rd: 0.06 });
close(w.betaA, 0.923, 0.0005, 'Unlevered beta');
close(w.betaL, 1.477, 0.0005, 'Relevered beta');
close(w.dv, 0.5, 1e-9, 'D/V');
close(w.wacc, 0.5 * (0.045 + 1.4769 * 0.04) + 0.5 * 0.06 * 0.6, 0.0001, 'WACC');

// DCF: perpetuity check against a hand calculation (flat company: TV = FCF / WACC).
const flat = calc.dcf({ rev0: 100, growth: 0, years: 5, margin: 0.2, tax: 0.25, daPct: 0.05, capexPct: 0.05, nwcPct: 0.1,
  wacc: 0.1, tvMethod: 'perp', g: 0, exitMult: 8, cash: 10, debt: 30, shares: 10 });
// FCFF = 20 * 0.75 = 15 each year forever -> EV = 150
close(flat.ev, 150, 1e-6, 'Flat DCF EV = FCF / WACC');
close(flat.equity, 130, 1e-6, 'Equity = EV + cash - debt');
close(flat.perShare, 13, 1e-6, 'Per share');
// Implied growth of a perpetuity TV recovers g.
const grow = calc.dcf({ rev0: 100, growth: 0.05, years: 5, margin: 0.2, tax: 0.25, daPct: 0.05, capexPct: 0.06, nwcPct: 0.1,
  wacc: 0.09, tvMethod: 'perp', g: 0.02, exitMult: 8, cash: 0, debt: 0, shares: 1 });
close(grow.impliedG, 0.02, 1e-9, 'Implied g round-trips');

console.log('All calc tests passed.');
