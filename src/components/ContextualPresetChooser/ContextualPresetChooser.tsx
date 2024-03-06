import { useCallback } from 'react';
import { useCalculatorContext } from '../CalculatorContext/CalculatorContext'
import { PresetChooser, PresetChooserProps } from '../PresetChooser/PresetChooser';

export type ContextualPresetChooserProps = {
  choices: PresetChooserProps['choices']
  name: string
}

export const ContextualPresetChooser = ({
  choices,
  name: _name,
}: ContextualPresetChooserProps) => {
  const controller = useCalculatorContext();

  const onSelect = useCallback((name: string) => {
    controller.setValue(_name, name as any);
    const choice = choices.find((c) => (c.name === name));
    Object.keys(choice!.values).forEach((name) => {
      controller.setValue(name, choice!.values[name]!)
    })
  }, []);

  return (
    <PresetChooser
      choice={controller.getValue(_name) as any}
      choices={choices}
      onSelect={onSelect}
    />
  )
}
