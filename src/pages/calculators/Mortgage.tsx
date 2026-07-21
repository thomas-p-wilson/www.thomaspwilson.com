import { useMemo, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateMortgageSchedule, frequencyHandlers, type MortgageFrequency } from "@/lib/mortgage";

const frequencyOptions = (Object.keys(frequencyHandlers) as MortgageFrequency[]).map((key) => ({
  value: key,
  label: frequencyHandlers[key].title,
}));

const MAX_TERM_SLOTS = 10;
const SCHEDULE_PREVIEW_ROWS = 24;

export default function Mortgage() {
  const [total, setTotal] = useState("350000");
  const [downpayment, setDownpayment] = useState("35000");
  const [amortizationYears, setAmortizationYears] = useState("25");
  const [term, setTerm] = useState("5");
  const [frequency, setFrequency] = useState<MortgageFrequency>("biWeekly");
  const [termRates, setTermRates] = useState<string[]>(["5.5"]);

  const amortization = parseFloat(amortizationYears);
  const termLength = parseFloat(term);
  const termSlotCount = Math.min(
    Math.max(1, Math.ceil((amortization || 1) / (termLength || 1))),
    MAX_TERM_SLOTS,
  );

  const updateTermRate = (index: number, value: string) => {
    setTermRates((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push(next[next.length - 1] ?? "5.5");
      next[index] = value;
      return next;
    });
  };

  const result = useMemo(() => {
    const principal = parseFloat(total) - parseFloat(downpayment);
    if (isNaN(principal) || principal <= 0 || isNaN(amortization) || isNaN(termLength) || termLength <= 0) {
      return null;
    }
    const terms = Array.from({ length: termSlotCount }, (_, i) => ({
      interest: (parseFloat(termRates[i] ?? termRates[termRates.length - 1] ?? "0") || 0) / 100,
    }));
    return calculateMortgageSchedule(terms, principal, amortization, termLength, frequency);
  }, [total, downpayment, amortization, termLength, frequency, termRates, termSlotCount]);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link to="/projects" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">Mortgage Calculator</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Full amortization schedule with payment-frequency options and support for a rate change at each renewal term.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Property & Loan</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="total">Property Value</Label>
                <Input id="total" type="number" value={total} onChange={(e: ChangeEvent<HTMLInputElement>) => setTotal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downpayment">Downpayment</Label>
                <Input id="downpayment" type="number" value={downpayment} onChange={(e: ChangeEvent<HTMLInputElement>) => setDownpayment(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amortization">Amortization Period (years)</Label>
                <Input id="amortization" type="number" value={amortizationYears} onChange={(e: ChangeEvent<HTMLInputElement>) => setAmortizationYears(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term Length (years)</Label>
                <Input id="term" type="number" value={term} onChange={(e: ChangeEvent<HTMLInputElement>) => setTerm(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="frequency">Payment Frequency</Label>
                <Select value={frequency} onValueChange={(v: string) => setFrequency(v as MortgageFrequency)}>
                  <SelectTrigger id="frequency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Term Interest Rates</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {Array.from({ length: termSlotCount }, (_, i) => (
                <div key={i} className="space-y-2">
                  <Label htmlFor={`term-rate-${i}`}>Term {i + 1} Rate (%)</Label>
                  <Input
                    id={`term-rate-${i}`}
                    type="number"
                    value={termRates[i] ?? termRates[termRates.length - 1] ?? ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateTermRate(i, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {result && (
            <>
              <Card>
                <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">${result.schedule[1]?.amount.toFixed(2) ?? "—"}</div>
                    <div className="text-sm text-slate-500">Payment Amount</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{result.years}y {result.months}m</div>
                    <div className="text-sm text-slate-500">Time to Pay Off</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">${result.cost.toFixed(0)}</div>
                    <div className="text-sm text-slate-500">Total Cost</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">${result.interest.toFixed(0)}</div>
                    <div className="text-sm text-slate-500">Total Interest</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Amortization Schedule (first {Math.min(SCHEDULE_PREVIEW_ROWS, result.paymentCount)} of {result.paymentCount} payments)</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b">
                        <th className="py-2 pr-4">#</th>
                        <th className="py-2 pr-4">Payment</th>
                        <th className="py-2 pr-4">Interest</th>
                        <th className="py-2 pr-4">Principal</th>
                        <th className="py-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.slice(1, SCHEDULE_PREVIEW_ROWS + 1).map((row, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-1.5 pr-4 text-slate-500">{i + 1}</td>
                          <td className="py-1.5 pr-4">${row.amount.toFixed(2)}</td>
                          <td className="py-1.5 pr-4">${row.interest.toFixed(2)}</td>
                          <td className="py-1.5 pr-4">${row.principal.toFixed(2)}</td>
                          <td className="py-1.5">${row.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
