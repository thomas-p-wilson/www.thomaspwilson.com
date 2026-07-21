import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export interface WirePreset {
  name: string;
  resistivity: number;
  diameter: number;
}

const presets: WirePreset[] = [
  { name: "Kanthal A1 13ga", resistivity: 0.542, diameter: 0.0018288 }, // 1.8288mm in m
  { name: "Kanthal A1 15ga", resistivity: 0.863, diameter: 0.00145034 }, // 1.45034mm in m
  { name: "NiChrome 80 20ga", resistivity: 2.59, diameter: 0.0008128 }, // 0.8128mm in m
  { name: "NiChrome 80 24ga", resistivity: 6.54, diameter: 0.00051054 }, // 0.51054mm in m
  { name: "SS 316L 22ga", resistivity: 2.79, diameter: 0.00064262 }, // 0.64262mm in m
];

interface WirePresetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (preset: WirePreset) => void;
}

export default function WirePresetsModal({ open, onOpenChange, onSelect }: WirePresetsModalProps) {
  const handleSelect = (preset: WirePreset) => {
    onSelect(preset);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Wire Presets</DialogTitle>
          <DialogDescription>
            Select a common resistive wire to populate its properties. All units are in SI (meters, ohms/meter).
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Resistivity (Ω/m)</TableHead>
                <TableHead>Diameter (m)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presets.map((preset) => (
                <TableRow key={preset.name}>
                  <TableCell>{preset.name}</TableCell>
                  <TableCell>{preset.resistivity}</TableCell>
                  <TableCell>{preset.diameter}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleSelect(preset)}>Select</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
