/*
 * Pure valuation math (no DOM), so it can be unit-tested with Node.
 * All rates are decimals (0.10 = 10%). Cash flows are end-of-year.
 */
(function (root) {
  const IB = root.IB = root.IB || {};

  /* ───────── DCF (FCFF / WACC, as in SIB 4) ───────── */
  function dcf(p) {
    const rows = [];
    let prevRev = p.rev0;
    let sumPV = 0;
    for (let y = 1; y <= p.years; y++) {
      const rev = prevRev * (1 + p.growth);
      const ebit = rev * p.margin;
      const nopat = ebit * (1 - p.tax);
      const da = rev * p.daPct;
      const capex = rev * p.capexPct;
      const dnwc = (rev - prevRev) * p.nwcPct;
      const fcff = nopat + da - dnwc - capex;
      const df = 1 / Math.pow(1 + p.wacc, y);
      const pv = fcff * df;
      sumPV += pv;
      rows.push({ year: y, rev, ebit, ebitda: ebit + da, nopat, da, capex, dnwc, fcff, df, pv });
      prevRev = rev;
    }
    const last = rows[rows.length - 1];
    const warnings = [];
    let tv;
    if (p.tvMethod === 'mult') {
      tv = last.ebitda * p.exitMult;
    } else {
      tv = p.wacc > p.g ? last.fcff * (1 + p.g) / (p.wacc - p.g) : NaN;
      if (!(p.wacc > p.g)) warnings.push('Growth must be below WACC for a perpetuity.');
    }
    const pvTV = tv * last.df;
    const ev = sumPV + pvTV;
    const equity = ev + p.cash - p.debt;
    const perShare = p.shares > 0 ? equity / p.shares : NaN;
    const impliedMult = tv / last.ebitda;
    const impliedG = (tv * p.wacc - last.fcff) / (tv + last.fcff);

    if (isFinite(pvTV) && pvTV > 2 * sumPV) warnings.push(`PV of terminal value is ${(pvTV / sumPV).toFixed(1)}x the PV of the explicit period (class rule of thumb: no more than ~2x). Consider a longer explicit period.`);
    const gCheck = p.tvMethod === 'mult' ? impliedG : p.g;
    if (isFinite(gCheck) && gCheck > 0.03) warnings.push(`${p.tvMethod === 'mult' ? 'Implied perpetuity' : 'Perpetuity'} growth of ${(gCheck * 100).toFixed(1)}% is above long-run GDP growth (~2–3%).`);
    if (p.years < 5 || p.years > 10) warnings.push('Explicit period is usually 5–10 years.');

    return { rows, sumPV, tv, pvTV, ev, equity, perShare, impliedMult, impliedG, tvShare: pvTV / ev, warnings };
  }

  /* ───────── WACC with unlevered / relevered beta (β_debt = 0) ───────── */
  function wacc(p) {
    const betaA = p.betaE / (1 + (1 - p.tax) * p.deComp);
    const betaL = betaA * (1 + (1 - p.tax) * p.deTarget);
    const re = p.rf + betaL * p.mrp;
    const dv = p.deTarget / (1 + p.deTarget);
    const ev = 1 - dv;
    const rdAfter = p.rd * (1 - p.tax);
    return { betaA, betaL, re, dv, ev, rdAfter, wacc: ev * re + dv * rdAfter };
  }

  /* ───────── LBO (SIB 6 methodology) ───────── */
  function lbo(p) {
    const ev0 = p.ebitda0 * p.entryMult;
    const fees = ev0 * p.feesPct;
    const debt0 = p.ebitda0 * p.debtMult;
    const equity0 = ev0 + fees - debt0;
    const rows = [];
    let prev = p.ebitda0, debt = debt0, cash = 0;

    for (let y = 1; y <= p.years; y++) {
      const ebitda = prev * (1 + p.growth);
      const da = ebitda * p.daPct;
      const ebit = ebitda - da;
      const interest = debt * p.rate; // on beginning balance (avoids circularity)
      const ebt = ebit - interest;
      const tax = Math.max(0, ebt * p.tax);
      const ni = ebt - tax;
      const capex = ebitda * p.capexPct;
      const dnwc = (ebitda - prev) * p.nwcPct;
      const fcf = ni + da - capex - dnwc;
      const scheduled = p.mode === 'schedule' ? p.repay1 + p.step * (y - 1) : Math.max(0, fcf);
      const repay = Math.max(0, Math.min(debt, scheduled));
      const debtBeg = debt;
      debt -= repay;
      cash += fcf - repay;
      rows.push({ year: y, ebitda, da, ebit, interest, ebt, tax, ni, capex, dnwc, fcf, debtBeg, repay, debt, cash });
      prev = ebitda;
    }

    const last = rows[rows.length - 1];
    const exitCash = p.mode === 'schedule' ? p.exitCash : last.cash;
    const exitEV = last.ebitda * p.exitMult;
    const exitEquity = exitEV - last.debt + exitCash;
    const moic = exitEquity / equity0;
    const irr = moic > 0 ? Math.pow(moic, 1 / p.years) - 1 : -1;

    // Returns bridge: where the equity gain came from.
    const bridge = [
      ['EBITDA growth', (last.ebitda - p.ebitda0) * p.entryMult],
      ['Multiple expansion', (p.exitMult - p.entryMult) * last.ebitda],
      ['Debt paydown & cash', (debt0 - last.debt) + exitCash],
      ['Fees', -fees]
    ];

    const y1 = rows[0];
    const credit = [
      { label: 'Debt / EBITDA at entry', value: p.debtMult, fmt: 'x', ok: p.debtMult <= 6, rule: '≤ ~6x' },
      { label: 'EBITDA / interest (yr 1)', value: y1.ebitda / y1.interest, fmt: 'x', ok: y1.interest === 0 || y1.ebitda / y1.interest > 2, rule: '> 2x' },
      { label: '(EBITDA − CapEx) / interest (yr 1)', value: (y1.ebitda - y1.capex) / y1.interest, fmt: 'x', ok: y1.interest === 0 || (y1.ebitda - y1.capex) / y1.interest > 1.5, rule: '> 1.5x' },
      { label: 'Equity / total capitalization', value: equity0 / (equity0 + debt0), fmt: '%', ok: equity0 / (equity0 + debt0) > 0.4, rule: '> 40%' }
    ];

    const warnings = [];
    if (equity0 <= 0) warnings.push('Debt exceeds the purchase price plus fees: there is no equity check.');

    return { ev0, fees, debt0, equity0, rows, exitEV, exitCash, exitDebt: last.debt, exitEquity, moic, irr, bridge, credit, warnings };
  }

  // IRR for a single investment and single exit.
  function irrFromMoic(moic, years) { return Math.pow(moic, 1 / years) - 1; }

  IB.calc = { dcf, wacc, lbo, irrFromMoic };
  if (typeof module !== 'undefined') module.exports = IB.calc;
})(typeof window !== 'undefined' ? window : globalThis);
