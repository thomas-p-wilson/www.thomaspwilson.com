
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const conversionData = {
  length: {
    base: 'meter',
    units: {
      meter: 1,
      kilometer: 1000,
      centimeter: 0.01,
      millimeter: 0.001,
      mile: 1609.34,
      yard: 0.9144,
      foot: 0.3048,
      inch: 0.0254,
    },
  },
  weight: {
    base: 'gram',
    units: {
      gram: 1,
      kilogram: 1000,
      milligram: 0.001,
      ton: 1000000,
      pound: 453.592,
      ounce: 28.3495,
    },
  },
  temperature: {
    base: 'celsius',
    units: {
      celsius: (val, to) => {
        if (to === 'fahrenheit') return (val * 9/5) + 32;
        if (to === 'kelvin') return val + 273.15;
        return val;
      },
      fahrenheit: (val, to) => {
        if (to === 'celsius') return (val - 32) * 5/9;
        if (to === 'kelvin') return ((val - 32) * 5/9) + 273.15;
        return val;
      },
      kelvin: (val, to) => {
        if (to === 'celsius') return val - 273.15;
        if (to === 'fahrenheit') return ((val - 273.15) * 9/5) + 32;
        return val;
      },
    }
  }
};

export default function UnitConverterComponent() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('foot');
  const [inputValue, setInputValue] = useState('1');
  const [outputValue, setOutputValue] = useState('');

  const convert = useCallback(() => {
    const inputNum = parseFloat(inputValue);
    if (isNaN(inputNum)) {
      setOutputValue('');
      return;
    }

    const catData = conversionData[category];
    let result;

    if (category === 'temperature') {
      result = catData.units[fromUnit](inputNum, toUnit);
    } else {
      const baseValue = inputNum * catData.units[fromUnit];
      result = baseValue / catData.units[toUnit];
    }
    
    setOutputValue(result.toFixed(5));
  }, [inputValue, fromUnit, toUnit, category]); // Dependencies for useCallback

  useEffect(() => {
    const units = Object.keys(conversionData[category].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setInputValue('1');
  }, [category]);
  
  useEffect(() => {
    convert();
  }, [convert]); // Depend on the memoized convert function

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const unitsForCategory = Object.keys(conversionData[category].units);

  return (
    <Card className="max-w-2xl mx-auto border-slate-200 shadow-lg">
      <CardHeader>
        <h3 className="text-2xl font-bold text-slate-900">Unit Converter</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select id="category" value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(conversionData).map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="from-value">From</Label>
            <Input id="from-value" type="number" value={inputValue} onChange={handleInputChange} />
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitsForCategory.map(unit => (
                  <SelectItem key={unit} value={unit} className="capitalize">{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center mt-6">
            <Button variant="ghost" size="icon" onClick={swapUnits}>
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
                {unitsForCategory.map(unit => (
                  <SelectItem key={unit} value={unit} className="capitalize">{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
