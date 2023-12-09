import { useCallback } from 'react';
import { useCalculatorContext } from '../CalculatorContext/CalculatorContext'
import { PresetChooser, PresetChooserProps } from '../PresetChooser/PresetChooser';
import Decimal from 'decimal.js';

export type ContextualPresetChooserProps = {
  choices: PresetChooserProps['choices']
}

export const ContextualPresetChooser = ({
  choices,
}: ContextualPresetChooserProps) => {
  const controller = useCalculatorContext();

  const onSelect = useCallback((values: { [k: string]: Decimal }) => {
    Object.keys(values).forEach((name) => {
      console.log('Set: ', name, values[name])
      controller.setValue(name, values[name]!)
    })
  }, []);

  return (
    <PresetChooser
      choices={choices}
      onSelect={onSelect}
    />
  )
}
