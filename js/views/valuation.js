/*
 * Valuation lab: DCF, WACC builder, LBO and quick interview math.
 * The math lives in js/calc.js; this file is inputs and presentation.
 */
window.IB = window.IB || {};
IB.views = IB.views || {};

IB.views.valuation = (function () {
  const { esc, fmt, pct, mult, num, pick } = IB.util;

  /* Inputs are kept in display units (% as 9 not 0.09) for the life of the page. */
  const S = {
    tab: 'dcf',
    dcf: { rev0: 1000, growth: 6, years: 5, margin: 20, tax: 25, daPct: 4, capexPct: 5, nwcPct: 10, wacc: 9, tvMethod: 'perp', g: 2.5, exitMult: 10, cash: 100, debt: 400, shares: 50 },
    wacc: { rf: 4.5, mrp: 4, betaE: 1.2, deComp: 0.5, tax: 25, deTarget: 0.5, rd: 6 },
    lbo: null,
    quick: { type: 'mixed', right: 0, tried: 0 }
  };
  const LBO_DEFAULT = { ebitda0: 100, entryMult: 10, feesPct: 2, debtMult: 6, rate: 8, growth: 6, years: 5, exitMult: 10, tax: 25, daPct: 20, capexPct: 20, nwcPct: 10, mode: 'sweep', repay1: 4, step: 0.5, exitCash: 10 };
  const LBO_BOWL = { ebitda0: 10, entryMult: 15, feesPct: 0, debtMult: 7.5, rate: 5, growth: +((Math.pow(1.5, 0.2) - 1) * 100).toFixed(4), years: 5, exitMult: 15, tax: 25, daPct: 10, capexPct: 5, nwcPct: 5, mode: 'schedule', repay1: 4, step: 0.5, exitCash: 10 };
  S.lbo = Object.assign({}, LBO_DEFAULT);

  const field = (group, key, label, unit, step) => {
    const v = S[group][key];
    return `<label class="field">${esc(label)}${unit ? ` <span class="muted" style="font-weight:400">(${unit})</span>` : ''}
      <input type="number" data-g="${group}" data-k="${key}" value="${v}" step="${step || 'any'}"></label>`;
  };

  const flagList = items => items.length ? `<ul class="flags">${items.map(w => `<li><span class="chip warn">!</span><span>${esc(w)}</span></li>`).join('')}</ul>` : '';

  /* ───────── DCF ───────── */
  function dcfParams() {
    const d = S.dcf;
    return {
      rev0: d.rev0, growth: d.growth / 100, years: Math.max(1, Math.min(15, Math.round(d.years))), margin: d.margin / 100,
      tax: d.tax / 100, daPct: d.daPct / 100, capexPct: d.capexPct / 100, nwcPct: d.nwcPct / 100,
      wacc: d.wacc / 100, tvMethod: d.tvMethod, g: d.g / 100, exitMult: d.exitMult, cash: d.cash, debt: d.debt, shares: d.shares
    };
  }

  function dcfInputs() {
    const d = S.dcf;
    return `<div class="card"><div class="form-grid">
      <h3>Operating assumptions</h3>
      ${field('dcf', 'rev0', 'Last-year revenue', '$')}
      ${field('dcf', 'growth', 'Revenue growth', '%/yr')}
      ${field('dcf', 'years', 'Explicit period', 'years', 1)}
      ${field('dcf', 'margin', 'EBIT margin', '%')}
      ${field('dcf', 'tax', 'Tax rate', '%')}
      ${field('dcf', 'daPct', 'D&A', '% revenue')}
      ${field('dcf', 'capexPct', 'CapEx', '% revenue')}
      ${field('dcf', 'nwcPct', 'NWC investment', '% Δ revenue')}
      <h3>Discounting &amp; terminal value</h3>
      ${field('dcf', 'wacc', 'WACC', '%')}
      <label class="field">Terminal value method
        <select data-g="dcf" data-k="tvMethod"><option value="perp" ${d.tvMethod === 'perp' ? 'selected' : ''}>Perpetuity growth</option><option value="mult" ${d.tvMethod === 'mult' ? 'selected' : ''}>Exit EV/EBITDA multiple</option></select></label>
      ${d.tvMethod === 'perp' ? field('dcf', 'g', 'Perpetuity growth', '%') : field('dcf', 'exitMult', 'Exit multiple', 'x EBITDA')}
      <h3>Bridge to equity</h3>
      ${field('dcf', 'cash', 'Cash', '$')}
      ${field('dcf', 'debt', 'Debt + pref + NCI', '$')}
      ${field('dcf', 'shares', 'Diluted shares', '#')}
    </div></div>`;
  }

  function dcfOutputs() {
    const p = dcfParams();
    const r = IB.calc.dcf(p);
    const yrs = r.rows;
    const line = (label, key, opts) => `<tr class="${(opts && opts.cls) || ''}"><td>${label}</td>${yrs.map(x => `<td>${opts && opts.dp === 3 ? x[key].toFixed(3) : fmt((opts && opts.neg ? -1 : 1) * x[key])}</td>`).join('')}</tr>`;

    const isPerp = p.tvMethod === 'perp';
    const wSteps = [-0.01, -0.005, 0, 0.005, 0.01];
    const cSteps = isPerp ? [-0.01, -0.005, 0, 0.005, 0.01] : [-2, -1, 0, 1, 2];
    const metric = p.shares > 0 ? 'perShare' : 'equity';
    const sens = wSteps.map(dw => cSteps.map(dc => {
      const q = Object.assign({}, p, { wacc: p.wacc + dw });
      if (isPerp) q.g = p.g + dc; else q.exitMult = p.exitMult + dc;
      return IB.calc.dcf(q)[metric];
    }));
    const colLabel = dc => isPerp ? pct(p.g + dc, 1) : mult(p.exitMult + dc, 1);

    return `
      <div class="card">
        <div class="kpis">
          <div class="kpi"><div class="label">Enterprise value</div><div class="value">${fmt(r.ev, 0)}</div></div>
          <div class="kpi"><div class="label">Equity value</div><div class="value">${fmt(r.equity, 0)}</div></div>
          <div class="kpi hero"><div class="label">Value per share</div><div class="value">${p.shares > 0 ? '$' + fmt(r.perShare, 2) : '–'}</div></div>
          <div class="kpi"><div class="label">TV share of EV</div><div class="value">${pct(r.tvShare, 0)}</div></div>
        </div>
        <p class="small muted" style="margin:10px 0 0">${isPerp
          ? `Implied exit multiple: <strong>${mult(r.impliedMult)}</strong> final-year EBITDA.`
          : `Implied perpetuity growth: <strong>${pct(r.impliedG, 1)}</strong>.`}
          EV = PV of FCFF ${fmt(r.sumPV, 0)} + PV of TV ${fmt(r.pvTV, 0)}. Equity = EV + cash − debt.</p>
        ${r.warnings.length ? `<div style="margin-top:10px">${flagList(r.warnings)}</div>` : ''}
      </div>
      <div class="card"><h2>Free cash flow to the firm</h2>
        <div class="table-wrap"><table class="fin">
          <thead><tr><th>Year</th>${yrs.map(x => `<th>${x.year}</th>`).join('')}</tr></thead>
          <tbody>
            ${line('Revenue', 'rev')}
            ${line('EBIT', 'ebit')}
            ${line('NOPLAT = EBIT × (1 − t)', 'nopat')}
            ${line('+ D&amp;A', 'da', { cls: 'sub' })}
            ${line('− Δ NWC', 'dnwc', { cls: 'sub', neg: true })}
            ${line('− CapEx', 'capex', { cls: 'sub', neg: true })}
            ${line('FCFF', 'fcff', { cls: 'total' })}
            ${line('Discount factor', 'df', { cls: 'sub', dp: 3 })}
            ${line('PV of FCFF', 'pv')}
          </tbody>
        </table></div>
        <p class="small muted" style="margin:8px 0 0">Terminal value at year ${p.years}: ${fmt(r.tv, 0)} = ${isPerp ? `FCFF<sub>${p.years + 1}</sub> / (WACC − g)` : `EBITDA<sub>${p.years}</sub> × ${mult(p.exitMult)}`}, discounted by (1 + WACC)<sup>${p.years}</sup>.</p>
      </div>
      <div class="card"><h2>Sensitivity: ${p.shares > 0 ? 'value per share' : 'equity value'}</h2>
        <div class="table-wrap"><table class="fin sens">
          <thead><tr><th>WACC ↓ / ${isPerp ? 'g' : 'exit multiple'} →</th>${cSteps.map(dc => `<th>${colLabel(dc)}</th>`).join('')}</tr></thead>
          <tbody>${wSteps.map((dw, i) => `<tr><th style="text-align:left">${pct(p.wacc + dw, 1)}</th>${sens[i].map((v, j) => `<td class="${dw === 0 && cSteps[j] === 0 ? 'base' : ''}">${metric === 'perShare' ? fmt(v, 2) : fmt(v, 0)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>
      </div>`;
  }

  /* ───────── WACC ───────── */
  function waccInputs() {
    return `<div class="card"><div class="form-grid">
      <h3>Cost of equity (CAPM)</h3>
      ${field('wacc', 'rf', 'Risk-free rate', '%')}
      ${field('wacc', 'mrp', 'Market risk premium', '%')}
      <h3>Beta from a comparable</h3>
      ${field('wacc', 'betaE', 'Comparable equity beta', 'β')}
      ${field('wacc', 'deComp', 'Comparable D/E', 'ratio')}
      ${field('wacc', 'tax', 'Tax rate', '%')}
      <h3>Your company</h3>
      ${field('wacc', 'deTarget', 'Target D/E', 'ratio')}
      ${field('wacc', 'rd', 'Pre-tax cost of debt', '%')}
    </div></div>`;
  }

  function waccOutputs() {
    const w = S.wacc;
    const t = w.tax / 100;
    const r = IB.calc.wacc({ rf: w.rf / 100, mrp: w.mrp / 100, betaE: w.betaE, deComp: w.deComp, tax: t, deTarget: w.deTarget, rd: w.rd / 100 });
    const f3 = v => v.toFixed(3);
    return `
      <div class="card">
        <div class="kpis">
          <div class="kpi"><div class="label">Asset beta</div><div class="value">${f3(r.betaA)}</div></div>
          <div class="kpi"><div class="label">Relevered beta</div><div class="value">${f3(r.betaL)}</div></div>
          <div class="kpi"><div class="label">Cost of equity</div><div class="value">${pct(r.re, 2)}</div></div>
          <div class="kpi hero"><div class="label">WACC</div><div class="value">${pct(r.wacc, 2)}</div></div>
        </div>
        <div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn" data-act="use-wacc">Use ${pct(r.wacc, 2)} in the DCF →</button></div>
      </div>
      <div class="card"><h2>Step by step</h2>
        <ol class="steps">
          <li><strong>Unlever</strong> the comparable: β<sub>a</sub> = β<sub>e</sub> / [1 + (1 − t) × D/E] = ${w.betaE} / [1 + ${fmt(1 - t, 2)} × ${w.deComp}] = <strong>${f3(r.betaA)}</strong></li>
          <li><strong>Relever</strong> at your target D/E: β<sub>e</sub> = ${f3(r.betaA)} × [1 + ${fmt(1 - t, 2)} × ${w.deTarget}] = <strong>${f3(r.betaL)}</strong></li>
          <li><strong>CAPM:</strong> r<sub>e</sub> = ${w.rf}% + ${f3(r.betaL)} × ${w.mrp}% = <strong>${pct(r.re, 2)}</strong></li>
          <li><strong>Weights</strong> from D/E = ${w.deTarget}: D/V = ${pct(r.dv, 1)}, E/V = ${pct(r.ev, 1)}</li>
          <li><strong>After-tax cost of debt:</strong> ${w.rd}% × (1 − ${fmt(t, 2)}) = ${pct(r.rdAfter, 2)}</li>
          <li><strong>WACC</strong> = ${pct(r.ev, 1)} × ${pct(r.re, 2)} + ${pct(r.dv, 1)} × ${pct(r.rdAfter, 2)} = <strong>${pct(r.wacc, 2)}</strong></li>
        </ol>
        <p class="small muted" style="margin:8px 0 0">Assumes β<sub>debt</sub> = 0, as in class. In practice you unlever several comparables and use the median asset beta.</p>
      </div>`;
  }

  /* ───────── LBO ───────── */
  function lboParams(over) {
    const l = Object.assign({}, S.lbo, over || {});
    return {
      ebitda0: l.ebitda0, entryMult: l.entryMult, feesPct: l.feesPct / 100, debtMult: l.debtMult, rate: l.rate / 100,
      growth: l.growth / 100, years: Math.max(1, Math.min(10, Math.round(l.years))), exitMult: l.exitMult, tax: l.tax / 100,
      daPct: l.daPct / 100, capexPct: l.capexPct / 100, nwcPct: l.nwcPct / 100, mode: l.mode,
      repay1: l.repay1, step: l.step, exitCash: l.exitCash
    };
  }

  function lboInputs() {
    const l = S.lbo;
    const sched = l.mode === 'schedule';
    return `<div class="card">
      <div class="row between" style="margin-bottom:10px">
        <div class="seg" id="lbo-mode">
          <button data-mode="sweep" class="${!sched ? 'on' : ''}">Cash sweep</button>
          <button data-mode="schedule" class="${sched ? 'on' : ''}">Fixed repayment schedule</button>
        </div>
        <div class="row">
          <button class="btn sm" data-act="lbo-default">Reset</button>
          <button class="btn sm" data-act="lbo-bowl">Class case: Bowl Corp</button>
        </div>
      </div>
      <div class="form-grid">
        <h3>Entry</h3>
        ${field('lbo', 'ebitda0', 'LTM EBITDA', '$')}
        ${field('lbo', 'entryMult', 'Entry multiple', 'x EBITDA')}
        ${field('lbo', 'debtMult', 'Debt raised', 'x EBITDA')}
        ${field('lbo', 'feesPct', 'Transaction fees', '% of EV')}
        <h3>Operations</h3>
        ${field('lbo', 'growth', 'EBITDA growth', '%/yr')}
        ${field('lbo', 'years', 'Holding period', 'years', 1)}
        ${field('lbo', 'rate', 'Interest rate', '%')}
        ${field('lbo', 'tax', 'Tax rate', '%')}
        ${field('lbo', 'daPct', 'D&A', '% EBITDA')}
        ${field('lbo', 'capexPct', 'CapEx', '% EBITDA')}
        ${field('lbo', 'nwcPct', 'NWC investment', '% Δ EBITDA')}
        <h3>${sched ? 'Debt repayment & exit' : 'Exit'}</h3>
        ${sched ? field('lbo', 'repay1', 'Year-1 repayment', '$') + field('lbo', 'step', 'Annual step-up', '$') + field('lbo', 'exitCash', 'Cash at exit', '$') : ''}
        ${field('lbo', 'exitMult', 'Exit multiple', 'x EBITDA')}
      </div>
      <p class="small muted" style="margin:10px 0 0">${sched
        ? 'Repayments follow the schedule you set, and cash at exit is taken as given (as in the class case).'
        : 'All free cash flow (NI + D&amp;A − CapEx − ΔNWC) repays debt until it is gone; then cash builds up. Interest is on the beginning-of-year balance.'}</p>
    </div>`;
  }

  function lboOutputs() {
    const p = lboParams();
    const r = IB.calc.lbo(p);
    const yrs = r.rows;
    const row = (label, key, cls, neg) => `<tr class="${cls || ''}"><td>${label}</td>${yrs.map(x => `<td>${fmt((neg ? -1 : 1) * x[key])}</td>`).join('')}</tr>`;
    const entrySteps = [-2, -1, 0, 1, 2], exitSteps = [-2, -1, 0, 1, 2];
    const sens = entrySteps.map(de => exitSteps.map(dx => {
      const q = Object.assign({}, p, { entryMult: p.entryMult + de, exitMult: p.exitMult + dx });
      return IB.calc.lbo(q).irr;
    }));
    const gain = r.exitEquity - r.equity0;

    return `
      <div class="card">
        <div class="kpis">
          <div class="kpi"><div class="label">Equity invested</div><div class="value">${fmt(r.equity0, 1)}</div></div>
          <div class="kpi"><div class="label">Equity at exit</div><div class="value">${fmt(r.exitEquity, 1)}</div></div>
          <div class="kpi"><div class="label">MOIC</div><div class="value">${mult(r.moic, 2)}</div></div>
          <div class="kpi hero"><div class="label">IRR</div><div class="value">${pct(r.irr, 1)}</div></div>
        </div>
        <p class="small muted" style="margin:10px 0 0">Terminal equity = exit EV ${fmt(r.exitEV, 1)} − debt ${fmt(r.exitDebt, 1)} + cash ${fmt(r.exitCash, 1)} = <strong>${fmt(r.exitEquity, 1)}</strong>. IRR = ${mult(r.moic, 2)}<sup>1/${p.years}</sup> − 1.</p>
        ${r.warnings.length ? `<div style="margin-top:10px">${flagList(r.warnings)}</div>` : ''}
      </div>

      <div class="grid cols-2 collapse">
        <div class="card"><h2>Sources &amp; uses</h2>
          <table class="fin"><tbody>
            <tr class="section"><td colspan="2">Uses</td></tr>
            <tr><td>Purchase enterprise value (${mult(p.entryMult)})</td><td>${fmt(r.ev0)}</td></tr>
            <tr><td>Transaction fees</td><td>${fmt(r.fees)}</td></tr>
            <tr class="total"><td>Total uses</td><td>${fmt(r.ev0 + r.fees)}</td></tr>
            <tr class="section"><td colspan="2">Sources</td></tr>
            <tr><td>Debt (${mult(p.debtMult)} EBITDA)</td><td>${fmt(r.debt0)}</td></tr>
            <tr><td>Sponsor equity</td><td>${fmt(r.equity0)}</td></tr>
            <tr class="total"><td>Total sources</td><td>${fmt(r.debt0 + r.equity0)}</td></tr>
          </tbody></table>
        </div>
        <div class="card"><h2>Credit check</h2>
          <ul class="flags">${r.credit.map(c => `<li><span class="chip ${c.ok ? 'good' : 'warn'}">${c.ok ? '✓' : '!'}</span><span>${esc(c.label)}: <strong>${c.fmt === '%' ? pct(c.value, 0) : isFinite(c.value) ? mult(c.value) : 'n/a'}</strong> <span class="muted">(rule of thumb ${c.rule})</span></span></li>`).join('')}</ul>
          <h3 style="margin-top:14px">Where the returns came from</h3>
          <table class="fin"><tbody>
            ${r.bridge.map(([l, v]) => `<tr><td>${l}</td><td class="${v >= 0 ? 'pos' : 'neg'}">${fmt(v)}</td><td class="muted">${gain ? pct(v / gain, 0) : ''}</td></tr>`).join('')}
            <tr class="total"><td>Equity gain</td><td>${fmt(gain)}</td><td></td></tr>
          </tbody></table>
        </div>
      </div>

      <div class="card"><h2>Debt schedule</h2>
        <div class="table-wrap"><table class="fin">
          <thead><tr><th>Year</th>${yrs.map(x => `<th>${x.year}</th>`).join('')}</tr></thead>
          <tbody>
            ${row('EBITDA', 'ebitda')}
            ${row('− Interest', 'interest', 'sub', true)}
            ${row('− Taxes', 'tax', 'sub', true)}
            ${row('Net income', 'ni')}
            ${row('+ D&amp;A', 'da', 'sub')}
            ${row('− CapEx', 'capex', 'sub', true)}
            ${row('− Δ NWC', 'dnwc', 'sub', true)}
            ${row('Free cash flow', 'fcf', 'total')}
            ${row('Debt repaid', 'repay')}
            ${row('Debt, end of year', 'debt', 'total')}
            ${p.mode === 'sweep' ? row('Cash, end of year', 'cash') : ''}
          </tbody>
        </table></div>
      </div>

      <div class="card"><h2>Sensitivity: IRR</h2>
        <div class="table-wrap"><table class="fin sens">
          <thead><tr><th>Entry ↓ / exit →</th>${exitSteps.map(d => `<th>${mult(p.exitMult + d)}</th>`).join('')}</tr></thead>
          <tbody>${entrySteps.map((de, i) => `<tr><th style="text-align:left">${mult(p.entryMult + de)}</th>${sens[i].map((v, j) => `<td class="${de === 0 && exitSteps[j] === 0 ? 'base' : ''}">${pct(v, 1)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>
        <p class="small muted" style="margin:8px 0 0">Debt stays at ${mult(p.debtMult)} EBITDA, so a higher entry multiple means a bigger equity check.</p>
      </div>`;
  }

  /* ───────── Quick math drill ───────── */
  const r1 = (a, b, step) => { const n = Math.round((b - a) / step); return +(a + step * Math.floor(Math.random() * (n + 1))).toFixed(4); };

  const GEN = {
    irr: { name: 'MOIC → IRR', make() {
      const m = pick([1.5, 2, 2.5, 3, 3.5, 4]), n = pick([3, 4, 5, 6, 7]);
      const ans = (Math.pow(m, 1 / n) - 1) * 100;
      return { q: `A sponsor earns ${m.toFixed(1)}x its money in ${n} years. What is the IRR (in %)?`, ans, tol: 1.5, unit: '%',
        sol: `IRR = ${m}<sup>1/${n}</sup> − 1 = <strong>${ans.toFixed(1)}%</strong>. Anchors: 2x/5y ≈ 15%, 2.5x/5y ≈ 20%, 3x/5y ≈ 25%, 2x/3y ≈ 26%. Within ±1.5 pts counts.` };
    } },
    ev: { name: 'Enterprise value', make() {
      const price = r1(10, 90, 5), shares = r1(20, 200, 10), debt = r1(100, 2000, 50), cash = r1(50, 800, 25);
      const eq = price * shares, ans = eq + debt - cash;
      return { q: `Share price $${price}, ${shares}M diluted shares, $${debt}M of debt and $${cash}M of cash. What is enterprise value ($M)?`, ans, tol: Math.max(1, ans * 0.005), unit: '$M',
        sol: `Equity value = ${price} × ${shares} = ${fmt(eq, 0)}. EV = ${fmt(eq, 0)} + ${debt} − ${cash} = <strong>${fmt(ans, 0)}</strong>.` };
    } },
    days: { name: 'Days of A/R', make() {
      const sales = r1(200, 1200, 50), pctAR = pick([0.1, 0.125, 0.15, 0.2, 0.25]), ar = sales * pctAR;
      const ans = ar / sales * 360;
      return { q: `Sales are $${sales}M and accounts receivable are $${fmt(ar, 1)}M. How many days of A/R (360-day year)?`, ans, tol: 1, unit: 'days',
        sol: `Days = A/R / sales × 360 = ${fmt(ar, 1)} / ${sales} × 360 = <strong>${ans.toFixed(0)} days</strong> (turnover ${(sales / ar).toFixed(1)}x).` };
    } },
    capm: { name: 'CAPM', make() {
      const rf = pick([3, 3.5, 4, 4.5, 5]), b = r1(0.7, 1.6, 0.1), mrp = pick([4, 5, 5.5, 6]);
      const ans = rf + b * mrp;
      return { q: `Risk-free rate ${rf}%, beta ${b.toFixed(1)}, market risk premium ${mrp}%. What is the cost of equity (%)?`, ans, tol: 0.05, unit: '%',
        sol: `r<sub>e</sub> = ${rf}% + ${b.toFixed(1)} × ${mrp}% = <strong>${ans.toFixed(2)}%</strong>.` };
    } },
    wacc: { name: 'WACC', make() {
      const e = pick([50, 60, 70, 80]), re = pick([9, 10, 11, 12]), rd = pick([5, 6, 7, 8]), t = pick([21, 25, 30, 40]);
      const ans = e / 100 * re + (100 - e) / 100 * rd * (1 - t / 100);
      return { q: `Equity is ${e}% of capital at a ${re}% cost; debt is ${100 - e}% at ${rd}% pre-tax; tax rate ${t}%. What is WACC (%)?`, ans, tol: 0.05, unit: '%',
        sol: `WACC = ${e}% × ${re}% + ${100 - e}% × ${rd}% × (1 − ${t}%) = ${(e / 100 * re).toFixed(2)}% + ${((100 - e) / 100 * rd * (1 - t / 100)).toFixed(2)}% = <strong>${ans.toFixed(2)}%</strong>.` };
    } },
    shield: { name: 'Tax shield', make() {
      const d = r1(100, 1000, 50), t = pick([20, 25, 30, 40]);
      const ans = d * t / 100;
      return { q: `A company carries $${d}M of permanent debt and has a ${t}% tax rate. What is the PV of its interest tax shield ($M)?`, ans, tol: 0.5, unit: '$M',
        sol: `For permanent debt, PV(tax shield) = D × r<sub>d</sub> × t / r<sub>d</sub> = D × t = ${d} × ${t}% = <strong>${fmt(ans, 0)}</strong>.` };
    } },
    paper: { name: 'Paper LBO', make() {
      const e0 = pick([50, 100, 200]), m = pick([8, 10, 12]), dp = pick([50, 60, 70]), grow = pick([1.3, 1.4, 1.5, 1.6]), pay = pick([0.3, 0.4, 0.5]);
      const ev0 = e0 * m, debt0 = ev0 * dp / 100, eq0 = ev0 - debt0, e1 = e0 * grow, debt1 = debt0 * (1 - pay), eq1 = e1 * m - debt1;
      const ans = eq1 / eq0;
      return { q: `Buy a company with $${e0}M of EBITDA at ${m}x using ${dp}% debt. In 5 years EBITDA is $${fmt(e1, 0)}M, you exit at ${m}x, and ${pay * 100}% of the debt has been repaid. What is the MOIC?`, ans, tol: 0.05, unit: 'x',
        sol: `Entry: EV ${fmt(ev0, 0)}, debt ${fmt(debt0, 0)}, equity ${fmt(eq0, 0)}. Exit: EV ${fmt(e1 * m, 0)} − debt ${fmt(debt1, 0)} = equity ${fmt(eq1, 0)}. MOIC = <strong>${ans.toFixed(2)}x</strong>, IRR ≈ ${((Math.pow(ans, 0.2) - 1) * 100).toFixed(0)}%.` };
    } }
  };
  let problem = null;

  function quickHtml() {
    const Q = S.quick;
    if (!problem) problem = (Q.type === 'mixed' ? GEN[pick(Object.keys(GEN))] : GEN[Q.type]).make();
    const ms = [1.5, 2, 2.5, 3, 4], ys = [3, 4, 5, 6, 7];
    return `
      <div class="card stack">
        <div class="row between">
          <label class="field" style="min-width:200px">Problem type
            <select id="q-type"><option value="mixed">Mixed</option>${Object.keys(GEN).map(k => `<option value="${k}" ${Q.type === k ? 'selected' : ''}>${GEN[k].name}</option>`).join('')}</select></label>
          <span class="chip accent num">${Q.tried ? `${Q.right}/${Q.tried} correct` : 'Mental math, no calculator'}</span>
        </div>
        <p style="font-size:1.1rem;font-weight:650;margin:0">${problem.q}</p>
        <div class="row">
          <input type="text" inputmode="decimal" id="q-ans" placeholder="Your answer (${problem.unit})" style="max-width:220px">
          <button class="btn primary" data-act="q-check">Check</button>
          <button class="btn ghost" data-act="q-next">Skip</button>
        </div>
        <div id="q-out"></div>
      </div>
      <div class="card"><h2>IRR cheat sheet</h2>
        <div class="table-wrap"><table class="fin">
          <thead><tr><th>MOIC ↓ / years →</th>${ys.map(y => `<th>${y}</th>`).join('')}</tr></thead>
          <tbody>${ms.map(m => `<tr><th style="text-align:left">${m.toFixed(1)}x</th>${ys.map(y => `<td>${pct(Math.pow(m, 1 / y) - 1, 0)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>
        <p class="small muted" style="margin:8px 0 0">IRR = MOIC<sup>1/years</sup> − 1. Memorize the 3- and 5-year columns.</p>
      </div>`;
  }

  /* ───────── Render ───────── */
  const TABS = [['dcf', 'DCF'], ['wacc', 'WACC'], ['lbo', 'LBO'], ['quick', 'Quick math']];

  return {
    render(root, params) {
      if (params.tab && TABS.some(([k]) => k === params.tab)) S.tab = params.tab;
      const el = document.createElement('div');
      root.replaceChildren(el);

      function paint(keepFocus) {
        const active = document.activeElement;
        const focusKey = keepFocus && active && active.dataset && active.dataset.k;
        const head = `<div class="page-head"><h1>Valuation lab</h1><p>Change any input; everything recalculates. Formulas follow the SIB decks.</p></div>
          <div class="seg" id="tabs" role="tablist" style="margin-bottom:16px">${TABS.map(([k, l]) => `<button role="tab" aria-selected="${S.tab === k}" data-tab="${k}" class="${S.tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
        let body = '';
        if (S.tab === 'dcf') body = dcfInputs() + '<div id="outputs">' + dcfOutputs() + '</div>';
        if (S.tab === 'wacc') body = waccInputs() + '<div id="outputs">' + waccOutputs() + '</div>';
        if (S.tab === 'lbo') body = lboInputs() + '<div id="outputs">' + lboOutputs() + '</div>';
        if (S.tab === 'quick') body = quickHtml();
        el.innerHTML = head + body;
        if (focusKey) {
          const again = el.querySelector(`[data-k="${focusKey}"]`);
          if (again) again.focus();
        }
      }

      // Recompute outputs only, so typing in an input is never interrupted.
      function refreshOutputs() {
        const out = el.querySelector('#outputs');
        if (!out) return;
        if (S.tab === 'dcf') out.innerHTML = dcfOutputs();
        if (S.tab === 'wacc') out.innerHTML = waccOutputs();
        if (S.tab === 'lbo') out.innerHTML = lboOutputs();
      }

      el.addEventListener('input', e => {
        const t = e.target;
        if (!t.dataset.g || t.tagName === 'SELECT') return;
        if (t.value === '' || !isFinite(parseFloat(t.value))) return;
        S[t.dataset.g][t.dataset.k] = num(t.value);
        refreshOutputs();
      });
      el.addEventListener('change', e => {
        const t = e.target;
        if (t.dataset.g && t.tagName === 'SELECT') { S[t.dataset.g][t.dataset.k] = t.value; paint(); }
        else if (t.dataset.g && (t.dataset.k === 'years')) paint(true);
        else if (t.id === 'q-type') { S.quick.type = t.value; problem = null; paint(); }
      });
      el.addEventListener('click', e => {
        const tab = e.target.closest('[data-tab]');
        if (tab) { S.tab = tab.dataset.tab; problem = null; history.replaceState(null, '', '#/valuation?tab=' + S.tab); paint(); return; }
        const mode = e.target.closest('#lbo-mode [data-mode]');
        if (mode) { S.lbo.mode = mode.dataset.mode; paint(); return; }
        const a = e.target.closest('[data-act]');
        if (!a) return;
        const act = a.dataset.act;
        if (act === 'lbo-default') { S.lbo = Object.assign({}, LBO_DEFAULT); paint(); }
        else if (act === 'lbo-bowl') { S.lbo = Object.assign({}, LBO_BOWL); paint(); IB.util.toast('Loaded the Bowl Corp case from SIB 6'); }
        else if (act === 'use-wacc') {
          const w = S.wacc, t = w.tax / 100;
          const r = IB.calc.wacc({ rf: w.rf / 100, mrp: w.mrp / 100, betaE: w.betaE, deComp: w.deComp, tax: t, deTarget: w.deTarget, rd: w.rd / 100 });
          S.dcf.wacc = +(r.wacc * 100).toFixed(2);
          S.dcf.tax = w.tax;
          S.tab = 'dcf';
          history.replaceState(null, '', '#/valuation?tab=dcf');
          paint();
          IB.util.toast('WACC applied to the DCF');
        } else if (act === 'q-check') checkQuick();
        else if (act === 'q-next') { problem = null; paint(); el.querySelector('#q-ans').focus(); }
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.id === 'q-ans') { e.preventDefault(); checkQuick(); }
      });

      function checkQuick() {
        const out = el.querySelector('#q-out');
        if (out.dataset.done) { problem = null; paint(); el.querySelector('#q-ans').focus(); return; }
        const raw = el.querySelector('#q-ans').value.trim();
        if (!raw) { el.querySelector('#q-ans').focus(); return; }
        const guess = num(raw.replace(/[−–]/g, '-'), NaN);
        const ok = isFinite(guess) && Math.abs(guess - problem.ans) <= problem.tol;
        S.quick.tried++;
        if (ok) S.quick.right++;
        out.dataset.done = '1';
        out.innerHTML = `<div class="verdict ${ok ? 'ok' : 'no'}">${ok ? '✓ Correct' : '✕ Not quite'}</div>
          <p style="margin:10px 0 0">${problem.sol}</p>
          <div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn primary" data-act="q-next">Next problem →</button></div>`;
        el.querySelector('.chip.accent').textContent = `${S.quick.right}/${S.quick.tried} correct`;
      }

      paint();
      return null;
    }
  };
})();
