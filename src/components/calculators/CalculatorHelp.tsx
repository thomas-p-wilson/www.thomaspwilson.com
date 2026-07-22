import type { CalculatorSpec } from "@/lib/calculator";
import { GRID_PLACEMENT_CLASS, gridPos, sectionGridRow } from "./calculatorGridAlignment";

const toParagraphs = (help: string | string[]) => (Array.isArray(help) ? help : [help]);

const hasHelpContent = (spec: CalculatorSpec) =>
  !!spec.helpIntro || spec.sections.some((s) => s.help || s.fields.some((f) => f.help));

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
 * A sub-calculator's own help content, nested under the parent field whose stat tile expanded it —
 * same shape as the top-level render below, minus the grid placement (it lives inline within the
 * parent section's help column rather than as its own grid cell). Keys are namespaced by
 * `namespace` (the parent field's id) to match GenericCalculator's namespacing of the nested
 * instance's `activeHelp`, so clicking a block here and interacting with the expanded card agree
 * on which one is "active".
 */
const SubCalculatorHelp = ({
  spec, namespace, activeHelp, setActiveHelp,
}: {
  spec: CalculatorSpec;
  namespace: string;
  activeHelp: string | null;
  setActiveHelp: (key: string) => void;
}) => (
  <div className="space-y-3">
    {spec.helpIntro && <p className="text-sm text-slate-600">{spec.helpIntro}</p>}
    {spec.sections.map((section) => {
      const fieldsWithHelp = section.fields.filter((f) => f.help);
      if (!section.help && fieldsWithHelp.length === 0) return null;
      const sectionKey = `${namespace}:${section.title}`;
      return (
        <div key={section.title} className="space-y-3">
          {section.help && (
            <HelpBlock
              title={section.title}
              compact
              active={activeHelp === sectionKey}
              onClick={() => setActiveHelp(sectionKey)}
              paragraphs={toParagraphs(section.help)}
            />
          )}
          {fieldsWithHelp.length > 0 && (
            <div className={section.help ? "pl-4 border-l-2 border-slate-200 space-y-3" : "space-y-3"}>
              {fieldsWithHelp.map((field) => {
                const fieldKey = `${namespace}:${field.id}`;
                return (
                  <HelpBlock
                    key={field.id}
                    title={field.label}
                    compact
                    active={activeHelp === fieldKey}
                    onClick={() => setActiveHelp(fieldKey)}
                    paragraphs={toParagraphs(field.help!)}
                  />
                );
              })}
            </div>
          )}
        </div>
      );
    })}
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
  spec, activeHelp, setActiveHelp, expandedSubCalcs,
}: {
  spec: CalculatorSpec;
  activeHelp: string | null;
  setActiveHelp: (key: string) => void;
  /** Specs resolved from currently-expanded stat tiles' subCalculators, keyed by field id — see
   * GenericCalculator's `onExpandedSubCalcsChange`. Only entries whose spec has its own help
   * content actually render anything here. */
  expandedSubCalcs?: Record<string, CalculatorSpec>;
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
        const fieldEntries = section.fields
          .map((field) => {
            const subCalcSpec = expandedSubCalcs?.[field.id];
            return { field, subCalcSpec: subCalcSpec && hasHelpContent(subCalcSpec) ? subCalcSpec : undefined };
          })
          .filter((entry) => entry.field.help || entry.subCalcSpec);
        if (!section.help && fieldEntries.length === 0) return null;
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
            {fieldEntries.length > 0 && (
              <div className={section.help ? "pl-4 border-l-2 border-slate-200 space-y-3" : "space-y-3"}>
                {fieldEntries.map(({ field, subCalcSpec }) => (
                  <div key={field.id} className="space-y-3">
                    {field.help && (
                      <HelpBlock
                        title={field.label}
                        compact
                        active={activeHelp === field.id}
                        onClick={() => setActiveHelp(field.id)}
                        paragraphs={toParagraphs(field.help!)}
                      />
                    )}
                    {subCalcSpec && (
                      <div className={field.help ? "pl-4 border-l-2 border-slate-200" : ""}>
                        <SubCalculatorHelp
                          spec={subCalcSpec}
                          namespace={field.id}
                          activeHelp={activeHelp}
                          setActiveHelp={setActiveHelp}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
