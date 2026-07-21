import type { CalculatorSpec } from "@/lib/calculator";
import { GRID_PLACEMENT_CLASS, gridPos, sectionGridRow } from "./calculatorGridAlignment";

const toParagraphs = (help: string | string[]) => (Array.isArray(help) ? help : [help]);

interface HelpBlockProps {
  title: string;
  compact?: boolean;
  active: boolean;
  onClick: () => void;
  paragraphs: string[];
}

const HelpBlock = ({ title, compact, active, onClick, paragraphs }: HelpBlockProps) => (
  <div
    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${active ? "bg-blue-50 ring-2 ring-blue-200 shadow-md" : "hover:bg-slate-50"}`}
    onClick={onClick}
  >
    <h4 className={`font-semibold text-slate-800 mb-2 ${compact ? "text-base" : "text-lg"}`}>{title}</h4>
    <div className="text-slate-600 space-y-2">
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  </div>
);

/**
 * Side panel of prose paired with a CalculatorPage's cards and fields. Correlation is by title/id
 * (the shared key with GenericCalculator's cards and field rows) via the lifted `activeHelp`
 * state: a card-level block for a section's own `help`, plus a nested block for any field within
 * it that declares its own (finer-grained) `help` — either can be used alone or together.
 *
 * Each section's combined block shares its grid row with that section's card in GenericCalculator
 * (see calculatorGridAlignment), so it's always placed by the section's original index — mapping
 * over every section rather than pre-filtering, so a section with no help still "spends" its row
 * and later sections don't drift out of alignment with their cards.
 */
export default function CalculatorHelp({
  spec, activeHelp, setActiveHelp,
}: {
  spec: CalculatorSpec;
  activeHelp: string | null;
  setActiveHelp: (key: string) => void;
}) {
  return (
    <>
      {spec.helpIntro && (
        <div style={gridPos(1, 2)} className={GRID_PLACEMENT_CLASS}>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h3>
          <p className="text-slate-600">{spec.helpIntro}</p>
        </div>
      )}
      {spec.sections.map((section, sectionIndex) => {
        const fieldsWithHelp = section.fields.filter((f) => f.help);
        if (!section.help && fieldsWithHelp.length === 0) return null;
        return (
          <div
            key={section.title}
            style={gridPos(sectionGridRow(sectionIndex), 2)}
            className={`space-y-3 ${GRID_PLACEMENT_CLASS}`}
          >
            {section.help && (
              <HelpBlock
                title={section.title}
                active={activeHelp === section.title}
                onClick={() => setActiveHelp(section.title)}
                paragraphs={toParagraphs(section.help)}
              />
            )}
            {fieldsWithHelp.length > 0 && (
              <div className={section.help ? "pl-4 border-l-2 border-slate-200 space-y-3" : "space-y-3"}>
                {fieldsWithHelp.map((field) => (
                  <HelpBlock
                    key={field.id}
                    title={field.label}
                    compact
                    active={activeHelp === field.id}
                    onClick={() => setActiveHelp(field.id)}
                    paragraphs={toParagraphs(field.help!)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
