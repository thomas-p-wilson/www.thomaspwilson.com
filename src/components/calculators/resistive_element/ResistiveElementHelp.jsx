import React from 'react';

const HelpSection = ({ id, activeField, setActiveField, children }) => (
  <div
    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${id === activeField ? 'bg-blue-50 ring-2 ring-blue-200 shadow-md' : 'hover:bg-slate-50'}`}
    onClick={() => setActiveField(id)}
  >
    {children}
  </div>
);

export default function ResistiveElementHelp({ activeField, setActiveField }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h3>
        <p className="text-slate-600">
          This calculator helps determine the physical dimensions of a resistive heating element. You start with your target electrical properties (Voltage and Wattage), and the calculator works backwards to find the required wire length and coiling specifications.
        </p>
      </div>

      <HelpSection id="resistivity" activeField={activeField} setActiveField={setActiveField}>
        <h4 className="font-semibold text-lg text-slate-800 mb-2">Resistivity (Ω/m)</h4>
        <p className="text-slate-600">
          This is a material's intrinsic ability to resist electrical current over a certain length. Different alloys (like Kanthal or NiChrome) have different resistivity values. Use the "Presets" button to select from common materials.
        </p>
      </HelpSection>

      <HelpSection id="crossSectionalArea" activeField={activeField} setActiveField={setActiveField}>
        <h4 className="font-semibold text-lg text-slate-800 mb-2">Cross-sectional Area (m²)</h4>
        <p className="text-slate-600">
          This is the area of the wire's face if you were to cut it. It's calculated from the wire's diameter and is crucial for determining total resistance. The formula is: <span className="font-mono text-sm bg-slate-100 p-1 rounded">A = π * (diameter / 2)²</span>.
        </p>
      </HelpSection>

      <div className="text-slate-500 text-sm p-4 text-center border-y border-slate-200">
        <p>The required wire length is calculated based on the target resistance, the wire's resistivity, and its cross-sectional area. A thicker wire (larger area) or a less resistive material will require a longer length to achieve the same target resistance.</p>
      </div>

      <HelpSection id="surfaceArea" activeField={activeField} setActiveField={setActiveField}>
        <h4 className="font-semibold text-lg text-slate-800 mb-2">Surface Area (m²)</h4>
        <p className="text-slate-600">
          The total surface area of the wire. This value is essential for calculating the Wire Surface Load, which determines how hot the wire will get. It's a function of the wire's diameter and its total length.
        </p>
      </HelpSection>

      <HelpSection id="wireSurfaceLoad" activeField={activeField} setActiveField={setActiveField}>
        <h4 className="font-semibold text-lg text-slate-800 mb-2">Wire Surface Load (W/in²)</h4>
        <p className="text-slate-600">
          This is the most critical value for safety and longevity. It tells you how many watts of power are being dissipated per square inch of the wire's surface. If this value is too high, the wire will burn out quickly or fail. Different materials have different maximum recommended surface loads.
        </p>
      </HelpSection>
    </div>
  );
}