import { Decimal } from '@/types/Decimal';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import BigDecimal from 'decimal.js';

export type Field = {
  name: string
  value: string
  unit: string
  dimension: string
}

export type CalculatorStateShape = {
  values: { [k: string]: Decimal }
  units: { [k: string]: string }
  dimensions: { [k: string]: string }
  scales: { [k: string]: number }
  globalScale: number
  significantDigits: { [k: string]: number }
  globalSignificantDigits: number
  calculations: { [k: string]: (values: CalculatorStateShape['values']) => (BigDecimal | undefined) }
  calculated: { [k: string]: Decimal }
}

export type CalculatorContextController = CalculatorStateShape & {
  getValue: (name: string) => BigDecimal | undefined
  setValue: (name: string, value: Decimal) => void
  setUnit: (name: string, value: string) => void
  setDimension: (name: string, value: string) => void
  setScale: (name: string, value: number) => void
  setGlobalScale: (value: number) => void
  setSignificantDigit: (name: string, value: number) => void
  setGlobalSignificantDigits: (value: number) => void
}

export const CalculatorContext = createContext<CalculatorContextController>(undefined!);

export type CalculatorContextProviderProps = {
  initialState?: Partial<CalculatorStateShape>
  children: any
}

const fieldMutator = (setter: any) => (name: string, value: any) => {
  setter((current: any) => ({
    ...current,
    [name]: value,
  }));
};

export const CalculatorContextProvider = ({
  initialState,
  children
}: CalculatorContextProviderProps) => {
  const [values, setValues] = useState<{ [k: string]: Decimal }>(initialState?.values ?? {});
  const [calculated, setCalculated] = useState<{ [k: string]: Decimal }>({});
  const [units, setUnits] = useState<{ [k: string]: string }>(initialState?.units ?? {});
  const [dimensions, setDimensions] = useState<{ [k: string]: string }>(initialState?.dimensions ?? {});
  const [scales, setScales] = useState<{ [k: string]: number }>(initialState?.scales ?? {});
  const [globalScale, setGlobalScale] = useState<number>(initialState?.globalScale ?? 4);
  const [significantDigits, setSignificantDigits] = useState<{ [k: string]: number }>(initialState?.significantDigits ?? {});
  const [globalSignificantDigits, setGlobalSignificantDigits] = useState<number>(initialState?.globalSignificantDigits ?? 12);

  const getters = useMemo(() => (
    new Proxy({}, {
      get(_target: any, name: string) {
        if (typeof values[name] !== 'undefined') {
          return values[name];
        }

        if (typeof calculated[name] !== 'undefined') {
          return calculated[name];
        }

        if (initialState?.calculations?.[name]) {
          const value = initialState.calculations[name]!(getters);
          if (value) {
            setCalculated((calculated) => ({
              ...calculated,
              [name]: value,
            }));
          }
          return value;
        }

        return undefined;
      }
    })
  ), [values, calculated, initialState?.calculations, setCalculated]);

  const getValue = useCallback((name: string) => (
    getters[name]
  ), [getters, values, calculated, initialState?.calculations, setCalculated]);
  const setValue = useCallback((name: string, value: Decimal) => {
    setCalculated({});
    setValues((values) => ({
      ...values,
      [name]: value,
    }))
  }, [setValues, setCalculated]);
  const setUnit = useCallback(fieldMutator(setUnits), []);
  const setDimension = useCallback(fieldMutator(setDimensions), []);
  const setScale = useCallback(fieldMutator(setScales), []);
  const setSignificantDigit = useCallback(fieldMutator(setSignificantDigits), []);

  const controller: CalculatorContextController = {
    values,
    getValue,
    setValue,
    units,
    setUnit,
    dimensions,
    setDimension,
    scales,
    setScale,
    globalScale,
    setGlobalScale,
    significantDigits,
    setSignificantDigit,
    globalSignificantDigits,
    setGlobalSignificantDigits,
    calculations: initialState?.calculations ?? {},
    calculated,
  };

  return (
    <CalculatorContext.Provider value={controller}>
      {children}

      <details>
        <summary>Debug</summary>

        Values:
        <pre>
          {JSON.stringify(values, null, 2)}
        </pre>
        Calculated:
        <pre>
          {JSON.stringify(calculated, null, 2)}
        </pre>
        Units:
        <pre>
          {JSON.stringify(units, null, 2)}
        </pre>
        Dimensions:
        <pre>
          {JSON.stringify(dimensions, null, 2)}
        </pre>
        Scales:
        <pre>
          {JSON.stringify(scales, null, 2)}
        </pre>
        Significant Digits:
        <pre>
          {JSON.stringify(significantDigits, null, 2)}
        </pre>

        Global Scale: {`${globalScale}`} <br/>
        Global Significant Digits: {`${globalSignificantDigits}`}
      </details>
    </CalculatorContext.Provider>
  )
}

export const useCalculatorContext = () => useContext(CalculatorContext);
