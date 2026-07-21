import { useState, type ChangeEvent, type FocusEvent, type SyntheticEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CalculatorField, CalculatorSpec } from "@/lib/calculator";
import { convert, unitsForMeasure } from "@/lib/units";
import { GRID_PLACEMENT_CLASS, gridPos, sectionGridRow } from "./calculatorGridAlignment";

/** Converts `value` from `from` to `to`, falling back to `value` unchanged if either unit can't be parsed. */
function tryConvert(value: string, from: string, to: string): string {
  if (from === to) return value;
  try {
    return convert(value, from, to).toDecimalPlaces(6).toString();
  } catch {
    return value;
  }
}

/** A computed field's result, rendered as a tile rather than an input since it's never typed into directly. */
function ReadOnlyStat({
  field, value, convertible, displayUnit, onUnitChange, expandable, expanded, onToggleExpand,
}: {
  field: CalculatorField;
  value: string;
  convertible: boolean;
  displayUnit?: string;
  onUnitChange: (unit: string) => void;
  expandable: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-wide">{field.label}</span>
        {expandable && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={expanded ? `Collapse ${field.label}` : `Expand ${field.label}`}
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2 mt-1">
        <span className="text-lg font-semibold text-slate-900">{value || "—"}</span>
        {convertible ? (
          <Select value={displayUnit} onValueChange={onUnitChange}>
            <SelectTrigger className="h-auto w-auto gap-1 border-none bg-transparent p-0 text-xs text-slate-500 shadow-none focus:ring-0 [&>svg]:hidden">
              <SelectValue>{displayUnit}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {unitsForMeasure(field.measure!).map((u) => (
                <SelectItem key={u.symbol} value={u.symbol}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          field.unit && <span className="text-xs text-slate-500 shrink-0">{field.unit}</span>
        )}
      </div>
    </div>
  );
}

interface GenericCalculatorProps {
  spec: CalculatorSpec;
  initialValues?: Record<string, string>;
  /**
   * Controls which card or field is highlighted as correlating with a side help panel, keyed by
   * section title or field id (whichever declared the active `help`). Uncontrolled (manages its
   * own state) when omitted — e.g. for a subCalculator's nested instance, which has no help panel
   * of its own to coordinate with.
   */
  activeHelp?: string | null;
  onActiveHelpChange?: (key: string) => void;
}

export default function GenericCalculator({ spec, initialValues, activeHelp: activeHelpProp, onActiveHelpChange }: GenericCalculatorProps) {
  const [values, setValues] = useState<Record<string, string>>(() => spec.calculate({ ...spec.defaults, ...initialValues }));
  const [internalActiveHelp, setInternalActiveHelp] = useState<string | null>(null);
  const activeHelp = activeHelpProp !== undefined ? activeHelpProp : internalActiveHelp;
  const setActiveHelp = onActiveHelpChange ?? setInternalActiveHelp;
  // Only the instance CalculatorPage coordinates with a help panel needs to place its cards onto
  // the shared grid — a standalone render or a nested subCalculator has no sibling to align with.
  const isGridLayout = onActiveHelpChange !== undefined;
  // Per-field selected display unit, for fields with `measure` set. Falls back to the field's storage unit.
  const [displayUnits, setDisplayUnits] = useState<Record<string, string>>({});
  // While a measure-tagged field is focused, its input shows exactly what's been typed (unconverted on
  // every keystroke) rather than a live base-value round trip, which would fight the user's cursor.
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [fieldText, setFieldText] = useState<Record<string, string>>({});
  // Fields whose stat tile is expanded into a nested sub-calculator. Collapsing (rather than
  // hiding) discards that sub-calculator's state, so re-expanding always reseeds from `values`.
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => setExpandedFields((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const update = (id: string, value: string) => {
    setValues((prev) => spec.calculate({ ...prev, [id]: value }));
  };

  const displayUnitFor = (field: CalculatorField) => displayUnits[field.id] ?? field.unit!;

  const onUnitChange = (field: CalculatorField, unit: string) => {
    setDisplayUnits((prev) => ({ ...prev, [field.id]: unit }));
  };

  const onFieldFocus = (field: CalculatorField) => (e: FocusEvent<HTMLInputElement>) => {
    setFocusedField(field.id);
    setFieldText((prev) => ({ ...prev, [field.id]: e.target.value }));
  };

  const onFieldBlur = (field: CalculatorField) => () => {
    setFocusedField((prev) => (prev === field.id ? null : prev));
  };

  const onFieldChange = (field: CalculatorField) => (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setFieldText((prev) => ({ ...prev, [field.id]: raw }));
    const displayUnit = displayUnitFor(field);
    update(field.id, field.measure && field.unit ? tryConvert(raw, displayUnit, field.unit) : raw);
  };

  // For a field with its own `help`, interacting with it should highlight just that field's help
  // block rather than the whole card — so it stops the event before the enclosing Card's handler
  // (which sets the card-level key) ever sees it. Fields without `help` fall through untouched,
  // leaving the card-level correlation as the only behavior, same as before this existed.
  const fieldHelpProps = (field: CalculatorField) => {
    if (!field.help) return { className: "" };
    const activate = (e: SyntheticEvent) => {
      e.stopPropagation();
      setActiveHelp(field.id);
    };
    return {
      onFocus: activate,
      onClick: activate,
      className: `p-2 -m-2 rounded-lg transition-all duration-300 ${activeHelp === field.id ? "bg-blue-50 ring-2 ring-blue-200" : ""}`,
    };
  };

  const content = (
    <>
      {spec.visual && (
        <Card className={isGridLayout ? GRID_PLACEMENT_CLASS : undefined} style={isGridLayout ? gridPos(1) : undefined}>
          <CardContent className="pt-6">
            {spec.visual(values)}
          </CardContent>
        </Card>
      )}
      {spec.sections.map((section, sectionIndex) => {
        const toggledOn = !section.toggle || values[section.toggle.id] === "true";
        return (
          <Card
            key={section.title}
            onFocus={() => setActiveHelp(section.title)}
            onClick={() => setActiveHelp(section.title)}
            style={isGridLayout ? gridPos(sectionGridRow(sectionIndex)) : undefined}
            className={`transition-all duration-300 ${activeHelp === section.title ? "ring-2 ring-blue-200 shadow-md" : ""} ${isGridLayout ? GRID_PLACEMENT_CLASS : ""}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{section.title}</CardTitle>
                {section.toggle && (
                  <label className="flex items-center gap-2 text-sm font-normal text-slate-600 cursor-pointer">
                    {section.toggle.label ?? "Enable"}
                    <Checkbox
                      checked={toggledOn}
                      onCheckedChange={(checked) => update(section.toggle!.id, checked ? "true" : "false")}
                    />
                  </label>
                )}
              </div>
            </CardHeader>
            {toggledOn && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {section.fields
                  .filter((field) => !field.hidden?.(values))
                  .map((field) => {
                    const readOnly = typeof field.readOnly === "function" ? field.readOnly(values) : !!field.readOnly;
                    const convertible = !!(field.measure && field.unit);
                    const displayUnit = convertible ? displayUnitFor(field) : undefined;
                    const displayValue =
                      convertible && focusedField === field.id
                        ? (fieldText[field.id] ?? "")
                        : convertible
                          ? tryConvert(values[field.id] ?? "", field.unit!, displayUnit!)
                          : (values[field.id] ?? "");

                    const helpProps = fieldHelpProps(field);

                    if (readOnly && field.type !== "select") {
                      const expanded = expandedFields.has(field.id);
                      const subCalc = field.subCalculator?.(values);
                      return (
                        <div
                          key={field.id}
                          onFocus={helpProps.onFocus}
                          onClick={helpProps.onClick}
                          className={`${expanded ? "md:col-span-2 space-y-3" : "space-y-3"} ${helpProps.className}`}
                        >
                          <ReadOnlyStat
                            field={field}
                            value={displayValue}
                            convertible={convertible}
                            displayUnit={displayUnit}
                            onUnitChange={(unit) => onUnitChange(field, unit)}
                            expandable={!!subCalc}
                            expanded={expanded}
                            onToggleExpand={() => toggleExpand(field.id)}
                          />
                          {expanded && subCalc && (
                            <div className="pl-4 border-l-2 border-slate-200">
                              <GenericCalculator spec={subCalc.spec} initialValues={subCalc.prefill(values)} />
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={field.id}
                        onFocus={helpProps.onFocus}
                        onClick={helpProps.onClick}
                        className={`space-y-2 ${helpProps.className}`}
                      >
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
                              value={displayValue}
                              onFocus={convertible ? onFieldFocus(field) : undefined}
                              onBlur={convertible ? onFieldBlur(field) : undefined}
                              onChange={onFieldChange(field)}
                            />
                            {convertible ? (
                              <Select value={displayUnit} onValueChange={(unit: string) => onUnitChange(field, unit)}>
                                <SelectTrigger className="w-auto shrink-0 gap-1 rounded-l-none border-l-0 bg-slate-100 px-2 text-sm text-slate-600">
                                  <SelectValue>{displayUnit}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {unitsForMeasure(field.measure!).map((u) => (
                                    <SelectItem key={u.symbol} value={u.symbol}>{u.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              field.unit && (
                                <span className="flex items-center justify-center px-3 bg-slate-100 border border-l-0 rounded-r-md text-sm text-slate-600">
                                  {field.unit}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </CardContent>
            )}
          </Card>
        );
      })}
      {spec.notes && spec.notes.length > 0 && (
        <div
          style={isGridLayout ? gridPos(sectionGridRow(spec.sections.length), "1 / -1") : undefined}
          className={`text-sm text-slate-500 space-y-1 px-2 ${isGridLayout ? GRID_PLACEMENT_CLASS : ""}`}
        >
          {spec.notes.map((note) => <p key={note}>{note}</p>)}
        </div>
      )}
    </>
  );

  return isGridLayout ? content : <div className="space-y-6">{content}</div>;
}
