import { InputGroup } from '@/components/controls/InputGroup/InputGroup';
import { CalculatorContextProvider } from '@/components/CalculatorContext/CalculatorContext';
import { MeasureFile } from '@/units/MeasureFile';
import { ConvertibleNumber } from './ConvertableNumber';
import { CalculatorSettings } from '../CalculatorSettings/CalculatorSettings';
import './ConversionView.scss';

export type ConversionViewProps = {
  measure: MeasureFile
  base: string
}

export const ConversionView = ({
  measure,
  base,
}: ConversionViewProps) => (
  <CalculatorContextProvider>
    <CalculatorSettings />
    {
      Object.keys(measure.grouped)
        .map((groupName) => (
          <div className="row" key={groupName}>
            <h2>{groupName} ({Object.keys(measure.grouped[groupName]!).length})</h2>
            {/*measure[system]!.description ? (<p>{measure[system]!.description}</p>) : null*/}
            <ul className="unit-list">
              {
                Object.keys(measure.grouped[groupName]!)
                  .map((key) => (
                    <li key={key}>
                      <InputGroup>
                        <strong>{measure.grouped[groupName]![key]?.singular}</strong>
                        <ConvertibleNumber
                          unit={key}
                          base={base}
                          measure={measure}
                          placeholder="0.00"
                        />
                      </InputGroup>
                    </li>
                  ))
              }
            </ul>
          </div>
        ))
    }
  </CalculatorContextProvider>
);
