import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Info, Zap, Sprout, IterationCcw } from 'lucide-react';
import WirePresetsModal from './WirePresetsModal';

const CalculatorSection = ({ title, icon, children }) => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-3">
      {icon}
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {children}
    </CardContent>
  </Card>
);

const Field = ({ label, id, unit, value, onChange, isReadOnly = false, activeField, setActiveField }) => (
  <div 
    className={`p-2 -m-2 rounded-lg transition-all duration-300 ${id === activeField ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
    onClick={() => setActiveField(id)}
  >
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex">
        <Input id={id} type="number" value={value} onChange={onChange} readOnly={isReadOnly} className={isReadOnly ? 'bg-slate-100' : ''} onFocus={() => setActiveField(id)} />
        {unit && <span className="flex items-center justify-center px-3 bg-slate-100 border border-l-0 rounded-r-md text-sm text-slate-600">{unit}</span>}
      </div>
    </div>
  </div>
);

export default function ResistiveElementCalculator({ activeField, setActiveField }) {
  const [values, setValues] = useState({
    // Electrical
    voltage: '120',
    wattage: '1500',
    current: '',
    resistance: '',
    // Wire
    resistivity: '0.542',
    diameter: '0.0018288',
    radius: '',
    crossSectionalArea: '',
    length: '',
    surfaceArea: '',
    // Coiling
    meanCoilDiameter: '0.0127',
    turnSpacing: '0.001',
    turnCircumference: '',
    turnLength: '', // Not used in this simplified model
    turns: '',
    coilLength: '',
    // Surface Loading
    wireSurfaceLoad: '',
  });

  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  const calculate = useCallback(() => {
    setValues(prev => {
      const newValues = { ...prev };
      const { voltage, wattage, resistivity, diameter, meanCoilDiameter, turnSpacing } = newValues;

      // --- Electrical ---
      const V = parseFloat(voltage);
      const P = parseFloat(wattage);
      if (!isNaN(V) && !isNaN(P) && V > 0) {
        newValues.current = (P / V).toFixed(3);
        newValues.resistance = (V * V / P).toFixed(3);
      }

      // --- Wire ---
      const d = parseFloat(diameter);
      if (!isNaN(d)) {
        const r = d / 2;
        newValues.radius = r.toExponential(3);
        const A_wire = Math.PI * r * r;
        newValues.crossSectionalArea = A_wire.toExponential(3);

        const rho = parseFloat(resistivity);
        const R_target = parseFloat(newValues.resistance);
        if (!isNaN(rho) && !isNaN(R_target) && rho > 0) {
          const L_wire = (R_target * A_wire) / rho;
          newValues.length = L_wire.toFixed(3);

          const SA_wire = Math.PI * d * L_wire;
          newValues.surfaceArea = SA_wire.toFixed(3);

          // Surface Loading
          if (!isNaN(P) && SA_wire > 0) {
            const SA_wire_sq_in = SA_wire * 1550; // m^2 to in^2
            newValues.wireSurfaceLoad = (P / SA_wire_sq_in).toFixed(2);
          }
        }
      }

      // --- Coiling ---
      const D_coil = parseFloat(meanCoilDiameter);
      const s_turn = parseFloat(turnSpacing);
      const L_wire_val = parseFloat(newValues.length);
      if (!isNaN(D_coil) && !isNaN(s_turn) && !isNaN(L_wire_val) && D_coil > 0) {
        const C_turn = Math.PI * D_coil;
        newValues.turnCircumference = C_turn.toFixed(4);
        
        const N_turns = L_wire_val / C_turn;
        newValues.turns = N_turns.toFixed(1);

        const L_coil = N_turns * (d + s_turn);
        newValues.coilLength = L_coil.toFixed(3);
      }
      
      return newValues;
    });
  }, []);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleInputChange = (field) => (e) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }));
    setActiveField(field);
  };

  const handlePresetSelect = (preset) => {
    setValues(prev => ({
      ...prev,
      resistivity: preset.resistivity.toString(),
      diameter: preset.diameter.toString(),
    }));
  };

  return (
    <>
      <div className="space-y-6">
        <CalculatorSection title="Electrical Service" icon={<Zap className="w-6 h-6 text-yellow-500" />}>
          <Field label="Voltage" id="voltage" unit="V" value={values.voltage} onChange={handleInputChange('voltage')} activeField={activeField} setActiveField={setActiveField} />
          <Field label="Wattage" id="wattage" unit="W" value={values.wattage} onChange={handleInputChange('wattage')} activeField={activeField} setActiveField={setActiveField} />
          <Field label="Current" id="current" unit="A" value={values.current} isReadOnly activeField={activeField} setActiveField={setActiveField} />
          <Field label="Resistance" id="resistance" unit="Ω" value={values.resistance} isReadOnly activeField={activeField} setActiveField={setActiveField} />
        </CalculatorSection>

        <CalculatorSection title="Wire Properties" icon={<Sprout className="w-6 h-6 text-green-500" />}>
          <Field label="Resistivity" id="resistivity" unit="Ω/m" value={values.resistivity} onChange={handleInputChange('resistivity')} activeField={activeField} setActiveField={setActiveField} />
          <Field label="Diameter" id="diameter" unit="m" value={values.diameter} onChange={handleInputChange('diameter')} activeField={activeField} setActiveField={setActiveField} />
          <div className="md:col-span-2 flex items-center justify-end">
            <Button variant="outline" onClick={() => setIsPresetsModalOpen(true)}>Presets</Button>
          </div>
          <Field label="Radius" id="radius" unit="m" value={values.radius} isReadOnly activeField={activeField} setActiveField={setActiveField} />
          <Field label="Cross-sectional Area" id="crossSectionalArea" unit="m²" value={values.crossSectionalArea} isReadOnly activeField={activeField} setActiveField={setActiveField} />
          <Field label="Length" id="length" unit="m" value={values.length} isReadOnly activeField={activeField} setActiveField={setActiveField} />
          <Field label="Surface Area" id="surfaceArea" unit="m²" value={values.surfaceArea} isReadOnly activeField={activeField} setActiveField={setActiveField} />
        </CalculatorSection>

        <CalculatorSection title="Coiling" icon={<IterationCcw className="w-6 h-6 text-blue-500" />}>
          <Field label="Mean Coil Diameter" id="meanCoilDiameter" unit="m" value={values.meanCoilDiameter} onChange={handleInputChange('meanCoilDiameter')} activeField={activeField} setActiveField={setActiveField} />
          <Field label="Turn Spacing" id="turnSpacing" unit="m" value={values.turnSpacing} onChange={handleInputChange('turnSpacing')} activeField={activeField} setActiveField={setActiveField} />
          <Field label="Turn Circumference" id="turnCircumference" unit="m" value={values.turnCircumference} isReadOnly activeField={activeField} setActiveField={setActiveField} />
          <Field label="Turns" id="turns" unit="" value={values.turns} isReadOnly activeField={activeField} setActiveField={setActiveField} />
          <Field label="Coil Length" id="coilLength" unit="m" value={values.coilLength} isReadOnly activeField={activeField} setActiveField={setActiveField} />
        </CalculatorSection>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Info className="w-6 h-6 text-purple-500" /> Surface Loading</CardTitle>
          </CardHeader>
          <CardContent>
            <Field label="Wire Surface Load" id="wireSurfaceLoad" unit="W/in²" value={values.wireSurfaceLoad} isReadOnly activeField={activeField} setActiveField={setActiveField} />
          </CardContent>
        </Card>
      </div>

      <WirePresetsModal open={isPresetsModalOpen} onOpenChange={setIsPresetsModalOpen} onSelect={handlePresetSelect} />
    </>
  );
}