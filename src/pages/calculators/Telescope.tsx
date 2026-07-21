import { useMemo, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateTelescope, type PrimaryConstruction, type PrimaryType } from "@/lib/telescope";

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}{unit ? ` ${unit}` : ""}</div>
    </div>
  );
}

export default function Telescope() {
  const [apertureDiameter, setApertureDiameter] = useState("60.96");
  const [systemFocalLength, setSystemFocalLength] = useState("182.88");
  const [primaryType, setPrimaryType] = useState<PrimaryType>("paraboloidal");
  const [primaryConstruction, setPrimaryConstruction] = useState<PrimaryConstruction>("ground");
  const [primaryFocalLength, setPrimaryFocalLength] = useState("121.92");
  const [primaryEdgeThickness, setPrimaryEdgeThickness] = useState("5");

  const result = useMemo(() => {
    const input = {
      apertureDiameter: parseFloat(apertureDiameter),
      systemFocalLength: parseFloat(systemFocalLength),
      primaryType,
      primaryConstruction,
      primaryFocalLength: parseFloat(primaryFocalLength),
      primaryEdgeThickness: parseFloat(primaryEdgeThickness),
    };
    if (Object.values(input).some((v) => typeof v === "number" && (isNaN(v) || v <= 0))) return null;
    return calculateTelescope(input);
  }, [apertureDiameter, systemFocalLength, primaryType, primaryConstruction, primaryFocalLength, primaryEdgeThickness]);

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
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">Telescope Mirror Design</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sagitta, dish geometry, and blank mass for a spherical or paraboloidal primary mirror — plus spin-casting speed for a paraboloidal blank.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>System</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="apertureDiameter">Aperture Diameter</Label>
                <Input id="apertureDiameter" type="number" value={apertureDiameter} onChange={(e: ChangeEvent<HTMLInputElement>) => setApertureDiameter(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemFocalLength">System Focal Length</Label>
                <Input id="systemFocalLength" type="number" value={systemFocalLength} onChange={(e: ChangeEvent<HTMLInputElement>) => setSystemFocalLength(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Primary Mirror</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryType">Profile</Label>
                <Select value={primaryType} onValueChange={(v: string) => setPrimaryType(v as PrimaryType)}>
                  <SelectTrigger id="primaryType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spherical">Spherical</SelectItem>
                    <SelectItem value="paraboloidal">Paraboloidal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryConstruction">Construction</Label>
                <Select value={primaryConstruction} onValueChange={(v: string) => setPrimaryConstruction(v as PrimaryConstruction)}>
                  <SelectTrigger id="primaryConstruction"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ground">Ground Blank</SelectItem>
                    <SelectItem value="meniscus">Meniscus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryFocalLength">Primary Focal Length</Label>
                <Input id="primaryFocalLength" type="number" value={primaryFocalLength} onChange={(e: ChangeEvent<HTMLInputElement>) => setPrimaryFocalLength(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryEdgeThickness">Edge Thickness</Label>
                <Input id="primaryEdgeThickness" type="number" value={primaryEdgeThickness} onChange={(e: ChangeEvent<HTMLInputElement>) => setPrimaryEdgeThickness(e.target.value)} />
              </div>
              <p className="md:col-span-2 text-sm text-slate-500">All lengths in centimeters.</p>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader><CardTitle>Results</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Stat label="Aperture Area" value={result.apertureArea.toFixed(1)} unit="cm²" />
                <Stat label="System f-ratio" value={`f/${result.systemFocalRatio.toFixed(2)}`} />
                <Stat label="Primary f-ratio" value={`f/${result.primaryFocalRatio.toFixed(2)}`} />
                <Stat label="Sagitta (Dish Depth)" value={result.primarySagitta.toFixed(4)} unit="cm" />
                <Stat label="Dish Surface Area" value={result.primaryDishArea.toFixed(2)} unit="cm²" />
                <Stat label="Dish Volume" value={result.primaryDishVolume.toFixed(2)} unit="cm³" />
                <Stat label="Starting Blank Volume" value={result.primaryBlankVolume.toFixed(2)} unit="cm³" />
                <Stat label="Starting Blank Mass" value={result.primaryBlankMass.toFixed(1)} unit="g" />
                {result.primaryMaterialVolume != null && (
                  <Stat label="Remaining Material Volume" value={result.primaryMaterialVolume.toFixed(2)} unit="cm³" />
                )}
                {result.primaryMass != null && (
                  <Stat label="Remaining Mass" value={result.primaryMass.toFixed(1)} unit="g" />
                )}
                {result.primaryRotationRadPerSec != null && (
                  <Stat label="Spin-Cast Rotation" value={result.primaryRotationRadPerSec.toFixed(3)} unit="rad/s" />
                )}
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-slate-500 px-2 space-y-1">
            <p>Sagitta: h = R − √(R² − a²) for spherical, h = a²/4f for paraboloidal.</p>
            <p>Blank density assumed to be soda-lime glass, 2.579 g/cm³. Spin-cast rotation: ω = √(g / 2f).</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
