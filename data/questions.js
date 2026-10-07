/*
 * Question bank for the IB Recruiting Toolkit.
 *
 * Every answer is written in our own words. Class-sourced questions are
 * based on the concepts in the SIB Fall '26 decks (Financial Analysis,
 * Valuation, Private Equity, LBO); "core" questions cover the standard
 * technical and fit questions asked in IB interviews.
 *
 * Fields: id, t (topic id), d (difficulty 1-3), s (source id),
 *         q (question), a (answer, light markdown), tip (optional)
 *
 * Answer markup: blank line = new paragraph, "- " = bullet, **bold**.
 */
window.IB = window.IB || {};

IB.TOPICS = [
  { id: 'accounting', name: 'Accounting & 3 Statements', short: 'Accounting' },
  { id: 'ev',         name: 'Enterprise & Equity Value', short: 'EV / Equity' },
  { id: 'valuation',  name: 'Valuation & Comps',         short: 'Valuation' },
  { id: 'dcf',        name: 'DCF',                       short: 'DCF' },
  { id: 'wacc',       name: 'WACC, CAPM & Beta',         short: 'WACC' },
  { id: 'lbo',        name: 'LBO',                       short: 'LBO' },
  { id: 'pe',         name: 'Private Equity Funds',      short: 'PE Funds' },
  { id: 'ma',         name: 'M&A',                       short: 'M&A' },
  { id: 'analysis',   name: 'Financial Analysis & Ratios', short: 'Ratios' },
  { id: 'fit',        name: 'Fit & Behavioral',          short: 'Fit' }
];

IB.SOURCES = {
  core: 'Core interview',
  sib3: 'SIB 3 · Financial Analysis',
  sib4: 'SIB 4 · Valuation',
  sib5: 'SIB 5 · Private Equity',
  sib6: 'SIB 6 · LBO',
  mine: 'My questions',
  private: 'Private file'
};

IB.QUESTIONS = [
  /* ───────────────────────── Accounting ───────────────────────── */
  { id: 'acc-01', t: 'accounting', d: 1, s: 'core',
    q: 'Walk me through the three financial statements.',
    a: `- **Income statement:** revenue minus expenses over a period, ending in net income.
- **Balance sheet:** a snapshot of assets, liabilities and shareholders' equity at a point in time. Assets = Liabilities + Equity.
- **Cash flow statement:** starts with net income, adjusts for non-cash items and working capital changes (operating), then adds investing and financing flows to get the net change in cash.`,
    tip: 'Keep it to ~30 seconds. They want structure, not every line item.' },

  { id: 'acc-02', t: 'accounting', d: 1, s: 'core',
    q: 'How are the three statements linked?',
    a: `- Net income from the income statement is the first line of the cash flow statement.
- Non-cash charges (D&A, SBC) are added back, and changes in balance sheet working capital accounts adjust operating cash flow.
- CapEx and D&A change PP&E; debt and equity issuance or repayment change those balance sheet lines.
- The net change in cash on the CFS flows into cash on the balance sheet, and net income (less dividends) flows into retained earnings, so the balance sheet balances.` },

  { id: 'acc-03', t: 'accounting', d: 1, s: 'core',
    q: 'If you could use only one financial statement to evaluate a company, which would you pick and why?',
    a: `The **cash flow statement**. It shows how much cash the business actually generates, which you can't fake with accrual accounting choices, and it captures CapEx, working capital needs and financing activity.

(If you can pick two, take the income statement and beginning/ending balance sheets, because you can rebuild the cash flow statement from them.)` },

  { id: 'acc-04', t: 'accounting', d: 1, s: 'core',
    q: 'Depreciation goes up by $10. Walk me through the three statements (40% tax rate).',
    a: `- **IS:** Operating income falls by $10. At 40% tax, net income falls by **$6**.
- **CFS:** Net income is down $6, but you add back the extra $10 of depreciation (non-cash), so cash from operations is **up $4**.
- **BS:** Cash +$4; PP&E −$10, so total assets −$6. On the other side, retained earnings −$6 (from net income). Both sides down $6, so it balances.`,
    tip: 'The $4 is the tax saving: depreciation × tax rate.' },

  { id: 'acc-05', t: 'accounting', d: 1, s: 'core',
    q: 'Why do we add back depreciation on the cash flow statement?',
    a: `Depreciation reduces net income but isn't a cash expense; the cash went out earlier, when the asset was bought (shown as CapEx). Adding it back reverses the non-cash charge. The only cash effect of depreciation is the tax saving it creates.` },

  { id: 'acc-06', t: 'accounting', d: 1, s: 'core',
    q: 'A company buys $10 of inventory with cash. What happens on the statements?',
    a: `- **IS:** Nothing; there is no expense until the inventory is sold (then it becomes COGS).
- **CFS:** The increase in inventory is a use of cash in operating activities: cash **−$10**.
- **BS:** Cash −$10, inventory +$10. Total assets unchanged; nothing changes on the other side.` },

  { id: 'acc-07', t: 'accounting', d: 1, s: 'core',
    q: 'Why does an increase in accounts receivable reduce cash flow?',
    a: `A/R is revenue you've recorded (so it's in net income) but haven't collected in cash yet. On the CFS you subtract the increase to remove that uncollected revenue. In general, when an operating **current asset goes up, it's a use of cash**; when a **current liability goes up, it's a source of cash**.`,
    tip: 'This is the class "zoom on change in NWC" slide: rising current assets are bad news from a cash standpoint.' },

  { id: 'acc-08', t: 'accounting', d: 2, s: 'core',
    q: 'What is net working capital, and why can negative working capital be a good sign?',
    a: `NWC = operating current assets − operating current liabilities (A/R + inventory + prepaid − A/P − accrued expenses − deferred revenue). It's the cash tied up running day-to-day operations.

Negative NWC can be good: it means customers pay you before you pay suppliers (e.g., retailers, subscription businesses, restaurants), so growth *generates* cash instead of consuming it. It's a warning sign only if it comes from being unable to pay bills.` },

  { id: 'acc-09', t: 'accounting', d: 1, s: 'core',
    q: 'What is the difference between accrual and cash accounting?',
    a: `**Accrual accounting** records revenue when earned and expenses when incurred, regardless of when cash moves. **Cash accounting** records them only when cash changes hands. Public companies use accrual accounting (required under GAAP), which is why the cash flow statement is needed to reconcile net income to actual cash.` },

  { id: 'acc-10', t: 'accounting', d: 2, s: 'core',
    q: 'A customer pays $100 upfront for a service you will deliver next year. Walk through the statements.',
    a: `- **IS:** No revenue yet; it isn't earned.
- **CFS:** The increase in deferred revenue (a liability) is a source of cash: cash **+$100** from operations.
- **BS:** Cash +$100; deferred revenue +$100 on the liability side.

When the service is delivered, revenue is recognized (net income goes up) and deferred revenue goes down; that decrease shows as a use of cash on the CFS, so there's no second cash inflow.` },

  { id: 'acc-11', t: 'accounting', d: 2, s: 'core',
    q: 'A company buys $100 of PP&E with $100 of debt. Walk through it at purchase, then after one year with 10% interest, 10-year straight-line depreciation and $10 of principal repaid (40% tax).',
    a: `**At purchase:** no IS impact. PP&E +$100, debt +$100. On the CFS, CapEx −$100 and debt issued +$100, so net cash is 0.

**After year 1:**
- **IS:** Depreciation $10 + interest $10 = pre-tax income −$20, so net income **−$12**.
- **CFS:** NI −$12, add back D&A +$10, so CFO −$2. Repay debt −$10 in financing. Net cash **−$12**.
- **BS:** Cash −$12; PP&E +$100 − $10 = +$90, so assets +$78. Debt +$100 − $10 = +$90; retained earnings −$12, so L + E +$78. Balances.` },

  { id: 'acc-12', t: 'accounting', d: 2, s: 'core',
    q: 'Walk through $10 of stock-based compensation (40% tax rate).',
    a: `- **IS:** Operating expense +$10, so net income **−$6**.
- **CFS:** NI −$6, add back $10 of SBC (non-cash), so cash **+$4**.
- **BS:** Cash +$4. Equity: retained earnings −$6 but common stock/APIC +$10 for the shares issued, so equity +$4. Balances.`,
    tip: 'Interviewers like the follow-up: SBC is non-cash but it is a real cost (it dilutes shareholders), which is why many bankers do not add it back when computing EBITDA.' },

  { id: 'acc-13', t: 'accounting', d: 1, s: 'core',
    q: 'A company pays a $10 cash dividend. What happens?',
    a: `- **IS:** Nothing; dividends are not an expense.
- **CFS:** Dividend paid −$10 in financing activities.
- **BS:** Cash −$10; retained earnings −$10.` },

  { id: 'acc-14', t: 'accounting', d: 2, s: 'core',
    q: 'What is goodwill, and when is it impaired?',
    a: `Goodwill is created in an acquisition when the purchase price exceeds the fair value of the target's identifiable net assets. It represents things like brand, customer relationships not separately valued, workforce and expected synergies.

Under US GAAP it isn't amortized; it's tested for impairment at least annually. If the business's fair value falls below its carrying value (e.g., the acquisition underperforms), goodwill is written down. That's a non-cash charge that hits the IS and reduces equity.` },

  { id: 'acc-15', t: 'accounting', d: 1, s: 'core',
    q: 'What is the difference between capitalizing and expensing a cost?',
    a: `**Expensing** puts the full cost on the income statement right away (e.g., salaries, rent). **Capitalizing** puts it on the balance sheet as an asset and spreads it over its useful life through depreciation or amortization (e.g., a factory). Costs that benefit future years get capitalized. Capitalizing boosts near-term earnings versus expensing, which is why analysts normalize for it when comparing companies.` },

  { id: 'acc-16', t: 'accounting', d: 2, s: 'core',
    q: 'What is a deferred tax liability and what typically creates one?',
    a: `A DTL arises when a company pays less tax today than its book tax expense suggests, so it owes more later. The classic cause is **accelerated depreciation for tax purposes** versus straight-line for book purposes: tax depreciation is bigger early on, so cash taxes are lower now and higher later. A DTL is a future cash outflow and is sometimes treated as debt-like.` },

  { id: 'acc-17', t: 'accounting', d: 2, s: 'core',
    q: 'In a period of rising prices, how do LIFO and FIFO compare?',
    a: `With rising prices, **LIFO** expenses the newest (most expensive) inventory first, so COGS is higher, net income is lower, taxes are lower and ending inventory is lower. **FIFO** does the opposite. LIFO is **permitted under US GAAP but prohibited under IFRS**.` },

  { id: 'acc-18', t: 'accounting', d: 2, s: 'sib3',
    q: 'What are the key differences between US GAAP and IFRS?',
    a: `- **Basis:** US GAAP is rules-based; IFRS is principles-based.
- **R&D:** US GAAP expenses all R&D; IFRS allows some development costs to be capitalized.
- **Carrying basis:** US GAAP uses historical cost less depreciation; IFRS also permits revaluing certain assets to fair value.
- **LIFO:** permitted under US GAAP, prohibited under IFRS.

US GAAP is required for US public companies; IFRS is required for listed companies in Europe and is predominant elsewhere.` },

  { id: 'acc-19', t: 'accounting', d: 1, s: 'core',
    q: 'How does an increase in accounts payable affect cash flow?',
    a: `It increases cash flow. You've recorded the expense but haven't paid the supplier yet, so the cash is still in the company. On the CFS, an increase in a current liability is added back as a source of cash.` },

  { id: 'acc-20', t: 'accounting', d: 1, s: 'core',
    q: 'How does retained earnings change from one period to the next?',
    a: `Ending retained earnings = beginning retained earnings + net income − dividends. It's the cumulative profit the company has kept rather than paid out.` },

  { id: 'acc-21', t: 'accounting', d: 2, s: 'core',
    q: 'Can a company have positive net income and still go bankrupt?',
    a: `Yes. Net income is an accrual measure, not cash. A company can be profitable on paper while cash is trapped in growing receivables or inventory, or it can face a large debt maturity it can't refinance. Companies go bankrupt when they can't pay obligations in cash, not when net income turns negative.` },

  { id: 'acc-22', t: 'accounting', d: 1, s: 'sib3',
    q: 'Which SEC filings would you look at to analyze a US company?',
    a: `- **10-K:** annual report with audited financials, MD&A and notes.
- **10-Q:** quarterly (unaudited) financials.
- **8-K:** material events (acquisitions, divestitures, change of control, restructuring).
- **S-1:** IPO registration / prospectus.
- **S-4:** registration for an M&A deal or exchange offer.
- **DEF 14A:** proxy statement for the shareholder meeting (exec comp, votes).

Annual reports are also marketing documents, so rely on the 10-K for analysis.` },

  { id: 'acc-23', t: 'accounting', d: 1, s: 'core',
    q: 'What goes in each section of the cash flow statement? Give examples.',
    a: `- **Operating:** net income, add-backs for non-cash items (D&A, SBC, impairments) and changes in operating working capital.
- **Investing:** CapEx, acquisitions, asset sales, purchases/sales of investments.
- **Financing:** issuing or repaying debt, issuing or repurchasing stock, paying dividends.` },

  { id: 'acc-24', t: 'accounting', d: 2, s: 'core',
    q: 'A company writes down $10 of PP&E (40% tax, assume the write-down is tax-deductible). Walk through it.',
    a: `- **IS:** $10 impairment expense, so net income **−$6**.
- **CFS:** NI −$6, add back the $10 non-cash write-down, so cash **+$4**.
- **BS:** Cash +$4, PP&E −$10, so assets −$6; retained earnings −$6. Balances.

It works exactly like extra depreciation.` },

  { id: 'acc-25', t: 'accounting', d: 2, s: 'core',
    q: 'A company accrues a $10 employee bonus that it will pay next year (40% tax). Walk through it.',
    a: `- **IS:** Operating expense +$10, so net income **−$6**.
- **CFS:** NI −$6, plus the $10 increase in accrued expenses (a liability, so a source of cash), so cash **+$4**.
- **BS:** Cash +$4, so assets +$4. Accrued expenses +$10 and retained earnings −$6, so L + E +$4.` },

  { id: 'acc-26', t: 'accounting', d: 1, s: 'core',
    q: 'What is EBITDA, why is it used, and what are its weaknesses?',
    a: `EBITDA = earnings before interest, taxes, depreciation and amortization (≈ operating income + D&A). It's used as a rough proxy for operating cash flow that's independent of capital structure, tax jurisdiction and depreciation policy, so it's easy to compare across companies (and it's the base for EV/EBITDA and leverage ratios).

**Weaknesses:** it ignores CapEx (a real cash cost, so capital-intensive businesses look better than they are), working capital needs, taxes and interest. It's also non-GAAP, so companies can "adjust" it aggressively.` },

  /* ─────────────────────── Enterprise & Equity Value ─────────────────────── */
  { id: 'ev-01', t: 'ev', d: 1, s: 'sib4',
    q: 'What is the difference between enterprise value and equity value?',
    a: `**Equity value** is the value of the company's shares, i.e., what belongs to common shareholders (market cap for a public company).

**Enterprise value** is the value of the core operating business to *all* capital providers. You can read it two ways:
- Right side of the balance sheet: equity + net debt (+ preferred + NCI).
- Left side: the value of the operating assets, i.e., what generates sales, EBITDA and EBIT.`,
    tip: 'The class framing: EV is the value of the "operating entity".' },

  { id: 'ev-02', t: 'ev', d: 1, s: 'core',
    q: 'What is the formula for enterprise value?',
    a: `EV = equity value + debt + preferred stock + noncontrolling interest − cash (and cash equivalents).

More generally: add claims from other investors (debt-like items such as preferred, NCI, sometimes unfunded pensions or leases) and subtract non-operating assets (cash, investments).` },

  { id: 'ev-03', t: 'ev', d: 1, s: 'core',
    q: 'Why do you subtract cash when calculating enterprise value?',
    a: `Cash is a non-operating asset: it doesn't produce the company's revenue or EBITDA. EV measures the value of the operating business only, so cash comes out. Intuitively, if you bought the whole company you'd get its cash, which effectively lowers your net purchase price.` },

  { id: 'ev-04', t: 'ev', d: 2, s: 'core',
    q: 'Why do you add noncontrolling interest to enterprise value?',
    a: `When a parent owns more than 50% of a subsidiary, it consolidates 100% of that sub's revenue and EBITDA. To keep EV consistent with the 100% EBITDA in the denominator of EV/EBITDA, you need to add back the value of the slice of the sub the parent doesn't own, which is the NCI.` },

  { id: 'ev-05', t: 'ev', d: 2, s: 'core',
    q: 'Can enterprise value be negative? Can equity value?',
    a: `**EV can be negative** if a company has more cash than its market cap plus debt, which is common for distressed companies or small companies sitting on cash.

**Market equity value can't be negative** (shares can't trade below zero). **Book equity can be negative**, for example after big losses or large buybacks and dividends financed with debt.` },

  { id: 'ev-06', t: 'ev', d: 1, s: 'core',
    q: 'A company raises $100 of debt and holds it as cash. What happens to its enterprise value and equity value?',
    a: `Neither changes. Debt +$100 and cash +$100, so net debt is unchanged and EV is unchanged. Equity value is also unchanged; nothing about the shareholders' claim changed. (If the cash is then used to buy an operating asset, EV goes up.)` },

  { id: 'ev-07', t: 'ev', d: 2, s: 'sib4',
    q: 'A company with $300 of cash, $100 of debt and $400 of equity value pays out the $300 cash as a dividend. What happens to EV, equity value and EV/EBITDA (EBITDA = $50)?',
    a: `Before: EV = 400 + 100 − 300 = **$200**, so EV/EBITDA = **4.0x**.

After: cash goes to 0 and equity value falls by $300 to $100. EV = 100 + 100 − 0 = **$200**, unchanged. EV/EBITDA is still **4.0x**.

The operating business didn't change, so EV and the multiple don't change; only the equity claim shrank.`,
    tip: 'This is the exact example from the Valuation deck.' },

  { id: 'ev-08', t: 'ev', d: 1, s: 'core',
    q: 'A company issues $100 of new shares. What happens to EV and equity value?',
    a: `Equity value +$100; cash +$100. EV = equity + debt − cash is unchanged (+100 − 100).` },

  { id: 'ev-09', t: 'ev', d: 1, s: 'sib4',
    q: 'Which metrics pair with enterprise value, and which with equity value? Why does it matter?',
    a: `Match numerator and denominator to the same group of capital providers:
- **EV** pairs with metrics *before* interest that belong to all investors: revenue, EBITDA, EBIT, unlevered FCF.
- **Equity value** pairs with metrics *after* interest that belong only to shareholders: net income (P/E), EPS, levered FCF, book value of equity.

Mixing them (e.g., EV/net income) gives a meaningless multiple that distorts with leverage.` },

  { id: 'ev-10', t: 'ev', d: 2, s: 'core',
    q: 'How do you calculate diluted shares with the treasury stock method? Example: share price $20, 10 options with a $10 strike.',
    a: `Only in-the-money options count. Assume they're exercised: 10 new shares, and the company receives 10 × $10 = $100. It uses that $100 to buy back shares at $20, which is 5 shares. Net new shares = 10 − 5 = **5**. Add these to basic shares to get diluted shares.` },

  { id: 'ev-11', t: 'ev', d: 1, s: 'sib4',
    q: 'What are the different ways to think about the value of a company\'s equity?',
    a: `- **Book value:** the accounting number on the balance sheet.
- **Market value:** what the stock market says today (share price × diluted shares).
- **Fundamental (intrinsic) value:** PV of future cash flows, e.g., from a DCF.
- **Transaction price:** what a buyer actually pays in a deal, typically including a control premium.` },

  { id: 'ev-12', t: 'ev', d: 1, s: 'core',
    q: 'Share price $50, 10M diluted shares, $100M of debt, $50M of cash. What are equity value and enterprise value?',
    a: `Equity value = $50 × 10M = **$500M**.
EV = 500 + 100 − 50 = **$550M**.` },

  { id: 'ev-13', t: 'ev', d: 2, s: 'sib4',
    q: 'A company is acquired at 15x LTM EBITDA of $20M. It has $80M of debt and $10M of cash. How much do the shareholders receive?',
    a: `EV = 15 × 20 = $300M. Equity value = EV − debt + cash = 300 − 80 + 10 = **$230M**.

Every time you apply a multiple to EBITDA or EBIT, you get an enterprise value, so you have to bridge to equity.` },

  { id: 'ev-14', t: 'ev', d: 2, s: 'core',
    q: 'Why might two companies with the same enterprise value have very different share prices?',
    a: `Share price depends on equity value per share. Two companies with the same EV can have very different net debt (equity = EV − net debt) and very different share counts. Share price alone tells you nothing about how expensive a company is; compare multiples instead.` },

  /* ───────────────────────── Valuation & Comps ───────────────────────── */
  { id: 'val-01', t: 'valuation', d: 1, s: 'sib4',
    q: 'Walk me through the main valuation methodologies.',
    a: `- **Intrinsic:** DCF, the PV of future cash flows discounted at a rate reflecting their risk.
- **Comparables:** trading comps (multiples of listed peers) and precedent transactions / M&A comps (multiples paid in past deals).
- **Affordability:** LBO analysis (what a PE buyer can pay and still hit its target IRR) and M&A affordability for strategic buyers.
- **Other:** replacement value, liquidation value, sum-of-the-parts.

Results are usually shown together on a "football field" chart to set a range.` },

  { id: 'val-02', t: 'valuation', d: 1, s: 'sib4',
    q: 'How do you pick comparable companies?',
    a: `- **Same industry**, and similar business characteristics: markets, products, customers, positioning, geography.
- **Similar operating and financial profile:** size (revenue/EBITDA), growth, margins, leverage.

In practice you start broad, then narrow down to the peers investors would actually use to benchmark the company.` },

  { id: 'val-03', t: 'valuation', d: 1, s: 'sib4',
    q: 'Walk me through a trading comps (equity comp) analysis.',
    a: `1. **Select the peer set.**
2. **Pick relevant multiples:** EV/EBITDA, EV/EBIT, P/E; EV/Sales or P/B in special cases; industry-specific ones if relevant.
3. **Gather the data:** LTM financials from SEC filings (normalized for one-offs), plus today's share price, diluted shares and net debt.
4. **Calculate the multiples** and remove outliers. Show high, low, mean and median.
5. **Apply** the range of multiples to your company's (normalized) metrics to get a value range, then bridge EV to equity value.` },

  { id: 'val-04', t: 'valuation', d: 1, s: 'sib4',
    q: 'How are precedent transactions (M&A comps) different from trading comps? Which usually gives a higher value?',
    a: `Precedents use multiples paid in past acquisitions of similar companies (filtered by industry, time period, geography and size) instead of current trading multiples. Price paid replaces market cap.

Precedents usually give a **higher value** because buyers pay a **control premium** and price in synergies. The downsides: data is often incomplete (private targets, confidential terms) and deals reflect past market conditions.` },

  { id: 'val-05', t: 'valuation', d: 1, s: 'sib4',
    q: 'What is a football field chart?',
    a: `A horizontal bar chart showing the valuation range from each methodology (precedents, trading comps, DCF standalone, DCF with synergies, LBO, 52-week trading range) on one axis. It's how bankers present a valuation: you look at where ranges overlap to settle on a defensible range rather than a single number.` },

  { id: 'val-06', t: 'valuation', d: 2, s: 'core',
    q: 'Which valuation methodology usually gives the highest value? The lowest?',
    a: `Usually **precedent transactions** are highest because of control premiums and synergies. A **DCF** can be anywhere; it's very sensitive to assumptions. An **LBO** analysis often sets a **floor**, since a PE buyer is constrained by its target IRR and debt capacity. Trading comps usually sit in the middle.

It depends on market conditions, so say "usually" and explain why.` },

  { id: 'val-07', t: 'valuation', d: 2, s: 'sib4',
    q: 'What adjustments do you make to financials before calculating multiples?',
    a: `Normalize so you compare like with like:
- **Remove non-recurring items:** restructuring charges, litigation, impairments, recall losses.
- **Accounting restatements:** capitalized expenses (e.g., IFRS development costs), stock-based comp treatment, leases.
- **Perimeter changes:** acquisitions and divestitures during the period.
- **Non-operating items:** excess cash, equity investments, idle land.
- **Off-balance-sheet items:** guarantees, contingent obligations.

Then use the same LTM period across companies.` },

  { id: 'val-08', t: 'valuation', d: 2, s: 'sib4',
    q: 'Today is September 22, 2026 and the company\'s fiscal year ends December 31. How do you calculate LTM EBIT?',
    a: `The latest available twelve months is the period ended **June 30, 2026** (Q2 is the latest 10-Q).

Gather the FY2025 10-K and the Q2 2026 10-Q (which shows the first six months of 2026 and 2025):

**LTM = FY2025 − first half 2025 + first half 2026**` },

  { id: 'val-09', t: 'valuation', d: 2, s: 'sib4',
    q: 'Give some examples of industry-specific valuation multiples.',
    a: `- **Retail:** EV/EBITDAR (adds back rent), EV/square foot.
- **Oil & gas:** EV/EBITDAX (adds back exploration expense), EV/proven reserves, EV/daily production.
- **Telecom:** EV/subscriber.
- **Hospitality and healthcare:** EV/room, EV/bed.
- **Airlines:** EV/available seat mile.
- **Consulting / law firms:** EV/partner.
- **Internet:** EV/user, EV/unique visitor.` },

  { id: 'val-10', t: 'valuation', d: 1, s: 'core',
    q: 'When would you use EV/Revenue instead of EV/EBITDA?',
    a: `When EBITDA is negative or not meaningful, which is typical for early-stage, high-growth or temporarily unprofitable companies (e.g., many software or biotech names). It's also used as a cross-check in industries where margins converge. Its weakness is that it ignores profitability entirely.` },

  { id: 'val-11', t: 'valuation', d: 1, s: 'core',
    q: 'Why do bankers often look at the median multiple rather than the mean?',
    a: `The mean gets pulled around by outliers (one company at 40x because of depressed earnings). The median is more robust. In comps you show both, plus high and low, after removing obvious outliers.` },

  { id: 'val-12', t: 'valuation', d: 2, s: 'sib4',
    q: 'Two companies in the same industry have identical after-tax EBIT forecasts. Are they worth the same?',
    a: `Not necessarily. Value depends on **free cash flow**, not just profit. If one company needs a lot more capital to produce the same profit (older factories needing heavy CapEx, big inventories, customers paying four months late), its FCFF is lower and it's worth less.

In other words, it has a lower **ROIC**: the same NOPLAT on more invested capital.`,
    tip: 'This is the Company A vs. Company B example from the Valuation deck.' },

  { id: 'val-13', t: 'valuation', d: 2, s: 'sib4',
    q: 'What are the key drivers of a company\'s value?',
    a: `- **Growth** in sales and profits.
- **ROIC** = (after-tax EBIT / sales) × (sales / invested capital), i.e., profitability × capital efficiency.
- **Reinvestment rate:** how much of its profit the company must plow back (CapEx + NWC) to grow.
- **Risk / cost of capital** (WACC).

Growth only creates value when ROIC exceeds the cost of capital.` },

  { id: 'val-14', t: 'valuation', d: 2, s: 'core',
    q: 'How would you value a company with negative earnings?',
    a: `- Use **EV/Revenue** or forward multiples (e.g., EV/next-year or two-year-forward EBITDA) once profits are expected.
- Use **operating metrics** (EV/subscriber, EV/user).
- Run a **DCF** with a longer explicit period until the company reaches steady-state margins.
- Look at **precedent transactions**.` },

  { id: 'val-15', t: 'valuation', d: 1, s: 'sib4',
    q: 'What does the P/E ratio tell you, and what are its limitations?',
    a: `P/E = share price / EPS (= market cap / net income). It's how many dollars investors pay per dollar of earnings.

**Limitations:** it's affected by capital structure (leverage and interest), tax rates and one-off items in net income, and it's meaningless with negative earnings. EV/EBITDA is cleaner for comparing companies with different leverage.` },

  { id: 'val-16', t: 'valuation', d: 2, s: 'sib4',
    q: 'When would you use price-to-book?',
    a: `P/B = market value of equity / book value of equity. It's mainly used for **banks and insurance companies**, where assets and liabilities are financial and carried near fair value, so book value is meaningful. Debt is part of operations for these firms, so EV-based multiples don't work.` },

  { id: 'val-17', t: 'valuation', d: 2, s: 'core',
    q: 'Why might a company trade at a higher multiple than its peers?',
    a: `Higher expected growth, higher margins or ROIC, more predictable or recurring revenue, a stronger competitive position, lower risk (so a lower cost of capital), or market expectations of an acquisition. It might also just be overvalued, so check whether the premium is justified by fundamentals.` },

  /* ───────────────────────────── DCF ───────────────────────────── */
  { id: 'dcf-01', t: 'dcf', d: 1, s: 'sib4',
    q: 'Walk me through a DCF.',
    a: `1. **Project free cash flow to the firm** for 5–10 years: EBIT × (1 − t) + D&A − ΔNWC − CapEx.
2. **Calculate a terminal value** at the end of the explicit period, using either perpetuity growth or an exit multiple.
3. **Discount** the FCFF and terminal value back to today at the **WACC**.
4. The sum is **enterprise value** (firm value). Bridge to **equity value** by adding cash and subtracting debt, preferred and NCI; divide by diluted shares for value per share.`,
    tip: 'Say it in under a minute. The interviewer will drill into whatever part they care about.' },

  { id: 'dcf-02', t: 'dcf', d: 1, s: 'sib3',
    q: 'How do you calculate free cash flow to the firm (unlevered FCF)?',
    a: `**FCFF = EBIT × (1 − t) + D&A − change in NWC − CapEx**

EBIT × (1 − t) is NOPLAT. It's "unlevered" because it's before interest, so it belongs to all capital providers, debt and equity.` },

  { id: 'dcf-03', t: 'dcf', d: 2, s: 'sib3',
    q: 'How do you calculate free cash flow to equity (levered FCF), and what is it discounted at?',
    a: `**FCFE = EBT × (1 − t) + D&A − ΔNWC − CapEx − net repayment of debt**

(i.e., after interest and after debt flows; new borrowing adds to FCFE.) It's the cash available to shareholders only, so it's discounted at the **cost of equity**, and the result is **equity value** directly.` },

  { id: 'dcf-04', t: 'dcf', d: 1, s: 'core',
    q: 'Why do you use WACC to discount unlevered FCF and the cost of equity to discount levered FCF?',
    a: `The discount rate must match whose cash flow it is. Unlevered FCF is available to *all* capital providers, so you use their blended required return, WACC, and get enterprise value. Levered FCF belongs only to equity holders, so you use the cost of equity and get equity value.` },

  { id: 'dcf-05', t: 'dcf', d: 1, s: 'sib4',
    q: 'How long should the explicit projection period be in a DCF?',
    a: `Typically **5 to 10 years**: long enough for the company to reach a steady state, and short enough that forecasts stay credible. Very predictable businesses (toll roads, some utilities) can justify longer periods. You stop when forecasting further gets too speculative, then use a terminal value.` },

  { id: 'dcf-06', t: 'dcf', d: 1, s: 'sib4',
    q: 'What are the two ways to calculate terminal value? What are the pros and cons of each?',
    a: `- **Perpetuity growth (Gordon growth):** TV = FCFF(n+1) / (WACC − g). It's grounded in fundamentals but very sensitive to g and WACC.
- **Exit multiple:** TV = final-year EBITDA (or EBIT) × a multiple taken from comps. It's market-based and easy to explain, but it imports today's market pricing into an intrinsic valuation.

A good practice is to cross-check: compute the growth rate implied by your exit multiple, and vice versa.` },

  { id: 'dcf-07', t: 'dcf', d: 2, s: 'sib4',
    q: 'What growth rate is reasonable for the perpetuity growth method?',
    a: `A rate at or below long-term **nominal GDP growth** (often 2–3%), and roughly inflation if you think real cash flows will be flat. A company can't grow faster than the economy forever, or it would eventually become the economy. A "no-growth" perpetuity (g = 0) is also possible.` },

  { id: 'dcf-08', t: 'dcf', d: 2, s: 'sib4',
    q: 'What share of a DCF\'s value should come from the terminal value?',
    a: `The class rule of thumb: PV(TV) shouldn't be more than about **twice the PV of the explicit-period cash flows** (≈ two-thirds of the total). If it is, the explicit period is probably too short. In practice, TV is often 60–80% of EV, which is why the TV assumptions matter so much.` },

  { id: 'dcf-09', t: 'dcf', d: 1, s: 'sib4',
    q: 'How do you get from firm value to equity value at the end of a DCF?',
    a: `Firm value (with cash already included, as in the class formula: cash₀ + PV(FCFF) + PV(TV)) **minus total debt**, including preferred stock and NCI.

Equivalently: enterprise value − debt − preferred − NCI + cash. Don't forget this step.` },

  { id: 'dcf-10', t: 'dcf', d: 1, s: 'core',
    q: 'What happens to the DCF value if WACC goes up? If the growth rate goes up?',
    a: `A **higher WACC lowers** the value: future cash flows and the terminal value are discounted more heavily. A **higher perpetuity growth rate raises** the value, since TV = FCF / (WACC − g) and the denominator shrinks. Both effects are large because they hit the terminal value.` },

  { id: 'dcf-11', t: 'dcf', d: 2, s: 'core',
    q: 'What is the mid-year convention and why use it?',
    a: `It assumes cash flows arrive in the middle of each year rather than at the end, so you discount year *t* by (1 + WACC)^(t − 0.5). That reflects reality better, since cash comes in throughout the year, and it slightly **increases** the valuation.` },

  { id: 'dcf-12', t: 'dcf', d: 2, s: 'sib4',
    q: 'Next year\'s FCFF is $100, WACC is 10% and cash flows grow 2% forever. What is the company worth?',
    a: `V = FCFF₁ / (WACC − g) = 100 / (0.10 − 0.02) = **$1,250**.

This is the perpetuity formula from the Valuation deck: V = FCFF₁ / (r − g).` },

  { id: 'dcf-13', t: 'dcf', d: 3, s: 'core',
    q: 'How do you back out the perpetuity growth rate implied by an exit-multiple terminal value?',
    a: `Set the multiple-based TV equal to the Gordon formula: TV = FCFₙ × (1 + g) / (WACC − g). Solve for g:

**g = (TV × WACC − FCFₙ) / (TV + FCFₙ)**

If the implied g is above long-run GDP growth, your exit multiple is probably too aggressive.` },

  { id: 'dcf-14', t: 'dcf', d: 2, s: 'core',
    q: 'When is a DCF not appropriate?',
    a: `When cash flows are very unpredictable or negative for a long time (early-stage startups, biotech before approval), and for **banks and insurers**, where debt and interest are part of operations, so you'd use a dividend discount model or P/B instead. It's also less meaningful for highly cyclical companies unless you normalize through the cycle.` },

  { id: 'dcf-15', t: 'dcf', d: 2, s: 'sib3',
    q: 'Why don\'t you subtract interest expense when calculating unlevered FCF?',
    a: `Because the cost of debt is already captured in the **WACC**, through the after-tax cost of debt term (1 − t)·r_d·D/V. Subtracting interest in the cash flows too would double-count it. Unlevered FCF is capital-structure-neutral by design.` },

  { id: 'dcf-16', t: 'dcf', d: 2, s: 'core',
    q: 'Which matters more in a DCF: a 10% change in revenue or a 1% change in the discount rate?',
    a: `Usually the **1% change in the discount rate**, because it hits every cash flow and especially the terminal value (WACC − g in the denominator). A 10% revenue change flows through margins into FCF but typically moves value less. The honest answer: it depends, so show it with a sensitivity table.` },

  /* ───────────────────────── WACC, CAPM & Beta ───────────────────────── */
  { id: 'wacc-01', t: 'wacc', d: 1, s: 'sib3',
    q: 'What is WACC and how do you calculate it?',
    a: `WACC is the weighted average cost of capital: the blended return required by all capital providers.

**WACC = (E/V) × r_e + (D/V) × r_d × (1 − t)**

r_e comes from CAPM, r_d is the market cost of debt (≈ YTM), and the weights should be target (market-value) weights. Debt is after-tax because interest is tax-deductible.` },

  { id: 'wacc-02', t: 'wacc', d: 1, s: 'sib3',
    q: 'How do you calculate the cost of equity?',
    a: `Using **CAPM**: r_e = r_f + β × (r_m − r_f)

- r_f: the risk-free rate (Treasury yield).
- β: the stock's sensitivity to market movements.
- (r_m − r_f): the market risk premium, measured over a long period.` },

  { id: 'wacc-03', t: 'wacc', d: 1, s: 'sib3',
    q: 'What is beta?',
    a: `Beta measures a stock's sensitivity to market movements, i.e., its **systematic (non-diversifiable) risk**. The market has β = 1. β > 1 amplifies market moves; β < 1 dampens them. A portfolio's beta is the weighted average of its holdings' betas. A stock can have high volatility but a low beta if most of its risk is company-specific.` },

  { id: 'wacc-04', t: 'wacc', d: 2, s: 'sib3',
    q: 'How do you measure a stock\'s beta?',
    a: `- **Regression** of the stock's returns against market returns; beta is the slope.
- Or directly: **β = Cov(r_M, r_S) / Var(r_M)**.

In practice you use a data provider (e.g., Bloomberg) over 2–5 years of returns.` },

  { id: 'wacc-05', t: 'wacc', d: 2, s: 'sib3',
    q: 'Why do you unlever and relever beta? What is the formula?',
    a: `A private company has no observable beta, and peers have different leverage. So you **unlever** each peer's equity beta to get its asset beta (pure business risk), take the median, then **relever** it at your company's target D/E.

Assuming β_debt = 0:
- **β_a = β_e / [1 + (1 − t) × D/E]**
- **β_e = β_a × [1 + (1 − t) × D/E]**` },

  { id: 'wacc-06', t: 'wacc', d: 3, s: 'sib3',
    q: 'A comparable has an equity beta of 1.2 and D/E of 0.5. Tax is 40%. What is the beta for your company at D/E of 1.0?',
    a: `Unlever: β_a = 1.2 / [1 + 0.6 × 0.5] = 1.2 / 1.3 = **0.923**

Relever: β_e = 0.923 × [1 + 0.6 × 1.0] = 0.923 × 1.6 = **1.48**

More leverage means more equity risk, so a higher beta.` },

  { id: 'wacc-07', t: 'wacc', d: 2, s: 'sib3',
    q: 'How do you determine the cost of debt?',
    a: `Use **market data, not the coupon**. For a healthy company, r_d ≈ the **yield to maturity** on its bonds (or a credit spread over Treasuries based on its rating).

For a distressed company, YTM is only the *promised* return. Adjust for default probability p: r_d ≈ (1 − p) × YTM (assuming zero recovery). Rating agencies help estimate p.` },

  { id: 'wacc-08', t: 'wacc', d: 1, s: 'core',
    q: 'Why is the cost of equity higher than the cost of debt?',
    a: `Equity is riskier. Debtholders get contractual interest and rank ahead of equity in bankruptcy, often with collateral. Shareholders get only the residual, with no guaranteed return. On top of that, interest is tax-deductible, so the after-tax cost of debt is even lower.` },

  { id: 'wacc-09', t: 'wacc', d: 2, s: 'sib3',
    q: 'What happens to WACC as a company adds more debt?',
    a: `At first WACC **falls**: debt is cheaper than equity and creates a tax shield. Past a point it **rises**: the probability and cost of financial distress climb, pushing up both r_d and r_e. This is the **trade-off theory**: firm value = unlevered value + PV(tax shields) − PV(costs of financial distress), which gives an optimal debt ratio.

Studies put distress costs at 10–20% of firm value.` },

  { id: 'wacc-10', t: 'wacc', d: 2, s: 'sib3',
    q: 'What is the interest tax shield and how do you value it?',
    a: `Interest is tax-deductible, so debt saves taxes of interest × t each year. Levered firm value: **V_L = V_U + PV(tax shield)**.

For permanent, constant debt D at rate r_d: annual shield = D × r_d × t, a perpetuity discounted at r_d, so **PV = D × t**.

Example: EBIT 100, interest 20, tax 40%. Net income is 48 versus NOPLAT of 60; the after-tax interest is 12, and the tax shield is 20 × 40% = **8**.` },

  { id: 'wacc-11', t: 'wacc', d: 1, s: 'sib3',
    q: 'What is the difference between systematic and idiosyncratic risk, and which one are investors paid for?',
    a: `**Idiosyncratic (specific) risk** is unique to a company and can be diversified away by holding many stocks. **Systematic (market) risk** affects all assets and can't be diversified away.

Under CAPM, investors are only compensated for **systematic risk**, measured by beta, because they could eliminate the rest for free through diversification.` },

  { id: 'wacc-12', t: 'wacc', d: 1, s: 'sib3',
    q: 'The risk-free rate is 4.5%, the expected market return is 8.5% and beta is 1.2. What is the cost of equity?',
    a: `Market risk premium = 8.5% − 4.5% = 4.0%.

r_e = 4.5% + 1.2 × 4.0% = **9.3%**` },

  { id: 'wacc-13', t: 'wacc', d: 1, s: 'core',
    q: 'Equity is 60% of capital at a 10% cost; debt is 40% at a 6% pre-tax cost; tax is 25%. What is WACC?',
    a: `WACC = 0.6 × 10% + 0.4 × 6% × (1 − 0.25) = 6.0% + 1.8% = **7.8%**` },

  { id: 'wacc-14', t: 'wacc', d: 2, s: 'sib3',
    q: 'What kinds of companies tend to have high betas?',
    a: `- **Cyclical demand:** discretionary consumer goods, airlines, semiconductors, luxury, capital goods.
- **High operating leverage:** lots of fixed costs, so profits swing more with sales.
- **High financial leverage:** more debt amplifies equity volatility.
- Growth companies whose value is concentrated far in the future.

Utilities and consumer staples tend to have low betas.` },

  { id: 'wacc-15', t: 'wacc', d: 2, s: 'sib3',
    q: 'What does the efficient frontier tell you, and what is the limit of diversification?',
    a: `The efficient frontier is the set of portfolios offering the highest expected return for each level of risk; diversification moves you toward it by cutting risk without giving up return. The limit is **market (systematic) risk**: even the fully diversified market portfolio still carries it.` },

  /* ───────────────────────────── LBO ───────────────────────────── */
  { id: 'lbo-01', t: 'lbo', d: 1, s: 'sib6',
    q: 'Walk me through an LBO.',
    a: `A PE firm buys a company using a significant amount of debt, then uses the company's cash flow to pay down that debt, and sells it after ~5 years.

1. **Sources & uses at closing:** purchase price (usually a multiple of EBITDA), refinancing of existing debt, fees; funded by debt tranches and sponsor equity.
2. **Project the cash flow** available for debt repayment each year (NI + D&A − ΔNWC − CapEx).
3. **Assume an exit multiple** (EV/EBITDA) at year 5.
4. **Terminal equity value** = exit EV − remaining debt + cash.
5. **Returns:** IRR and MOIC versus the equity invested.` },

  { id: 'lbo-02', t: 'lbo', d: 1, s: 'sib6',
    q: 'Why does using leverage increase returns in an LBO?',
    a: `Debt lets the sponsor buy the company with less equity, so any increase in value accrues to a smaller equity check. Paying down debt with the company's cash flow also transfers value from lenders to equity.

Class example: firm value grows from 100 to 300 in 5 years.
- **100% equity:** 3.0x, 24.6% IRR.
- **20% equity (80 debt):** 300 − 80 debt − 20 after-tax interest = 200 to equity on 20 invested, **10.0x, 58.5% IRR**.

The same leverage magnifies losses if things go badly.` },

  { id: 'lbo-03', t: 'lbo', d: 1, s: 'sib6',
    q: 'What makes a good LBO candidate?',
    a: `- **Steady, predictable cash flows** from a strong market position and sustainable margins.
- A more **variable** than fixed cost structure.
- A **mature, non-cyclical** market (unless you're buying at the bottom of the cycle).
- **Low CapEx and R&D** needs.
- **Hard assets** that can back debt.
- Opportunities for operational improvement and a clear exit path.

Growth is a nice-to-have, not a requirement.` },

  { id: 'lbo-04', t: 'lbo', d: 2, s: 'sib6',
    q: 'What does a typical LBO capital structure look like, and what returns does each tranche expect?',
    a: `- **Bank debt (senior / first lien):** 30–60% of sources. Floating rate, 4–8 years, restrictive covenants, amortizing. Expects 5–10%.
- **High-yield bonds:** fixed rate, bullet repayment, 7–12 years, prepayment penalties early, fewer covenants. Expects 5–10%.
- **Quasi-equity / mezzanine** (0–15%): has both debt and equity features (downside protection plus upside). Expects 12–18%.
- **Sponsor common equity:** 30–50% of sources, no downside protection. Targets 18–30%.

Uses: equity purchase price, refinancing existing debt, transaction costs.` },

  { id: 'lbo-05', t: 'lbo', d: 2, s: 'sib6',
    q: 'How can a PE sponsor increase its returns in an LBO?',
    a: `- **EBITDA growth:** grow revenue and improve margins.
- **Capital efficiency:** manage working capital better and use fixed assets and CapEx more efficiently, which frees up cash for debt paydown.
- **Multiple expansion:** exit at a higher EV/EBITDA multiple than entry.
- **Deleveraging:** pay down debt with free cash flow ("financial engineering").
- On the deal side: pay a lower purchase price, or (if all goes well) use more leverage.` },

  { id: 'lbo-06', t: 'lbo', d: 1, s: 'sib6',
    q: 'In an LBO, what happens to the IRR if the purchase price falls? If the sponsor contributes more equity?',
    a: `- **Lower purchase price → higher IRR:** the same exit proceeds on a smaller investment.
- **More equity (less debt) → lower IRR:** the gains are spread over a bigger check, though the deal is less risky.

With operating assumptions and the exit fixed, any two of {purchase price, equity at closing, IRR} determine the third.` },

  { id: 'lbo-07', t: 'lbo', d: 2, s: 'sib6',
    q: 'How do you calculate terminal equity value in an LBO? How is it different from a DCF terminal value?',
    a: `A buyer at exit values the business at an EV multiple of exit-year EBITDA, then pays the owners for their equity:

**Terminal equity value = exit EV − debt at exit + cash at exit**

It has nothing to do with a DCF terminal value. It's the actual equity proceeds at the sale, which drive the IRR (equity at exit vs. equity at closing).` },

  { id: 'lbo-08', t: 'lbo', d: 3, s: 'sib6',
    q: 'Class case: You buy Bowl Corp on 1/1/26 for 15x 2025 EBITDA of $10M, refinancing $10M of existing debt. You put in $75M of equity and fund the rest with bank debt, repaying $4M in 2026 and $0.5M more each year. You exit on 12/31/30 at 15x 2030 EBITDA of $15M with $10M of cash. What is the IRR?',
    a: `- **Purchase:** 15 × 10 = $150M. Equity $75M, so bank debt = **$75M**.
- **Repayments:** 4 + 4.5 + 5 + 5.5 + 6 = $25M, so debt at exit = **$50M**.
- **Exit EV:** 15 × 15 = **$225M**.
- **Terminal equity:** 225 − 50 + 10 = **$185M**.
- **MOIC:** 185 / 75 = **2.47x**. **IRR** = 2.47^(1/5) − 1 ≈ **19.8%**.`,
    tip: 'Load this case in the LBO calculator (Valuation → LBO → "Class case") to see the full schedule.' },

  { id: 'lbo-09', t: 'lbo', d: 2, s: 'sib6',
    q: 'What are reasonable leverage and credit ratios for an LBO?',
    a: `Rules of thumb from class:
- **Total debt / EBITDA:** around 6x (recently, half of deals were above 7x).
- **EBITDA / interest:** above 2x.
- **(EBITDA − CapEx) / interest:** above 1.5x.
- **Equity / total capitalization:** above 40%.` },

  { id: 'lbo-10', t: 'lbo', d: 2, s: 'sib6',
    q: 'From a lender\'s perspective, why is too much leverage dangerous?',
    a: `Equity is the cushion protecting lenders. Say a company is bought at 10x EBITDA:
- With 5x net debt, the equity cushion is 5x. If the multiple falls to 7x, there's still 2x of equity left.
- With 8x net debt, the cushion is only 2x. A drop to 7x **wipes out the equity**, and the lenders are now under water.

Less cushion means the company can't absorb a downturn.` },

  { id: 'lbo-11', t: 'lbo', d: 2, s: 'sib6',
    q: 'How is debt capacity determined in an LBO?',
    a: `By the cash flow the company can generate to service and repay debt: **NI + non-cash expenses (D&A) − ΔNWC − CapEx**, along with coverage constraints (EBITDA / interest, leverage multiples) that lenders require. Stable, predictable cash flow and hard assets for collateral increase debt capacity.` },

  { id: 'lbo-12', t: 'lbo', d: 2, s: 'sib6',
    q: 'How is valuation determined in an LBO?',
    a: `By **affordability**, not intrinsic value. The price must satisfy everyone at once:
- **Sellers** get the price they want.
- **Lenders** are confident the debt can be repaid.
- **The sponsor** hits its required IRR.

There's no FCFF or WACC in the LBO math itself, but the sponsor still runs comps and a DCF because the seller will.` },

  { id: 'lbo-13', t: 'lbo', d: 3, s: 'core',
    q: 'Paper LBO: Buy a company with $100M of EBITDA at 10x using 60% debt. EBITDA grows to $150M in 5 years; you exit at 10x. Cumulative FCF of $200M pays down debt. What are the MOIC and IRR?',
    a: `- **Entry:** EV $1,000M; debt $600M; equity **$400M**.
- **Exit:** EV = 10 × 150 = $1,500M. Debt = 600 − 200 = $400M. Equity = **$1,100M**.
- **MOIC** = 1,100 / 400 = **2.75x**.
- **IRR:** 2.5x in 5 years ≈ 20% and 3.0x ≈ 25%, so 2.75x ≈ **22%**.`,
    tip: 'Paper LBOs are about structure plus quick approximation. Say the steps out loud.' },

  { id: 'lbo-14', t: 'lbo', d: 1, s: 'sib5',
    q: 'What are the IRR rules of thumb for common multiples?',
    a: `- **2x in 3 years ≈ 26%**
- **2x in 5 years ≈ 15%**
- **2.5x in 5 years ≈ 20%**
- **3x in 5 years ≈ 25%**
- **3x in 3 years ≈ 44%**

Formula: IRR = MOIC^(1/years) − 1.` },

  { id: 'lbo-15', t: 'lbo', d: 2, s: 'sib5',
    q: 'Why can IRR be misleading over short holding periods?',
    a: `IRR is time-sensitive, so small gains over short periods look huge. A 1.5x return in **3 years** is a 14.5% IRR, but 1.5x in **6 months** is a **125%** IRR. That's why PE firms quote both **MOIC** (how much money) and **IRR** (how fast). LPs care about putting large amounts of capital to work, not just high percentages.` },

  { id: 'lbo-16', t: 'lbo', d: 1, s: 'sib6',
    q: 'What are the main situations in which an LBO happens?',
    a: `- Purchase of a company from a **family/founder** or a **corporation** (carve-out of a division).
- **Take-private** of a public company.
- **Leveraged recapitalization:** adding debt to pay a dividend, with no change of ownership.
- Secondary buyouts: one PE fund selling to another.` },

  { id: 'lbo-17', t: 'lbo', d: 2, s: 'sib6',
    q: 'Who are the main parties in an LBO and what does each need for the deal to close?',
    a: `- **Sellers:** the price they want (Sale and Purchase Agreement).
- **Equity sponsor:** a minimum IRR for the risk, without putting in so much equity that it hurts fund diversification.
- **Lenders:** attractive terms and collateral, without so much leverage that they're overexposed (credit agreement / bond indentures).
- **Management:** an attractive compensation package, usually equity in the company.

Secondary players: bankers, lawyers, consultants, tax experts.` },

  { id: 'lbo-18', t: 'lbo', d: 2, s: 'sib6',
    q: 'Beyond the tax shield, what are the benefits of high leverage in an LBO?',
    a: `Following Michael Jensen's argument ("Eclipse of the Public Corporation"), debt:
- Imposes **discipline**: free cash must go to debt, not pet projects.
- Forces management to **react early** to problems.
- **Motivates managers** (especially with equity ownership) and cuts bureaucracy.

In a take-private, there's also one active owner instead of thousands of passive shareholders, more long-term focus and no public-listing costs.` },

  { id: 'lbo-19', t: 'lbo', d: 2, s: 'core',
    q: 'What is a dividend recapitalization?',
    a: `The portfolio company raises new debt and uses it to pay a large dividend to the PE owner. The sponsor gets cash back early (boosting IRR and DPI) without selling the company. The cost: the company carries more debt and risk, and recaps are usually done when credit markets are hot.` },

  { id: 'lbo-20', t: 'lbo', d: 2, s: 'core',
    q: 'What are maintenance covenants and incurrence covenants?',
    a: `- **Maintenance covenants** must be met every period, e.g., debt/EBITDA below 5.0x tested quarterly. They're typical of bank loans.
- **Incurrence covenants** are only tested when the company takes a specific action (e.g., issuing more debt or paying a dividend). They're typical of high-yield bonds.

"Covenant-lite" loans have few or no maintenance covenants.` },

  { id: 'lbo-21', t: 'lbo', d: 2, s: 'sib6',
    q: 'Is LBO debt recourse to the PE fund? Why does it matter?',
    a: `No. LBO debt is raised at the portfolio company (NewCo/target) level and is **non-recourse** to the sponsor and its other investments. If one deal fails, lenders can claim the company's assets but not the fund's other portfolio companies. That limits the downside of each deal to the equity invested.` },

  { id: 'lbo-22', t: 'lbo', d: 3, s: 'sib6',
    q: 'Is interest still fully tax-deductible in a US LBO?',
    a: `Not fully. Since the 2017 Tax Cuts and Jobs Act, **Section 163(j)** caps net business interest deductions at 30% of adjusted taxable income. That reduces the tax-shield benefit for highly levered deals. The class footnote makes this point: "No longer a true statement in the US."` },

  /* ───────────────────────── Private Equity Funds ───────────────────────── */
  { id: 'pe-01', t: 'pe', d: 1, s: 'sib5',
    q: 'What is the difference between a GP and an LP?',
    a: `- **GP (general partner):** the PE firm. It raises and manages the fund, makes investment decisions, and earns management fees and carried interest. It typically commits 1–3% of the fund itself ("skin in the game").
- **LPs (limited partners):** the investors who provide most of the capital, with liability limited to their commitment.

The fund itself is a limited partnership.` },

  { id: 'pe-02', t: 'pe', d: 1, s: 'sib5',
    q: 'Who invests in private equity funds?',
    a: `Public and private **pension funds**, **endowments and foundations**, **sovereign wealth funds**, **banks and insurance companies**, **family offices / HNWIs**, **funds of funds**, and increasingly **retail** (accredited) investors.` },

  { id: 'pe-03', t: 'pe', d: 1, s: 'sib5',
    q: 'Explain "2 and 20" and the typical terms of a PE fund.',
    a: `- **Term:** 10–12 years, with a ~5-year investment period and a ~5-year harvesting period.
- **Management fee:** ~2% (1.5–2.5%) per year of **committed capital** during the investment period, then stepping down.
- **Carried interest:** 20% of the capital gains, usually after a **hurdle** (preferred return) of 6–10% (no hurdle in VC funds).` },

  { id: 'pe-04', t: 'pe', d: 1, s: 'sib5',
    q: 'What is the difference between committed and contributed capital?',
    a: `**Committed capital** is the total amount LPs promise to the fund. The GP **calls** it over time ("capital calls" / "drawdowns") as it finds investments.

**Contributed (paid-in) capital** is what's actually been called so far = investments made (at cost) + management fees paid. By the end of the fund, contributed ≈ committed if the fund fully deployed.` },

  { id: 'pe-05', t: 'pe', d: 1, s: 'sib5',
    q: 'What are AUM and dry powder?',
    a: `**Dry powder** = committed capital not yet called, money available to invest (only during the investment period).

**AUM** = dry powder + the NAV of existing investments.

Record dry powder means more competition for deals and higher purchase multiples.` },

  { id: 'pe-06', t: 'pe', d: 2, s: 'sib5',
    q: 'Walk me through a distribution waterfall with a hurdle and a GP catch-up.',
    a: `Every time there's an exit, the proceeds flow in order:
1. **Return of capital:** 100% to the LPs until their contributed capital is returned.
2. **Hurdle / preferred return:** 100% to the LPs until they've earned the hurdle (e.g., 8% IRR).
3. **GP catch-up:** 100% (or most) to the GP until the GP has received 20% of the profits distributed so far (buckets 2 + 3).
4. **Split:** 80/20 between LPs and GP thereafter.` },

  { id: 'pe-07', t: 'pe', d: 2, s: 'sib5',
    q: 'What is the difference between European-style and American-style carried interest?',
    a: `- **European (whole-fund):** the GP gets carry only after LPs have received back **all** contributed capital (plus the hurdle). It's more LP-friendly.
- **American (deal-by-deal):** carry can be paid on each realized deal once the capital for **realized** investments and all fees so far have been returned. It pays the GP earlier and needs clawback adjustments if later deals are written off.` },

  { id: 'pe-08', t: 'pe', d: 1, s: 'sib5',
    q: 'What is the J-curve?',
    a: `The shape of a PE fund's cumulative net cash flows (or returns) over time. In the early years they're **negative**: capital calls and management fees go out, and new investments are carried at cost or written down. Later they **turn positive** as portfolio companies are sold and distributions come back.` },

  { id: 'pe-09', t: 'pe', d: 2, s: 'sib5',
    q: 'What are TVPI, DPI and RVPI?',
    a: `All are net multiples of paid-in (contributed) capital, used during a fund's life:
- **DPI** = distributions to LPs / paid-in: realized, cash returned.
- **RVPI** = residual value (NAV) / paid-in: unrealized.
- **TVPI = DPI + RVPI**

Example: a TVPI of 2.1x = 1.6x DPI + 0.5x RVPI. LPs increasingly focus on DPI because it's actual cash.` },

  { id: 'pe-10', t: 'pe', d: 2, s: 'sib5',
    q: 'What is the difference between gross and net fund performance?',
    a: `- **Gross** = the fund's raw investment performance: total proceeds / invested capital.
- **Net** = what LPs actually earn after management fees **and** carried interest: (total proceeds − carry) / contributed capital.

The gap between gross and net IRR is typically several percentage points.` },

  { id: 'pe-11', t: 'pe', d: 3, s: 'sib5',
    q: 'A fund has $100M of contributed capital: $90M invested and $10M of fees. Total proceeds are $250M. With 20% European carry and no hurdle, what are the gross and net multiples?',
    a: `- **Gross multiple** = 250 / 90 = **2.78x**
- **Carry** = 20% × (250 − 100) = **$30M**
- **To LPs:** 250 − 30 = $220M, so **net multiple** = 220 / 100 = **2.2x**

Fees and carry cost the LPs ~0.6x.` },

  { id: 'pe-12', t: 'pe', d: 2, s: 'sib5',
    q: 'How are PE portfolio companies valued for NAV reporting?',
    a: `At fair value under **ASC 820**, reported quarterly to annually, not daily. Investments are typically held **at cost in the first year**. After that, LBOs are usually marked using **comps** (public trading and M&A multiples), and VC investments at the **latest financing round**. Write-downs and write-offs happen. Critics argue NAVs are currently overstated given slow exits.` },

  { id: 'pe-13', t: 'pe', d: 1, s: 'sib5',
    q: 'What are the main types of private equity strategies?',
    a: `- **Venture capital:** early-stage, minority stakes.
- **Growth capital:** minority stakes in growing, profitable companies.
- **Leveraged buyouts:** control deals funded with debt.
- **Distressed / turnaround / special situations.**
- **Funds of funds.**
- **Private credit / direct lending** (PE by extension).

Within each, firms differentiate by sector, geography and deal size.` },

  { id: 'pe-14', t: 'pe', d: 2, s: 'sib5',
    q: 'What is the PE secondary market? What is a continuation vehicle?',
    a: `- **LP-led secondaries:** an LP sells its fund stake to another investor, usually priced as a % of NAV. Sellers want liquidity or need to rebalance; buyers get mature assets at a discount with a shorter J-curve.
- **GP-led / continuation vehicle:** near the end of a fund's life, the GP moves one or more portfolio companies into a new vehicle funded by new investors. Existing LPs can cash out or roll over, and the GP keeps owning its best assets longer.` },

  { id: 'pe-15', t: 'pe', d: 3, s: 'sib5',
    q: 'What are subscription lines of credit and NAV loans?',
    a: `- **Subscription lines:** short-term loans to the fund, secured by LPs' unfunded commitments. They let the GP close deals before calling capital, which smooths capital calls and **boosts reported IRR** by shortening the time LP money is out.
- **NAV loans:** loans secured by the fund's portfolio (its NAV), used later in a fund's life to fund add-ons or make distributions without selling companies.` },

  { id: 'pe-16', t: 'pe', d: 2, s: 'sib5',
    q: 'What makes private equity attractive or unattractive to LPs?',
    a: `**Attractive:** historically strong absolute and risk-adjusted returns (buyout funds have outperformed public markets), diversification, low reported volatility, a good match for long-term liabilities.

**Unattractive:** illiquidity (capital locked up 10+ years), high fees, real risk (leverage), and returns that are not as uncorrelated with public equity as the smoothed NAVs suggest.` },

  { id: 'pe-17', t: 'pe', d: 2, s: 'sib5',
    q: 'What are the big themes in private equity right now?',
    a: `- **A slow exit environment:** a weak IPO window and buyer/seller valuation gaps mean fewer distributions and pressure on **DPI**.
- **Questions about NAV marks** (sell or hold?).
- **Rising stress in private credit** (higher defaults).
- **AI disruption**, including software ("SaaSpocalypse") and how PE firms themselves operate.
- **Mega-funds** keep growing, along with buy-and-build strategies, a push into retail investors, and continuation vehicles.
- **Rates and geopolitics** affecting financing and valuations.`,
    tip: 'Pair this with one specific recent deal you can talk about for 60 seconds.' },

  { id: 'pe-18', t: 'pe', d: 2, s: 'sib5',
    q: 'Is the 2/20 fee structure a good incentive? How could alignment be better?',
    a: `The 20% carry aligns the GP with returns, but a 2% fee on committed capital rewards **asset gathering**: large funds earn big fees regardless of performance.

Better alignment: a larger GP commitment (skin in the game), fees stepping down after the investment period or charged on invested rather than committed capital, hurdles, whole-fund (European) carry, and clawbacks.` },

  { id: 'pe-19', t: 'pe', d: 1, s: 'sib5',
    q: 'What is a co-investment?',
    a: `An LP investing directly in a specific portfolio company alongside the fund, usually with no (or reduced) management fees and carry. LPs get cheaper exposure and more control over allocation; GPs can do bigger deals without over-concentrating the fund.` },

  /* ───────────────────────────── M&A ───────────────────────────── */
  { id: 'ma-01', t: 'ma', d: 1, s: 'core',
    q: 'Why would a company acquire another company?',
    a: `- **Growth:** faster than organic growth, or entering new markets or products.
- **Synergies:** cost savings (overlapping functions) and revenue synergies (cross-selling).
- **Capabilities:** technology, talent, IP.
- **Market share** and competitive position.
- **Financial reasons:** EPS accretion, tax benefits, using excess cash.` },

  { id: 'ma-02', t: 'ma', d: 1, s: 'core',
    q: 'Walk me through an accretion/dilution analysis.',
    a: `1. Project the buyer's and target's net income.
2. Apply the deal structure: purchase price and mix of cash, debt and stock.
3. Adjust combined net income for forgone interest on cash, new interest on debt, synergies and new D&A from asset write-ups, all after tax.
4. Calculate pro forma shares (buyer's shares + new shares issued).
5. **Pro forma EPS** = combined adjusted NI / pro forma shares. Compare to the buyer's standalone EPS: higher is **accretive**, lower is **dilutive**.` },

  { id: 'ma-03', t: 'ma', d: 2, s: 'core',
    q: 'In an all-stock deal, how can you quickly tell if it will be accretive?',
    a: `Compare P/E ratios (ignoring synergies): if the **buyer's P/E is higher than the P/E it's paying** for the target, the deal is **accretive**. The buyer is "paying" with expensive currency (its stock) to buy cheaper earnings.` },

  { id: 'ma-04', t: 'ma', d: 2, s: 'core',
    q: 'How do you tell if a deal funded with cash or debt is accretive?',
    a: `Compare the **after-tax cost of funding** to the target's **earnings yield** (1 / P/E paid):
- Cash: the forgone interest rate × (1 − t).
- Debt: the interest rate × (1 − t).

If the target's earnings yield is higher than the after-tax cost of funding, the deal is accretive. Cash is usually the cheapest, then debt, then stock.` },

  { id: 'ma-05', t: 'ma', d: 2, s: 'core',
    q: 'Acquirer: net income $100, 100 shares, $20 share price. It buys a target with $10 of net income for $150, all in stock. Accretive or dilutive?',
    a: `- Buyer EPS = $1.00 (P/E 20x). Target purchase P/E = 150 / 10 = 15x.
- New shares = 150 / 20 = 7.5.
- Pro forma EPS = (100 + 10) / 107.5 = **$1.023**, so **~2.3% accretive**.

This matches the shortcut: the buyer's P/E (20x) is above the P/E paid (15x).` },

  { id: 'ma-06', t: 'ma', d: 1, s: 'core',
    q: 'What are revenue synergies and cost synergies? Which are more credible?',
    a: `**Cost synergies:** eliminating duplicate overhead, consolidating facilities, better purchasing power. **Revenue synergies:** cross-selling, new channels, pricing power.

Cost synergies are **more credible** because they're more within management's control. Revenue synergies depend on customers and are often discounted or excluded by investors.` },

  { id: 'ma-07', t: 'ma', d: 2, s: 'core',
    q: 'How is goodwill created in an acquisition?',
    a: `Purchase price − fair value of the target's identifiable net assets = **goodwill**.

Process: start with the target's book equity, write up assets to fair value (PP&E, newly identified intangibles like customer lists and brands), adjust for deferred taxes, and whatever premium remains is goodwill. Write-ups create extra D&A going forward; goodwill isn't amortized under US GAAP but is tested for impairment.` },

  { id: 'ma-08', t: 'ma', d: 2, s: 'core',
    q: 'Why would a buyer pay with stock instead of cash, or vice versa?',
    a: `**Stock:** the buyer's shares are richly valued, it lacks the cash or debt capacity, it wants the target's shareholders to share the risk and upside, or for tax reasons (stock deals can be tax-deferred for sellers).

**Cash:** it's cheaper (usually more accretive), gives certainty to sellers, and doesn't dilute existing shareholders' ownership or control. Buyers who think their stock is undervalued prefer cash.` },

  { id: 'ma-09', t: 'ma', d: 1, s: 'core',
    q: 'What is a control premium? How large is it typically?',
    a: `The amount a buyer pays above the target's unaffected share price to gain control, typically **20–40%**. It reflects the value of control (setting strategy, capturing synergies, deciding on cash flows) and the need to convince shareholders to sell.` },

  { id: 'ma-10', t: 'ma', d: 1, s: 'sib4',
    q: 'Who usually pays more for a company: a strategic buyer or a financial buyer? Why?',
    a: `Usually the **strategic buyer**, because it can realize **synergies** and has a lower cost of capital and longer horizon. A **financial buyer** (PE) is limited by **affordability**: debt capacity and its target IRR. Exceptions happen when credit markets are hot or a sponsor has a platform for add-on deals.` },

  { id: 'ma-11', t: 'ma', d: 2, s: 'core',
    q: 'Walk me through a typical sell-side M&A process.',
    a: `1. **Preparation:** valuation, a teaser, a CIM (confidential information memorandum), a buyer list.
2. **First round:** contact buyers, sign NDAs, send the CIM, receive non-binding **IOIs** (indications of interest).
3. **Second round:** management presentations, data room / due diligence, draft purchase agreement, receive binding **LOIs** / final bids.
4. **Negotiation and signing** of the definitive agreement, with a **fairness opinion** if needed.
5. **Closing:** regulatory and shareholder approvals, financing.

It can be a **broad auction** (maximizes price) or a **targeted / negotiated** sale (more confidentiality and speed).` },

  { id: 'ma-12', t: 'ma', d: 2, s: 'core',
    q: 'What is the difference between an asset purchase and a stock purchase?',
    a: `- **Stock purchase:** the buyer acquires the target's shares and inherits all assets *and* liabilities. It's simpler, and sellers often prefer it (single taxation, clean exit).
- **Asset purchase:** the buyer picks specific assets and liabilities. Buyers like it because they avoid unknown liabilities and get a **tax basis step-up** (more depreciation, lower taxes). Sellers may face double taxation.

A **338(h)(10) election** can give a stock deal the tax treatment of an asset deal.` },

  { id: 'ma-13', t: 'ma', d: 2, s: 'core',
    q: 'Is an accretive deal always a good deal?',
    a: `No. EPS accretion is an accounting result, not value creation. A deal can be accretive just because the buyer has a high P/E, or because it uses cheap debt, while overpaying relative to the target's intrinsic value. What matters is whether the **return on the investment exceeds the cost of capital** (and whether synergies are real).` },

  { id: 'ma-14', t: 'ma', d: 3, s: 'core',
    q: 'A deal is $0.10 dilutive per share. The buyer has 100M shares and a 25% tax rate. How much in pre-tax synergies would make it break even?',
    a: `Dilution = $0.10 × 100M pro forma shares = **$10M** of net income needed. Pre-tax synergies = 10 / (1 − 0.25) = **≈ $13.3M**.

(Use the pro forma share count if new shares are issued.)` },

  { id: 'ma-15', t: 'ma', d: 1, s: 'core',
    q: 'What is a fairness opinion?',
    a: `A letter from a bank to a company's board stating that the financial terms of a deal are fair to shareholders from a financial point of view, backed by a valuation analysis. It helps the board show it met its fiduciary duties.` },

  { id: 'ma-16', t: 'ma', d: 2, s: 'core',
    q: 'What is the difference between a merger and an acquisition? What about a tender offer?',
    a: `Technically, a **merger** combines two companies of similar size into one entity, while an **acquisition** is a larger company buying a smaller one; in practice the terms are used interchangeably.

A **tender offer** goes straight to the target's shareholders, offering to buy their shares at a set price. It's faster than a merger vote and is used in friendly deals and hostile bids alike.` },

  /* ────────────────────── Financial Analysis & Ratios ────────────────────── */
  { id: 'fa-01', t: 'analysis', d: 1, s: 'sib3',
    q: 'What are the main categories of financial ratios?',
    a: `- **Growth:** sales, EBITDA, EPS; organic vs. acquired; CAGR.
- **Profitability:** gross, EBITDA, EBIT and net margins.
- **Efficiency (activity):** asset turnover, working capital days.
- **Returns:** ROA, ROIC, ROE.
- **Liquidity:** current, quick and cash ratios.
- **Leverage / solvency:** D/(D+E), D/EBITDA, interest coverage.` },

  { id: 'fa-02', t: 'analysis', d: 2, s: 'sib3',
    q: 'What is ROIC and how can you break it down?',
    a: `**ROIC = NOPLAT / invested capital**, where invested capital = NWC + operating fixed assets (equivalently, debt + equity − non-operating assets).

**ROIC = (NOPLAT / sales) × (sales / invested capital)** = after-tax operating margin (profitability) × capital turnover (efficiency).

A company creates value when ROIC is above WACC.` },

  { id: 'fa-03', t: 'analysis', d: 3, s: 'sib3',
    q: 'How can you decompose ROE?',
    a: `The classic DuPont version: ROE = net margin × asset turnover × equity multiplier.

The class version separates the cost of debt:

**ROE = [NI / (NI + after-tax interest)] × [(NI + after-tax interest) / sales] × [sales / (D + E)] × [(D + E) / E]**

These are, in order: profit leakage from the cost of debt × profitability × efficiency × leverage. It shows whether ROE comes from operations or just from leverage.` },

  { id: 'fa-04', t: 'analysis', d: 2, s: 'sib3',
    q: 'What is the cash conversion cycle?',
    a: `The number of days between paying for inputs and collecting cash from customers:

**Cash cycle = inventory days + A/R days − A/P days**

A shorter (or negative) cycle means less cash tied up in operations. In the class version, all three are measured in days of sales; the common textbook version uses COGS for inventory and A/P days.` },

  { id: 'fa-05', t: 'analysis', d: 1, s: 'sib3',
    q: 'Sales are $100M and A/R is $20M. Express A/R three ways.',
    a: `- **A/R turnover:** sales / A/R = **5.0x**
- **% of sales:** A/R / sales = **20%**
- **Days of A/R:** (A/R / sales) × 360 = **72 days**` },

  { id: 'fa-06', t: 'analysis', d: 2, s: 'sib3',
    q: 'Which income statement line pairs with A/R, inventory and A/P in turnover ratios? Why?',
    a: `- **A/R ↔ sales:** receivables come from sales.
- **Inventory ↔ COGS:** inventory is carried at cost.
- **A/P ↔ COGS:** payables come from purchases, which COGS approximates.

Use beginning-of-year or average balances.` },

  { id: 'fa-07', t: 'analysis', d: 1, s: 'sib3',
    q: 'What are the main liquidity ratios?',
    a: `- **Current ratio:** current assets / current liabilities.
- **Quick (acid-test) ratio:** (cash + short-term investments + A/R) / current liabilities. It excludes inventory.
- **Cash ratio:** (cash + short-term investments) / current liabilities.
- NWC / total assets.

They measure the ability to meet short-term obligations, using end-of-year balances.` },

  { id: 'fa-08', t: 'analysis', d: 2, s: 'sib3',
    q: 'What are the main leverage and coverage ratios?',
    a: `- **Balance sheet:** D / (D + E), or more precisely D / (D + E + preferred + NCI). Also computed with net debt.
- **Cash-flow based:** D / EBITDA, D / EBIT, D / (EBITDA − CapEx).
- **Interest coverage:** EBIT / interest, EBITDA / interest, (EBITDA − CapEx) / interest.
- **Debt service coverage:** the same numerators / (interest + debt due within one year).

Debt includes all interest-bearing debt, including capital leases.` },

  { id: 'fa-09', t: 'analysis', d: 2, s: 'sib3',
    q: 'What is operating leverage, and how does it relate to the break-even point?',
    a: `Operating leverage is the share of **fixed costs** in a cost structure. With high fixed costs, a small change in sales causes a big change in operating profit (in both directions). Break-even units = fixed costs / (price − variable cost per unit). High operating leverage means a higher break-even point and more cyclicality, which is bad for LBOs.` },

  { id: 'fa-10', t: 'analysis', d: 1, s: 'sib3',
    q: 'What is NOPLAT?',
    a: `Net operating profit less adjusted taxes = **EBIT × (1 − t)**, i.e., taxes calculated as if the company had no debt. It's the operating profit available to all capital providers.

Example: EBIT 100 at 40% tax gives NOPLAT of 60. With 20 of interest, net income is 48 (= 60 − 12 after-tax interest).` },

  { id: 'fa-11', t: 'analysis', d: 2, s: 'sib3',
    q: 'What adjustments do you need when analyzing a company\'s financials over time or against peers?',
    a: `- **Perimeter changes:** acquisitions and divestitures distort growth, so look at organic growth.
- **Operating vs. non-operating items:** excess cash, real estate, equity stakes.
- **Non-recurring items:** restructuring, litigation, impairments.
- **Accounting differences:** leases, capitalized costs, SBC, GAAP vs. IFRS.
- **Off-balance-sheet items:** guarantees, hedges, off-balance-sheet financing.` },

  { id: 'fa-12', t: 'analysis', d: 1, s: 'sib3',
    q: 'What are EBITDAR and EBITDAX?',
    a: `- **EBITDAR** = EBITDA + rent expense. It's used for retailers, restaurants and airlines so companies that lease and companies that own their stores are comparable.
- **EBITDAX** = EBITDA + exploration expense. It's used in oil & gas so successful-efforts and full-cost accounting are comparable.` },

  { id: 'fa-13', t: 'analysis', d: 1, s: 'sib3',
    q: 'What is CAGR and how do you calculate it?',
    a: `Compound annual growth rate: **CAGR = (ending value / beginning value)^(1/n) − 1**.

Example: sales grow from 100 to 150 over 5 years, so CAGR = 1.5^(0.2) − 1 ≈ **8.4%**. Also separate **organic** growth from growth by acquisition.` },

  { id: 'fa-14', t: 'analysis', d: 1, s: 'sib3',
    q: 'What are the limitations of financial statement analysis?',
    a: `It's **backward-looking** and accounting-driven: important value drivers like brand, reputation, management quality, talent and expectations aren't on the statements. It needs to be combined with industry and stock analysis and the macro context. Ratios help you **ask the right questions**, not answer them.` },

  /* ─────────────────────────── Fit & Behavioral ─────────────────────────── */
  { id: 'fit-01', t: 'fit', d: 1, s: 'core',
    q: 'Walk me through your resume. (Tell me about yourself.)',
    a: `**Structure (about 2 minutes):**
- **Beginning:** where you're from and what got you interested in business and finance.
- **School:** why your major, plus your key involvement (e.g., the Seminar in Investment Banking).
- **Experiences:** each one as a step that built your interest and skills, ending with *why that led you toward IB*.
- **Now:** why you're interviewing for IB in New York, and why this bank.

Tell it as a story with transitions, not a list of bullet points. Have it memorized but conversational.`,
    tip: 'Write yours down, time it, and practice it until it sounds natural.' },

  { id: 'fit-02', t: 'fit', d: 1, s: 'core',
    q: 'Why investment banking?',
    a: `**Give 2–3 specific reasons:**
- The **learning curve**: exposure to deals, modeling and how companies make big strategic decisions, faster than almost anywhere else.
- **Deal exposure and impact**: working on transactions that change companies.
- The **people and the environment**: a team that holds a high bar, plus something specific you learned from bankers you've met.

Tie each reason to something in your background. Avoid "money" and avoid vague "fast-paced" clichés without evidence.` },

  { id: 'fit-03', t: 'fit', d: 1, s: 'core',
    q: 'Why New York?',
    a: `- It's the **center of the industry**: the most deal flow, the broadest range of groups, and the most senior bankers.
- A **personal connection or reason**: family, past experience, or a clear long-term plan to build your career there.
- Show **commitment**: that you'll stay and aren't using NY as a stepping stone.` },

  { id: 'fit-04', t: 'fit', d: 1, s: 'core',
    q: 'Why our firm?',
    a: `Be specific, so the answer couldn't be said about any bank:
- **People you've talked to** at the firm, by name, and what stood out from those conversations.
- **Recent deals** or a group the firm is known for, and why that interests you.
- **Culture or structure** (generalist program, lean deal teams, analyst responsibility) and why it fits you.`,
    tip: 'Keep a note for each firm: contacts, deals, and your "why" in 3 bullets.' },

  { id: 'fit-05', t: 'fit', d: 2, s: 'core',
    q: 'Which group are you interested in, and why?',
    a: `Know the difference between **product groups** (M&A, LevFin, ECM/DCM, Restructuring) and **industry/coverage groups** (TMT, Healthcare, Industrials, FIG, etc.).

Pick one or two, with a reason grounded in your experience or coursework (e.g., the LBO and PE sessions sparked an interest in sponsors or LevFin). Show you'd be happy in other groups too.` },

  { id: 'fit-06', t: 'fit', d: 2, s: 'core',
    q: 'What does an investment banking analyst actually do?',
    a: `- **Build models:** comps, precedents, DCF, LBO, merger models.
- **Make pitch books and presentations** for clients.
- **Run diligence:** data rooms, process logistics, coordinating with lawyers and accountants.
- **Research** companies, industries and buyers.
- Keep the deal moving: lots of checking numbers and turning comments quickly.

Show you know the hours are long and the work is detail-heavy, and that you're ready for that.` },

  { id: 'fit-07', t: 'fit', d: 1, s: 'core',
    q: 'What are your strengths and weaknesses?',
    a: `**Strengths:** 2–3 relevant ones (work ethic, attention to detail, learning quickly, teamwork), each backed by a short, concrete example.

**Weakness:** something real but not disqualifying for the job, plus the **specific steps you're taking** to fix it and evidence of progress. Avoid fake weaknesses like "I work too hard."` },

  { id: 'fit-08', t: 'fit', d: 1, s: 'core',
    q: 'Tell me about a time you worked on a team and faced a conflict or challenge.',
    a: `**Use STAR:**
- **Situation:** one sentence of context.
- **Task:** what you were responsible for.
- **Action:** what *you* specifically did (most of your time goes here).
- **Result:** the outcome, quantified if possible, and what you learned.

Prepare 4–5 stories (leadership, teamwork, failure, conflict, a time you went above and beyond) that you can adapt to different questions.` },

  { id: 'fit-09', t: 'fit', d: 2, s: 'core',
    q: 'Pitch me a stock.',
    a: `**Structure (2–3 minutes):**
1. **Recommendation:** long or short, company, current price, and price target or upside.
2. **2–3 investment theses** with numbers: why the market is mispricing it.
3. **Valuation:** e.g., trades at X× EBITDA vs. peers at Y×, or what a DCF implies.
4. **Catalysts:** what will make the market realize the value, and when.
5. **Risks** and what would make you wrong.

Pick a company you genuinely know, and expect follow-up questions.` },

  { id: 'fit-10', t: 'fit', d: 2, s: 'core',
    q: 'Tell me about a recent deal you\'ve followed.',
    a: `**Structure:**
- **What:** buyer, target, size, consideration (cash/stock), multiple paid if known.
- **Why:** strategic rationale and synergies.
- **Your view:** good deal or not? Valuation, risks (regulatory, integration, financing).
- **Who advised** (bonus points, especially if it's the bank you're interviewing with).

Prepare one M&A deal and one PE/LBO deal, and update them every few weeks.` },

  { id: 'fit-11', t: 'fit', d: 1, s: 'core',
    q: 'What is going on in the markets right now?',
    a: `Know these numbers roughly, and update them weekly:
- **Equities:** S&P 500 and Nasdaq levels and recent trend.
- **Rates:** 10-year Treasury yield, the Fed funds rate, and the latest Fed decision.
- **Macro:** inflation, jobs, GDP, and one or two big themes (AI, tariffs, geopolitics).
- **Deal markets:** M&A volume, IPO window, leveraged finance / private credit conditions.

Have one or two opinions on how these affect deal activity.`,
    tip: 'A daily markets read (e.g., WSJ, Bloomberg, or a market-brief routine) makes this easy.' },

  { id: 'fit-12', t: 'fit', d: 1, s: 'core',
    q: 'Where do you see yourself in five years?',
    a: `Show ambition and commitment to the analyst role: you want to become a strong banker, build deep technical and client skills, and take on more responsibility on deals. It's fine to say you're keeping options open (e.g., associate track, buy-side), but don't make it sound like the job is just a stepping stone.` },

  { id: 'fit-13', t: 'fit', d: 1, s: 'core',
    q: 'Why should we hire you?',
    a: `A 30-second summary of your 2–3 strongest selling points, each tied to what analysts need: **work ethic and reliability**, **technical preparation** (coursework, modeling, the SIB seminar), and **teamwork / attention to detail**, each with a proof point. End with genuine enthusiasm for the firm.` },

  { id: 'fit-14', t: 'fit', d: 1, s: 'core',
    q: 'Do you have any questions for me?',
    a: `Always have 2–3 ready. Make them about the interviewer and things you can't Google:
- "What's kept you at the firm / in this group?"
- "What separates the best analysts you've worked with?"
- "What's a recent deal you enjoyed working on, and why?"
- "How has the group's deal flow changed with the current market?"

Avoid questions about pay, hours or anything on the firm's website.` },

  { id: 'fit-15', t: 'fit', d: 2, s: 'core',
    q: 'What is the difference between investment banking, private equity, sales & trading and consulting?',
    a: `- **IB:** advises companies on transactions (M&A, raising debt or equity); it's on the **sell side** and gets paid fees on deals.
- **PE:** **buy side**; invests its own fund's capital to buy companies and earns returns from improving and selling them.
- **S&T:** buys and sells securities for clients in public markets; fast-paced and market-driven.
- **Consulting:** advises on operations and strategy, usually not transactions.

Explain why the IB work specifically fits you.` }
];
