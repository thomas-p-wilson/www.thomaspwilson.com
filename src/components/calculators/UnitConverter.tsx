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

type EntryProps = {
  measure: Measure;
  unit: string;
  value: string;
  onUnitChange: (unit: string) => void;
  onValueChange: (value: string) => void;
};

function SingleConversion({ measure, unit, value, onUnitChange, onValueChange }: EntryProps) {
  const unitsForCurrentMeasure = unitsForMeasure(measure);
  const [toUnit, setToUnit] = useState(unitsForCurrentMeasure[1]?.symbol ?? unitsForCurrentMeasure[0].symbol);
  const [outputValue, setOutputValue] = useState("");

  const recalculate = useCallback(() => {
    if (value.trim() === "" || Number.isNaN(Number(value))) {
      setOutputValue("");
      return;
    }
    try {
      setOutputValue(convert(value, unit, toUnit).toDecimalPlaces(6).toString());
    } catch {
      setOutputValue("");
    }
  }, [value, unit, toUnit]);

  useEffect(() => {
    const units = unitsForMeasure(measure);
    setToUnit(units[1]?.symbol ?? units[0].symbol);
  }, [measure]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  const swapUnits = () => {
    onUnitChange(toUnit);
    setToUnit(unit);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
      <div className="space-y-2">
        <Label htmlFor="from-value">From</Label>
        <Input id="from-value" type="number" value={value} onChange={(e: ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value)} />
        <Select value={unit} onValueChange={onUnitChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unitsForCurrentMeasure.map((u) => (
              <SelectItem key={u.symbol} value={u.symbol}>{u.label}</SelectItem>
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
            {unitsForCurrentMeasure.map((u) => (
              <SelectItem key={u.symbol} value={u.symbol}>{u.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ConvertToAll({ measure, unit, value, onUnitChange, onValueChange }: EntryProps) {
  const unitsForCurrentMeasure = unitsForMeasure(measure);
  const valid = value.trim() !== "" && !Number.isNaN(Number(value));

  const handleChange = (unitSymbol: string, newValue: string) => {
    onUnitChange(unitSymbol);
    onValueChange(newValue);
  };

  return (
    <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
      {unitsForCurrentMeasure.map((u) => {
        const isSource = u.symbol === unit;
        let displayValue = isSource ? value : "";
        if (!isSource && valid) {
          try {
            displayValue = convert(value, unit, u.symbol).toDecimalPlaces(6).toString();
          } catch {
            displayValue = "";
          }
        }
        return (
          <div key={u.symbol} className="flex items-center justify-between gap-4 px-4 py-2.5 bg-white">
            <Label htmlFor={`all-value-${u.symbol}`} className="text-sm text-slate-600">
              {u.label}
            </Label>
            <Input
              id={`all-value-${u.symbol}`}
              type="number"
              value={displayValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(u.symbol, e.target.value)}
              className={`w-40 font-mono text-sm ${isSource ? "font-bold text-blue-600" : "text-slate-900"}`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function UnitConverterComponent() {
  const [measure, setMeasure] = useState<Measure>("length");
  const [mode, setMode] = useState<"single" | "all">("single");
  const [unit, setUnit] = useState(unitsForMeasure("length")[0].symbol);
  const [value, setValue] = useState("1");

  const handleMeasureChange = (m: Measure) => {
    setMeasure(m);
    setUnit(unitsForMeasure(m)[0].symbol);
    setValue("1");
  };

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
        <MeasureSelect measure={measure} onChange={handleMeasureChange} />
        {mode === "single" ? (
          <SingleConversion measure={measure} unit={unit} value={value} onUnitChange={setUnit} onValueChange={setValue} />
        ) : (
          <ConvertToAll measure={measure} unit={unit} value={value} onUnitChange={setUnit} onValueChange={setValue} />
        )}
      </CardContent>
    </Card>
  );
}
