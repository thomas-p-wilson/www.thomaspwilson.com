import { useCalculatorContext } from '@/components/CalculatorContext/CalculatorContext';
import { useMemo } from 'react';
import { Select, SelectProps } from '@/components/controls/Select/Select';

export type ContextualSelectProps = {
  name: SelectProps['name']
  items: SelectProps['items']
  disabled?: boolean
}

export const ContextualSelect = ({
  name,
  items,
  disabled,
}: ContextualSelectProps) => {
  const controller = useCalculatorContext();

  const _value = useMemo(() => {
    let result: any = controller.getValue(name);

    if (!result) {
      return undefined;
    }

    return result;
  }, [controller.values]);

  return (
    <Select
      name={name}
      items={items}
      value={_value}
      onChange={controller.setValue}
      disabled={disabled}
    />
  );
}
