import { useCalculatorContext } from '@/components/CalculatorContext/CalculatorContext';

export const wrapWithStateLocator = (renderer: any) => () => {
  const { proxy } = useCalculatorContext();

  return renderer(proxy);
}
