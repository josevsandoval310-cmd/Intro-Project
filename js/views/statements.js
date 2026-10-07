/*
 * Three-statement simulator: pick a scenario, predict the impact, then see
 * every line of the income statement, cash flow statement and balance sheet.
 *
 * Each scenario returns only the lines it touches. Cash on the balance sheet
 * is derived from the cash flow statement, and the engine checks A = L + E.
 */
window.IB = window.IB || {};
IB.views = IB.views || {};

IB.views.statements = (function () {
  const { esc, signed, num, pick } = IB.util;

  // Small helpers for scenarios that flow through net income.
  const ni = (X, t, sign) => sign * (1 - t) * X;

  const SCENARIOS = [
    { id: 'dep', name: 'Depreciation increases', text: X => `Depreciation expense increases by $${X}.`,
      calc(X, t) { const n = ni(X, t, -1); return {
        is: [['Depreciation expense', X], ['Operating income (EBIT)', -X], ['Taxes', -t * X]], ni: n,
        cfo: [['Net income', n], ['Depreciation (add-back)', X]],
        assets: [['PP&E', -X]], equity: [['Retained earnings', n]],
        note: 'Depreciation is non-cash, so the only cash effect is the tax saving (depreciation × tax rate).' }; } },

    { id: 'amort', name: 'Amortization of intangibles', text: X => `The company records $${X} of amortization on acquired intangible assets (assume tax-deductible).`,
      calc(X, t) { const n = ni(X, t, -1); return {
        is: [['Amortization expense', X], ['Operating income (EBIT)', -X], ['Taxes', -t * X]], ni: n,
        cfo: [['Net income', n], ['Amortization (add-back)', X]],
        assets: [['Intangible assets', -X]], equity: [['Retained earnings', n]],
        note: 'Works exactly like depreciation, but for intangible assets.' }; } },

    { id: 'capex-cash', name: 'Buy PP&E with cash', text: X => `The company buys $${X} of equipment with cash.`,
      calc(X) { return {
        is: [], ni: 0, cfi: [['Capital expenditures', -X]],
        assets: [['PP&E', X]],
        note: 'CapEx is not an expense when incurred. It hits the income statement later, through depreciation.' }; } },

    { id: 'capex-debt', name: 'Buy PP&E with debt', text: X => `The company buys $${X} of equipment, funded entirely with new debt.`,
      calc(X) { return {
        is: [], ni: 0, cfi: [['Capital expenditures', -X]], cff: [['Debt issued', X]],
        assets: [['PP&E', X]], liab: [['Debt', X]],
        note: 'Cash goes out in investing and comes back in financing, so net cash is unchanged.' }; } },

    { id: 'inv-cash', name: 'Buy inventory with cash', text: X => `The company buys $${X} of inventory and pays cash.`,
      calc(X) { return {
        is: [], ni: 0, cfo: [['Increase in inventory', -X]],
        assets: [['Inventory', X]],
        note: 'No expense until the inventory is sold (then it becomes COGS). An increase in a current asset is a use of cash.' }; } },

    { id: 'inv-ap', name: 'Buy inventory on credit', text: X => `The company buys $${X} of inventory from a supplier on credit (accounts payable).`,
      calc(X) { return {
        is: [], ni: 0, cfo: [['Increase in inventory', -X], ['Increase in accounts payable', X]],
        assets: [['Inventory', X]], liab: [['Accounts payable', X]],
        note: 'The inventory increase (use of cash) is offset by the A/P increase (source of cash).' }; } },

    { id: 'sell-inv', name: 'Sell inventory for cash', text: X => `The company sells inventory that cost $${X} to customers for $${1.5 * X} in cash.`,
      calc(X, t) { const ebit = 0.5 * X; const n = (1 - t) * ebit; return {
        is: [['Revenue', 1.5 * X], ['Cost of goods sold', X], ['Operating income (EBIT)', ebit], ['Taxes', t * ebit]], ni: n,
        cfo: [['Net income', n], ['Decrease in inventory', X]],
        assets: [['Inventory', -X]], equity: [['Retained earnings', n]],
        note: 'COGS is non-cash here (the cash went out when the inventory was bought), so the inventory decrease is added back.' }; } },

    { id: 'rev-credit', name: 'Revenue on credit', text: X => `The company delivers $${X} of services on credit (no associated costs); the customer has not paid yet.`,
      calc(X, t) { const n = ni(X, t, 1); return {
        is: [['Revenue', X], ['Operating income (EBIT)', X], ['Taxes', t * X]], ni: n,
        cfo: [['Net income', n], ['Increase in accounts receivable', -X]],
        assets: [['Accounts receivable', X]], equity: [['Retained earnings', n]],
        note: 'Revenue is earned but not collected, so A/R reverses it on the CFS. Cash falls by the taxes owed on that revenue (assuming taxes are paid in cash).' }; } },

    { id: 'collect-ar', name: 'Collect receivables', text: X => `A customer pays $${X} of an outstanding receivable.`,
      calc(X) { return {
        is: [], ni: 0, cfo: [['Decrease in accounts receivable', X]],
        assets: [['Accounts receivable', -X]],
        note: 'The revenue was already recognized. This just converts A/R into cash.' }; } },

    { id: 'deferred', name: 'Customer prepays (deferred revenue)', text: X => `A customer pays $${X} upfront for a service you will deliver next year.`,
      calc(X) { return {
        is: [], ni: 0, cfo: [['Increase in deferred revenue', X]],
        liab: [['Deferred revenue', X]],
        note: 'Cash in today, but no revenue until the service is delivered. Deferred revenue is a liability.' }; } },

    { id: 'prepaid', name: 'Prepay an expense', text: X => `The company prepays $${X} in cash for next year's insurance.`,
      calc(X) { return {
        is: [], ni: 0, cfo: [['Increase in prepaid expenses', -X]],
        assets: [['Prepaid expenses', X]],
        note: 'The expense is recognized next year as the insurance is used up. Today it is just cash converted into a prepaid asset.' }; } },

    { id: 'accrued', name: 'Accrue a bonus (paid next year)', text: X => `The company records a $${X} employee bonus that it will pay next year.`,
      calc(X, t) { const n = ni(X, t, -1); return {
        is: [['Operating expenses', X], ['Operating income (EBIT)', -X], ['Taxes', -t * X]], ni: n,
        cfo: [['Net income', n], ['Increase in accrued expenses', X]],
        assets: [], liab: [['Accrued expenses', X]], equity: [['Retained earnings', n]],
        note: 'The expense hits now but cash has not gone out, so cash rises by the tax saving (assuming the expense is deductible this year).' }; } },

    { id: 'issue-debt', name: 'Issue debt', text: X => `The company borrows $${X}.`,
      calc(X) { return { is: [], ni: 0, cff: [['Debt issued', X]], liab: [['Debt', X]],
        note: 'Pure financing: no income statement impact until interest accrues.' }; } },

    { id: 'repay-debt', name: 'Repay debt principal', text: X => `The company repays $${X} of debt principal.`,
      calc(X) { return { is: [], ni: 0, cff: [['Debt repaid', -X]], liab: [['Debt', -X]],
        note: 'Principal repayment is not an expense, only interest is.' }; } },

    { id: 'interest', name: 'Pay interest', text: X => `The company pays $${X} of interest in cash.`,
      calc(X, t) { const n = ni(X, t, -1); return {
        is: [['Interest expense', X], ['Pre-tax income', -X], ['Taxes', -t * X]], ni: n,
        cfo: [['Net income', n]],
        equity: [['Retained earnings', n]],
        note: 'Interest is tax-deductible, so the after-tax cost is interest × (1 − t). Interest sits in operating cash flow under US GAAP.' }; } },

    { id: 'issue-stock', name: 'Issue shares', text: X => `The company issues $${X} of new common stock.`,
      calc(X) { return { is: [], ni: 0, cff: [['Stock issued', X]], equity: [['Common stock & APIC', X]],
        note: 'Cash and equity both rise. No income statement impact.' }; } },

    { id: 'buyback', name: 'Buy back shares', text: X => `The company repurchases $${X} of its own stock.`,
      calc(X) { return { is: [], ni: 0, cff: [['Share repurchases', -X]], equity: [['Treasury stock', -X]],
        note: 'Treasury stock is a contra-equity account, so equity falls.' }; } },

    { id: 'dividend', name: 'Pay a dividend', text: X => `The company pays a $${X} cash dividend.`,
      calc(X) { return { is: [], ni: 0, cff: [['Dividends paid', -X]], equity: [['Retained earnings', -X]],
        note: 'Dividends are a distribution of profit, not an expense, so they never touch the income statement.' }; } },

    { id: 'sbc', name: 'Stock-based compensation', text: X => `The company grants $${X} of stock-based compensation to employees.`,
      calc(X, t) { const n = ni(X, t, -1); return {
        is: [['Stock-based compensation', X], ['Operating income (EBIT)', -X], ['Taxes', -t * X]], ni: n,
        cfo: [['Net income', n], ['Stock-based comp (add-back)', X]],
        equity: [['Retained earnings', n], ['Common stock & APIC', X]],
        note: 'Non-cash, so it is added back, but shareholders are diluted. Equity rises by the tax saving because the shares issued offset the hit to retained earnings.' }; } },

    { id: 'ppe-writedown', name: 'Write down PP&E', text: X => `The company writes down $${X} of PP&E (assume the write-down is tax-deductible).`,
      calc(X, t) { const n = ni(X, t, -1); return {
        is: [['Asset write-down', X], ['Operating income (EBIT)', -X], ['Taxes', -t * X]], ni: n,
        cfo: [['Net income', n], ['Write-down (add-back)', X]],
        assets: [['PP&E', -X]], equity: [['Retained earnings', n]],
        note: 'Same mechanics as depreciation: a non-cash charge whose only cash effect is the tax saving.' }; } },

    { id: 'inv-writedown', name: 'Write down inventory', text: X => `The company writes down $${X} of obsolete inventory (assume tax-deductible).`,
      calc(X, t) { const n = ni(X, t, -1); return {
        is: [['Inventory write-down (in COGS)', X], ['Operating income (EBIT)', -X], ['Taxes', -t * X]], ni: n,
        cfo: [['Net income', n], ['Write-down (add-back)', X]],
        assets: [['Inventory', -X]], equity: [['Retained earnings', n]],
        note: 'Some guides show this through the change in inventory instead of a separate add-back. Either way, cash rises by the tax saving.' }; } },

    { id: 'sell-ppe', name: 'Sell PP&E at book value', text: X => `The company sells equipment with a book value of $${X} for $${X} in cash.`,
      calc(X) { return { is: [], ni: 0, cfi: [['Proceeds from asset sale', X]], assets: [['PP&E', -X]],
        note: 'No gain or loss because the price equals book value. With a gain, you would subtract it in operations (to avoid double counting) and show the full proceeds in investing.' }; } }
  ];

  const session = { tried: 0, right: 0 };
  let current = { id: 'dep', X: 10, t: 0.4 };

  function build(s, X, t) {
    const r = s.calc(X, t);
    ['is', 'cfo', 'cfi', 'cff', 'assets', 'liab', 'equity'].forEach(k => { r[k] = r[k] || []; });
    const sum = rows => rows.reduce((a, [, v]) => a + v, 0);
    r.cfoTotal = sum(r.cfo); r.cfiTotal = sum(r.cfi); r.cffTotal = sum(r.cff);
    r.cash = r.cfoTotal + r.cfiTotal + r.cffTotal;
    r.assets = [['Cash', r.cash]].concat(r.assets);
    r.totalAssets = sum(r.assets);
    r.totalLE = sum(r.liab) + sum(r.equity);
    return r;
  }

  const round2 = v => Math.round(v * 100) / 100;
  const cellCls = v => (Math.abs(v) < 1e-9 ? '' : v > 0 ? 'pos' : 'neg');
  const rowsHtml = rows => rows.map(([l, v]) => `<tr><td>${esc(l)}</td><td class="${cellCls(v)}">${signed(round2(v), 2)}</td></tr>`).join('');

  function statementsHtml(r) {
    const isRows = r.is.length
      ? rowsHtml(r.is) + `<tr class="total"><td>Net income</td><td class="${cellCls(r.ni)}">${signed(round2(r.ni), 2)}</td></tr>`
      : '<tr><td colspan="2" class="muted" style="text-align:left">No impact</td></tr>';
    const section = (title, rows, total, totalLabel) => rows.length
      ? `<tr class="section"><td colspan="2">${title}</td></tr>${rowsHtml(rows)}<tr class="sub"><td>${totalLabel}</td><td>${signed(round2(total), 2)}</td></tr>` : '';
    const balanced = Math.abs(r.totalAssets - r.totalLE) < 1e-6;
    return `<div class="statements">
      <div class="card"><h3>Income statement</h3><div class="table-wrap"><table class="fin"><tbody>${isRows}</tbody></table></div></div>
      <div class="card"><h3>Cash flow statement</h3><div class="table-wrap"><table class="fin"><tbody>
        ${section('Operating', r.cfo, r.cfoTotal, 'Cash from operations')}
        ${section('Investing', r.cfi, r.cfiTotal, 'Cash from investing')}
        ${section('Financing', r.cff, r.cffTotal, 'Cash from financing')}
        <tr class="total"><td>Net change in cash</td><td class="${cellCls(r.cash)}">${signed(round2(r.cash), 2)}</td></tr>
      </tbody></table></div></div>
      <div class="card"><h3>Balance sheet</h3><div class="table-wrap"><table class="fin"><tbody>
        <tr class="section"><td colspan="2">Assets</td></tr>${rowsHtml(r.assets)}
        <tr class="total"><td>Total assets</td><td class="${cellCls(r.totalAssets)}">${signed(round2(r.totalAssets), 2)}</td></tr>
        ${r.liab.length ? `<tr class="section"><td colspan="2">Liabilities</td></tr>${rowsHtml(r.liab)}` : ''}
        ${r.equity.length ? `<tr class="section"><td colspan="2">Equity</td></tr>${rowsHtml(r.equity)}` : ''}
        <tr class="total"><td>Total liabilities + equity</td><td class="${cellCls(r.totalLE)}">${signed(round2(r.totalLE), 2)}</td></tr>
      </tbody></table></div>
      <div class="balance-check ${balanced ? 'ok' : 'off'}" style="margin-top:10px">${balanced ? '✓ Balance sheet balances' : '✕ Does not balance'}</div></div>
    </div>`;
  }

  function walkthrough(r) {
    const f = v => signed(round2(v), 2);
    const lines = [];
    lines.push(r.is.length
      ? `<strong>Income statement:</strong> ${r.is.map(([l, v]) => `${esc(l)} ${f(v)}`).join(', ')}, so net income <strong>${f(r.ni)}</strong>.`
      : '<strong>Income statement:</strong> no impact.');
    const cfs = [].concat(r.cfo, r.cfi, r.cff).filter(([, v]) => Math.abs(v) > 1e-9);
    lines.push(`<strong>Cash flow statement:</strong> ${cfs.length ? cfs.map(([l, v]) => `${esc(l)} ${f(v)}`).join(', ') : 'no flows'}, so cash <strong>${f(r.cash)}</strong>.`);
    const le = [].concat(r.liab, r.equity);
    lines.push(`<strong>Balance sheet:</strong> ${r.assets.filter(([, v]) => Math.abs(v) > 1e-9).map(([l, v]) => `${esc(l)} ${f(v)}`).join(', ') || 'no asset change'} (assets ${f(r.totalAssets)}); ` +
      `${le.length ? le.map(([l, v]) => `${esc(l)} ${f(v)}`).join(', ') : 'no change in liabilities or equity'} (L + E ${f(r.totalLE)}).`);
    return `<ol class="steps">${lines.map(l => `<li>${l}</li>`).join('')}</ol>`;
  }

  return {
    SCENARIOS,
    build,
    render(root) {
      const el = document.createElement('div');
      root.replaceChildren(el);

      el.innerHTML = `
        <div class="page-head row between">
          <div><h1>Three-statement simulator</h1><p>Predict the impact, then check every line. This is the "walk me through" question, drilled.</p></div>
          <span class="chip accent num" id="score"></span>
        </div>
        <div class="card stack">
          <div class="grid cols-4">
            <label class="field" style="grid-column:span 2">Scenario
              <select id="sc">${SCENARIOS.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
            <label class="field">Amount ($)<input type="number" id="amt" min="1" step="1"></label>
            <label class="field">Tax rate (%)<input type="number" id="tax" min="0" max="60" step="1"></label>
          </div>
          <div class="row"><button class="btn" data-act="random">🎲 Random scenario</button></div>
          <p id="prompt" style="font-size:1.1rem;font-weight:650;margin:0"></p>
          <div class="grid cols-3">
            <label class="field">Δ Net income<input type="text" inputmode="decimal" id="p-ni" placeholder="e.g. -6"></label>
            <label class="field">Δ Cash<input type="text" inputmode="decimal" id="p-cash" placeholder="e.g. 4"></label>
            <label class="field">Δ Total assets<input type="text" inputmode="decimal" id="p-assets" placeholder="e.g. -6"></label>
          </div>
          <div class="row" style="justify-content:flex-end">
            <button class="btn ghost" data-act="show">Just show me</button>
            <button class="btn primary" data-act="check">Check</button>
          </div>
          <div id="verdicts" class="grid cols-3"></div>
        </div>
        <div id="out"></div>`;

      const $ = s => el.querySelector(s);

      function load() {
        $('#sc').value = current.id;
        $('#amt').value = current.X;
        $('#tax').value = Math.round(current.t * 100);
        const s = SCENARIOS.find(x => x.id === current.id);
        $('#prompt').textContent = s.text(current.X) + ` Tax rate ${Math.round(current.t * 100)}%.`;
        ['#p-ni', '#p-cash', '#p-assets'].forEach(k => { $(k).value = ''; });
        $('#verdicts').innerHTML = '';
        $('#out').innerHTML = '';
        $('#score').textContent = session.tried ? `${session.right}/${session.tried} correct` : '';
      }

      function reveal(checked) {
        const s = SCENARIOS.find(x => x.id === current.id);
        const r = build(s, current.X, current.t);
        if (checked) {
          const tests = [['Net income', '#p-ni', r.ni], ['Cash', '#p-cash', r.cash], ['Total assets', '#p-assets', r.totalAssets]];
          let all = true;
          $('#verdicts').innerHTML = tests.map(([label, sel, truth]) => {
            const raw = $(sel).value.trim();
            const guess = raw === '' ? NaN : num(raw.replace(/[−–]/g, '-'), NaN);
            const ok = isFinite(guess) && Math.abs(guess - round2(truth)) < 0.011;
            if (!ok) all = false;
            return `<div class="verdict ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✕'} ${label}: ${signed(round2(truth), 2)}${!ok && raw ? ` <span class="small">(you: ${esc(raw)})</span>` : ''}</div>`;
          }).join('');
          session.tried++;
          if (all) session.right++;
          $('#score').textContent = `${session.right}/${session.tried} correct`;
        }
        $('#out').innerHTML = statementsHtml(r) +
          `<div class="card" style="margin-top:12px"><h3>Walk-through</h3>${walkthrough(r)}<div class="tip"><b>Key point · </b>${esc(r.note)}</div>
           <div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn primary" data-act="random">Next scenario →</button></div></div>`;
      }

      el.addEventListener('change', e => {
        if (e.target.id === 'sc') current.id = e.target.value;
        else if (e.target.id === 'amt') current.X = Math.max(1, num(e.target.value, 10));
        else if (e.target.id === 'tax') current.t = Math.min(0.6, Math.max(0, num(e.target.value, 40) / 100));
        else return;
        load();
      });
      el.addEventListener('click', e => {
        const a = e.target.closest('[data-act]');
        if (!a) return;
        if (a.dataset.act === 'random') {
          const others = SCENARIOS.filter(s => s.id !== current.id);
          current = { id: pick(others).id, X: pick([10, 20, 50, 100]), t: pick([0.2, 0.25, 0.4]) };
          load();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (a.dataset.act === 'check') reveal(true);
        else if (a.dataset.act === 'show') reveal(false);
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.matches('#p-ni, #p-cash, #p-assets')) { e.preventDefault(); reveal(true); }
      });

      load();
      return null;
    }
  };
})();
