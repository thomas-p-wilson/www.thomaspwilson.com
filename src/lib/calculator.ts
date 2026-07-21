export interface CalculatorFieldOption {
  value: string;
  label: string;
}

export interface CalculatorField {
  id: string;
  label: string;
  unit?: string;
  type?: "number" | "select";
  options?: CalculatorFieldOption[];
  readOnly?: boolean | ((values: Record<string, string>) => boolean);
  hidden?: (values: Record<string, string>) => boolean;
}

export interface CalculatorSectionSpec {
  title: string;
  fields: CalculatorField[];
}

export interface CalculatorSpec {
  slug: string;
  title: string;
  description: string;
  sections: CalculatorSectionSpec[];
  defaults: Record<string, string>;
  /** Given the full current values, return the fields that should be updated (inputs pass through untouched). */
  calculate: (values: Record<string, string>) => Record<string, string>;
  /** Constants/sources/simplifications worth surfacing under the calculator. */
  notes?: string[];
}

export const num = (values: Record<string, string>, id: string): number => parseFloat(values[id]);
