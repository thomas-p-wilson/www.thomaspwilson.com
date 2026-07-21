import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { convert, measures, unitsForMeasure, type Measure } from "@/lib/units";

function MeasureSelect({ measure, onChange }: { measure: Measure; onChange: (m: Measure) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="measure">Category</Label>
      <Select value={measure} onValueChange={(value: string) => onChange(value as Measure)}>
        <SelectTrigger id="measure">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {measures.map((m) => (
            <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SingleConversion({ measure }: { measure: Measure }) {
  const unitsForCurrentMeasure = unitsForMeasure(measure);
  const [fromUnit, setFromUnit] = useState(unitsForCurrentMeasure[0].symbol);
  const [toUnit, setToUnit] = useState(unitsForCurrentMeasure[1]?.symbol ?? unitsForCurrentMeasure[0].symbol);
  const [inputValue, setInputValue] = useState("1");
  const [outputValue, setOutputValue] = useState("");

  const recalculate = useCallback(() => {
    if (inputValue.trim() === "" || Number.isNaN(Number(inputValue))) {
      setOutputValue("");
      return;
    }
    try {
      setOutputValue(convert(inputValue, fromUnit, toUnit).toDecimalPlaces(6).toString());
    } catch {
      setOutputValue("");
    }
  }, [inputValue, fromUnit, toUnit]);

  useEffect(() => {
    const units = unitsForMeasure(measure);
    setFromUnit(units[0].symbol);
    setToUnit(units[1]?.symbol ?? units[0].symbol);
    setInputValue("1");
  }, [measure]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
      <div className="space-y-2">
        <Label htmlFor="from-value">From</Label>
        <Input id="from-value" type="number" value={inputValue} onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)} />
        <Select value={fromUnit} onValueChange={setFromUnit}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unitsForCurrentMeasure.map((unit) => (
              <SelectItem key={unit.symbol} value={unit.symbol}>{unit.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="ghost" size="icon" onClick={swapUnits} aria-label="Swap units">
          <ArrowRightLeft className="w-5 h-5 text-slate-500 hover:text-slate-800 transition-colors" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="to-value">To</Label>
        <Input id="to-value" readOnly value={outputValue} className="font-bold text-slate-800 bg-slate-50" />
        <Select value={toUnit} onValueChange={setToUnit}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unitsForCurrentMeasure.map((unit) => (
              <SelectItem key={unit.symbol} value={unit.symbol}>{unit.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ConvertToAll({ measure }: { measure: Measure }) {
  const unitsForCurrentMeasure = unitsForMeasure(measure);
  const [fromUnit, setFromUnit] = useState(unitsForCurrentMeasure[0].symbol);
  const [inputValue, setInputValue] = useState("1");

  useEffect(() => {
    setFromUnit(unitsForMeasure(measure)[0].symbol);
    setInputValue("1");
  }, [measure]);

  const valid = inputValue.trim() !== "" && !Number.isNaN(Number(inputValue));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="all-from-value">Value</Label>
          <Input id="all-from-value" type="number" value={inputValue} onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="all-from-unit">Unit</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger id="all-from-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitsForCurrentMeasure.map((unit) => (
                <SelectItem key={unit.symbol} value={unit.symbol}>{unit.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
        {unitsForCurrentMeasure.map((unit) => {
          let result = "";
          if (valid) {
            try {
              result = convert(inputValue, fromUnit, unit.symbol).toDecimalPlaces(6).toString();
            } catch {
              result = "";
            }
          }
          return (
            <div key={unit.symbol} className="flex items-center justify-between px-4 py-2.5 bg-white">
              <span className="text-sm text-slate-600">{unit.label}</span>
              <span className={`font-mono text-sm ${unit.symbol === fromUnit ? "font-bold text-blue-600" : "text-slate-900"}`}>
                {result || "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UnitConverterComponent() {
  const [measure, setMeasure] = useState<Measure>("length");
  const [mode, setMode] = useState<"single" | "all">("single");

  return (
    <Card className="max-w-2xl mx-auto border-slate-200 shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-2xl font-bold text-slate-900">Unit Converter</h3>
        <Tabs value={mode} onValueChange={(v: string) => setMode(v as "single" | "all")}>
          <TabsList>
            <TabsTrigger value="single">Single</TabsTrigger>
            <TabsTrigger value="all">Convert to All</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-6">
        <MeasureSelect measure={measure} onChange={setMeasure} />
        {mode === "single" ? <SingleConversion measure={measure} /> : <ConvertToAll measure={measure} />}
      </CardContent>
    </Card>
  );
}
