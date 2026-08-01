import type { CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";

const paymentFrequencies: Record<string, number> = {
  annually: 1, semiannually: 2, quarterly: 4, monthly: 12, semimonthly: 24, biweekly: 26, weekly: 52, daily: 365,
};
const compoundingFrequencies: Record<string, number> = {
  annually: 1, semiannually: 2, quarterly: 4, monthly: 12, semimonthly: 24, biweekly: 26, weekly: 52, threesixty: 360, daily: 365,
};
const compoundingOptions = [
  { value: "annually", label: "Annually" }, { value: "semiannually", label: "Semiannually" },
  { value: "quarterly", label: "Quarterly" }, { value: "monthly", label: "Monthly" },
  { value: "semimonthly", label: "Semimonthly" }, { value: "biweekly", label: "Biweekly" },
  { value: "weekly", label: "Weekly" }, { value: "threesixty", label: "360-day" }, { value: "daily", label: "Daily" },
];
const frequencyOptions = compoundingOptions.filter((o) => o.value !== "threesixty");

function effectiveRate(nominal: number, compounding: string): number {
  const n = compoundingFrequencies[compounding];
  return (1 + nominal / n) ** n - 1;
}
function periodicRate(effective: number, frequency: string): number {
  return (1 + effective) ** (1 / paymentFrequencies[frequency]) - 1;
}

// Ported from origin/2020's loan-payment calculator. The original wired its
// `interest` field to receive the nominal rate/compounding frequency as if
// they were a periodic rate/payment frequency (an argument mismatch bug);
// this version derives interest from the same periodic rate used for payment,
// which is what the formula actually needs.
export const loanPayment: CalculatorSpec = {
  slug: "loan-payment",
  title: "Loan Payment",
  description: "Level payment amount, total cost, and total interest for an amortizing loan.",
  sections: [{
    title: "Loan",
    fields: [
      { id: "principal", label: "Principal", unit: "$" },
      { id: "rate", label: "Nominal Annual Rate", unit: "fraction (e.g. 0.06)" },
      { id: "amortizationPeriod", label: "Amortization Period", unit: "years" },
      { id: "frequency", label: "Payment Frequency", type: "select", options: frequencyOptions },
      { id: "compounding", label: "Compounding Frequency", type: "select", options: compoundingOptions },
      { id: "payment", label: "Payment Amount", unit: "$", readOnly: true },
      { id: "payments", label: "Total Payments", readOnly: true },
      { id: "total", label: "Total Paid", unit: "$", readOnly: true },
      { id: "interest", label: "Total Interest", unit: "$", readOnly: true },
    ],
  }],
  defaults: {
    principal: "100000", rate: "0.06", amortizationPeriod: "30", frequency: "monthly", compounding: "annually",
  },
  calculate: (values) => {
    const principal = num(values, "principal");
    const rate = num(values, "rate");
    const years = num(values, "amortizationPeriod");
    if (Number.isNaN(principal) || Number.isNaN(rate) || Number.isNaN(years) || !values.frequency || !values.compounding) return values;

    const effective = effectiveRate(rate, values.compounding);
    const periodic = periodicRate(effective, values.frequency);
    const payments = paymentFrequencies[values.frequency] * years;
    const pvFactor = (1 + periodic) ** payments;
    if (periodic === 0) return values;
    const payment = (principal * periodic) / (1 - 1 / pvFactor);
    const total = payment * payments;
    const interest = principal * pvFactor - principal;

    return {
      ...values,
      payment: payment.toFixed(2),
      payments: payments.toFixed(0),
      total: total.toFixed(2),
      interest: interest.toFixed(2),
    };
  },
};

// Ported from origin/2020's effective-interest-rate calculator.
export const effectiveInterestRate: CalculatorSpec = {
  slug: "effective-interest-rate",
  title: "Effective Interest Rate",
  description: "Convert a nominal annual rate into its effective annual rate and the periodic rate for a given payment frequency.",
  sections: [{
    title: "Rate",
    fields: [
      { id: "nominal", label: "Nominal Annual Rate", unit: "fraction (e.g. 0.06)" },
      { id: "compounding", label: "Compounding Frequency", type: "select", options: compoundingOptions },
      { id: "frequency", label: "Payment Frequency", type: "select", options: frequencyOptions },
      { id: "effective", label: "Effective Annual Rate", readOnly: true },
      { id: "periodic", label: "Periodic Rate", readOnly: true },
    ],
  }],
  defaults: { nominal: "0.06", compounding: "annually", frequency: "monthly" },
  calculate: (values) => {
    const nominal = num(values, "nominal");
    if (Number.isNaN(nominal) || !values.compounding || !values.frequency) return values;
    const effective = effectiveRate(nominal, values.compounding);
    const periodic = periodicRate(effective, values.frequency);
    return { ...values, effective: effective.toFixed(6), periodic: periodic.toFixed(6) };
  },
};
