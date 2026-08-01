// Ported from origin/2021-rework/2022's mortgage calculator (the most
// complete version across every branch it appeared in — 2019/2021 had the
// same math but a real bug: `result.schedule.push[last]` used bracket
// notation instead of a call, so the schedule's first row was silently
// dropped; 2021-rework fixed it. 2024's rewrite regressed in sophistication:
// no multi-term rate changes, no frequency comparison.

export type MortgageFrequency = "monthly" | "semiMonthly" | "biWeekly" | "acceleratedBiWeekly" | "weekly" | "acceleratedWeekly";

interface FrequencyHandler {
  title: string;
  paymentsPerYear: number;
  multiplier: number;
}

export const frequencyHandlers: Record<MortgageFrequency, FrequencyHandler> = {
  monthly: { title: "Monthly", paymentsPerYear: 12, multiplier: 1 },
  semiMonthly: { title: "Semi-Monthly (2x/month)", paymentsPerYear: 24, multiplier: 0.5 },
  biWeekly: { title: "Bi-Weekly", paymentsPerYear: 26, multiplier: 12 / 26 },
  acceleratedBiWeekly: { title: "Accelerated Bi-Weekly", paymentsPerYear: 26, multiplier: 0.5 },
  weekly: { title: "Weekly", paymentsPerYear: 52, multiplier: 12 / 52 },
  acceleratedWeekly: { title: "Accelerated Weekly", paymentsPerYear: 52, multiplier: 0.25 },
};

export interface MortgageTerm {
  interest: number;
}

export interface SchedulePayment {
  rate: number;
  amount: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface MortgageResult {
  cost: number;
  interest: number;
  principal: number;
  paymentCount: number;
  years: number;
  months: number;
  schedule: SchedulePayment[];
}

function getTermIndex(paymentIndex: number, termLengthYears: number, paymentsPerYear: number): number {
  return Math.floor((paymentIndex - 1) / (termLengthYears * paymentsPerYear)) + 1;
}

export function calculateMortgageSchedule(
  terms: MortgageTerm[],
  balance: number,
  amortizationYears: number,
  termLengthYears: number,
  frequency: MortgageFrequency,
): MortgageResult {
  const handler = frequencyHandlers[frequency];
  const monthlyPayments = amortizationYears * 12;
  const { multiplier } = handler;

  const termAmounts: Array<{ amount: number; rate: number } | undefined> = [];
  terms.forEach((term, i) => {
    if (!term) {
      termAmounts[i] = termAmounts[i - 1];
      return;
    }
    const r = term.interest / 12;
    const part = (1 + r) ** monthlyPayments;
    const amount = (balance * ((r * part) / (part - 1))) * multiplier;
    termAmounts[i] = { amount, rate: term.interest };
  });

  const schedule: SchedulePayment[] = [{ rate: 0, amount: 0, interest: 0, principal: 0, balance }];
  let last = schedule[0];
  let lastTermInfo = termAmounts[0];
  let i = 0;
  const maxIterations = handler.paymentsPerYear * 100; // safety guard the original never had

  while (last.balance > 0 && i < maxIterations) {
    const term = getTermIndex(i + 1, termLengthYears, handler.paymentsPerYear);
    if (!termAmounts[term - 1]) {
      termAmounts[term - 1] = lastTermInfo;
    }
    lastTermInfo = termAmounts[term - 1];
    if (!lastTermInfo) break;

    const { amount: paymentAmount, rate } = lastTermInfo;
    const r = rate / 12;
    const interest = last.balance * r * multiplier;
    const amount = Math.min(paymentAmount, interest + last.balance);
    const principal = amount - interest;
    const newBalance = last.balance - principal;

    last = { rate, amount, interest, principal, balance: newBalance };
    schedule.push(last);
    i++;
  }

  const paymentCount = schedule.length - 1;
  const totals = schedule.reduce(
    (acc, row) => ({ cost: acc.cost + row.amount, interest: acc.interest + row.interest, principal: acc.principal + row.principal }),
    { cost: 0, interest: 0, principal: 0 },
  );
  const years = Math.floor(paymentCount / handler.paymentsPerYear);
  const months = Math.floor((paymentCount - years * handler.paymentsPerYear) / (handler.paymentsPerYear / 12));

  return { ...totals, paymentCount, years, months, schedule };
}
