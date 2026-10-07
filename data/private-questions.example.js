/*
 * Template for your private question set.
 *
 * 1. Copy this file to data/private-questions.js (that name is gitignored,
 *    so it stays on your computer and is never pushed to GitHub).
 * 2. Add questions in the same format as data/questions.js.
 * 3. Reload the app. They appear in the Library under "Mine" and are
 *    scheduled like every other question.
 *
 * Topic ids: accounting, ev, valuation, dcf, wacc, lbo, pe, ma, analysis, fit
 * Difficulty (d): 1 = basic, 2 = intermediate, 3 = advanced
 * Answers: blank line = paragraph, "- " = bullet, **bold**.
 * Give each question a stable, unique id so your progress sticks to it.
 */
window.IB = window.IB || {};
IB.PRIVATE_QUESTIONS = [
  {
    id: 'p-acc-001',
    t: 'accounting',
    d: 1,
    q: 'Your question here?',
    a: `Your answer in your own words.

- A bullet point
- Another one`
  }
];
