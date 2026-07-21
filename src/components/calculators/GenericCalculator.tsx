import { useState, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CalculatorSpec } from "@/lib/calculator";

export default function GenericCalculator({ spec }: { spec: CalculatorSpec }) {
  const [values, setValues] = useState<Record<string, string>>(() => spec.calculate({ ...spec.defaults }));

  const update = (id: string, value: string) => {
    setValues((prev) => spec.calculate({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-6">
      {spec.sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {section.fields
              .filter((field) => !field.hidden?.(values))
              .map((field) => {
                const readOnly = typeof field.readOnly === "function" ? field.readOnly(values) : !!field.readOnly;
                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    {field.type === "select" ? (
                      <Select value={values[field.id] ?? ""} onValueChange={(v: string) => update(field.id, v)}>
                        <SelectTrigger id={field.id}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex">
                        <Input
                          id={field.id}
                          type="number"
                          value={values[field.id] ?? ""}
                          readOnly={readOnly}
                          className={readOnly ? "bg-slate-100" : ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => update(field.id, e.target.value)}
                        />
                        {field.unit && (
                          <span className="flex items-center justify-center px-3 bg-slate-100 border border-l-0 rounded-r-md text-sm text-slate-600">
                            {field.unit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>
      ))}
      {spec.notes && spec.notes.length > 0 && (
        <div className="text-sm text-slate-500 space-y-1 px-2">
          {spec.notes.map((note) => <p key={note}>{note}</p>)}
        </div>
      )}
    </div>
  );
}
