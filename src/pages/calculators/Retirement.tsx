import { useMemo, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { projectRetirement, savingsRatePercent } from "@/lib/retirement";

export default function Retirement() {
  const [age, setAge] = useState("20");
  const [net, setNet] = useState("36000");
  const [expenses, setExpenses] = useState("25000");
  const [netMatchInflation, setNetMatchInflation] = useState(false);
  const [expensesMatchInflation, setExpensesMatchInflation] = useState(false);
  const [savings, setSavings] = useState("0");
  const [interest, setInterest] = useState("0.05");
  const [inflation, setInflation] = useState("0.032");
  const [safety, setSafety] = useState("0");

  const projection = useMemo(() => {
    const parsed = {
      age: parseFloat(age), net: parseFloat(net), expenses: parseFloat(expenses),
      netMatchInflation, expensesMatchInflation,
      savings: parseFloat(savings), interest: parseFloat(interest), inflation: parseFloat(inflation),
      safety: parseFloat(safety),
    };
    if (Object.values(parsed).some((v) => typeof v === "number" && isNaN(v))) return null;
    if (parsed.age >= 82.3) return null;
    return projectRetirement(parsed);
  }, [age, net, expenses, netMatchInflation, expensesMatchInflation, savings, interest, inflation, safety]);

  const chartData = projection?.years.map((year) => ({
    year,
    unspent: projection.unspent[year],
    retirement: projection.retirement[year],
    retirementNoInflation: projection.retirementNoInflation[year],
  }));

  const rate = savingsRatePercent(parseFloat(net), parseFloat(expenses));

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link to="/projects/calculators" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Calculators
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">Retirement Calculator</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Projects when your portfolio's investment income alone can cover expenses, with and without inflation-adjusted income growth.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Current Age</Label>
                <Input id="age" type="number" value={age} onChange={(e: ChangeEvent<HTMLInputElement>) => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings">Current Savings</Label>
                <Input id="savings" type="number" value={savings} onChange={(e: ChangeEvent<HTMLInputElement>) => setSavings(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="net">Take-Home Pay (yearly)</Label>
                <Input id="net" type="number" value={net} onChange={(e: ChangeEvent<HTMLInputElement>) => setNet(e.target.value)} />
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox id="netMatchInflation" checked={netMatchInflation} onCheckedChange={(c) => setNetMatchInflation(!!c)} />
                  <Label htmlFor="netMatchInflation" className="font-normal text-sm text-slate-600">Grows with inflation</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenses">Yearly Expenses</Label>
                <Input id="expenses" type="number" value={expenses} onChange={(e: ChangeEvent<HTMLInputElement>) => setExpenses(e.target.value)} />
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox id="expensesMatchInflation" checked={expensesMatchInflation} onCheckedChange={(c) => setExpensesMatchInflation(!!c)} />
                  <Label htmlFor="expensesMatchInflation" className="font-normal text-sm text-slate-600">Grows with inflation</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest">Average Annual Return</Label>
                <Input id="interest" type="number" step="0.001" value={interest} onChange={(e: ChangeEvent<HTMLInputElement>) => setInterest(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inflation">Average Inflation</Label>
                <Input id="inflation" type="number" step="0.001" value={inflation} onChange={(e: ChangeEvent<HTMLInputElement>) => setInflation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="safety">Safety Margin</Label>
                <Input id="safety" type="number" step="0.001" value={safety} onChange={(e: ChangeEvent<HTMLInputElement>) => setSafety(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{isNaN(rate) ? "—" : `${(rate * 100).toFixed(1)}%`}</div>
                <div className="text-sm text-slate-500">Current Savings Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {projection?.retirementYear != null ? `${projection.retirementYear} years` : "Not reached"}
                </div>
                <div className="text-sm text-slate-500">Time to Retirement</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {projection?.retirementNoInflationYear != null ? `${projection.retirementNoInflationYear} years` : "Not reached"}
                </div>
                <div className="text-sm text-slate-500">Time to Retirement (no inflation growth)</div>
              </div>
            </CardContent>
          </Card>

          {chartData && (
            <Card>
              <CardHeader><CardTitle>Projected Balance</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: "Years from now", position: "insideBottom", offset: -5 }} />
                      <YAxis tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                      <Legend />
                      <Line type="monotone" dataKey="unspent" name="Pure Savings" stroke="#64748b" dot={false} />
                      <Line type="monotone" dataKey="retirement" name="Retirement Balance" stroke="#2563eb" dot={false} />
                      <Line type="monotone" dataKey="retirementNoInflation" name="Retirement (no inflation growth)" stroke="#7c3aed" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
