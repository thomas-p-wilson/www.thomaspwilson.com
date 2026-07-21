// Ported from origin/2021-rework/2022's retirement calculator (identical
// math to 2019/2021, with dead-code cleanup). Life-expectancy constant and
// the retirement-trigger condition are exactly as originally shipped.

export interface RetirementInput {
  age: number;
  net: number;
  expenses: number;
  netMatchInflation: boolean;
  expensesMatchInflation: boolean;
  savings: number;
  interest: number;
  inflation: number;
  safety: number;
}

export interface RetirementProjection {
  years: number[];
  unspent: number[];
  retirement: number[];
  retirementNoInflation: number[];
  retirementYear: number | null;
  retirementNoInflationYear: number | null;
}

export function yearsUntilDeath(age: number): number {
  return Math.floor(82.3 - age);
}

export function savingsRateNumeric(net: number, expenses: number): number {
  return net - expenses;
}

export function savingsRatePercent(net: number, expenses: number): number {
  return savingsRateNumeric(net, expenses) / net;
}

export function projectRetirement(input: RetirementInput): RetirementProjection {
  let net = input.net;
  let expenses = input.expenses;
  let retired = false;
  let retiredNoInflation = false;

  const { interest, inflation } = input;
  const safety = input.safety || 0;
  const horizon = yearsUntilDeath(input.age);

  const unspent = [input.savings || 0];
  const retirement = [input.savings || 0];
  const retirementNoInflation = [input.savings || 0];
  let retirementYear: number | null = null;
  let retirementNoInflationYear: number | null = null;

  for (let i = 0; i < horizon; i++) {
    let noInflationSpent = (retirementNoInflation[i] + (net - expenses)) * (1 + interest);
    if (retiredNoInflation || (retirementNoInflation[i] > 0 && (retirementNoInflation[i] * interest - input.expenses) / retirementNoInflation[i] >= inflation + safety)) {
      retiredNoInflation = true;
      retirementNoInflationYear = retirementNoInflationYear ?? i;
      noInflationSpent = retirementNoInflation[i] + (retirementNoInflation[i] * interest - input.expenses);
    }

    net = input.netMatchInflation ? net * (1 + inflation) : net;
    expenses = input.expensesMatchInflation ? expenses * (1 + inflation) : expenses;
    const savingsRate = net - expenses;

    const nextUnspent = (unspent[i] + savingsRate) * (1 + interest);
    let spent = nextUnspent;
    const retirementInterest = retirement[i] * interest;

    if (retired || (retirement[i] > 0 && (retirementInterest - expenses) / retirement[i] >= inflation + safety)) {
      retired = true;
      retirementYear = retirementYear ?? i;
      spent = retirement[i] + (retirementInterest - expenses);
    }

    unspent.push(nextUnspent);
    retirement.push(spent);
    retirementNoInflation.push(noInflationSpent);
  }

  return {
    years: Array.from({ length: horizon + 1 }, (_, i) => i),
    unspent,
    retirement,
    retirementNoInflation,
    retirementYear,
    retirementNoInflationYear,
  };
}
