import { Decimal } from '@/types/Decimal';
import { createContext, useCallback, useContext, useReducer, useRef, useState } from 'react';
import BigDecimal from 'decimal.js';
import { autovivify, get } from '@/utils/autovivify';

const createProxy = (
  namespace: string[] | undefined,
  values: ValueContainer,
  calculated: ValueContainer,
  calculations: ValueContainer<FieldCalculator>,
  initialState: Partial<CalculatorStateShape> | undefined,
  setCalculated: React.Dispatch<React.SetStateAction<ValueContainer<BigDecimal>>>,
  namespaces: string[],
) => (
  new Proxy({}, {
    get(_target: any, name: string): any {
      const ns = namespace ?? [];
      const path = ns.concat(name);
      console.group();
      console.trace();

      if (name in namespaces && !(name in (namespace ?? []))) {
        return createProxy(ns.concat(name), values, calculated, calculations, initialState, setCalculated, namespaces);
      }

      if (typeof get(values, path) !== 'undefined') {
        console.log('  Found %s for %s in explicit values', get(values, path), path.join('.'));
        return get(values, path);
      }

      if (typeof get(calculated, path) !== 'undefined') {
        console.log('  Found %s for %s in calculated values', get(calculated, path), path.join('.'));
        return get(calculated, path)
      }

      if (calculations && typeof get(calculations, path) === 'function') {
        const value = get(calculations, path)!(createProxy(ns, values, calculated, calculations, initialState, setCalculated, namespaces));
        if (value) {
          console.log('  Found %s for %s via calculation', value, path.join('.'));
          setCalculated((calculated) => (
            autovivify(calculated, path, value)
          ));
        }
        return value;
      }

      console.log('  Found nothing for %s', path.join('.'));
      console.groupEnd();
      return undefined;
    }
  })
)

export type FieldCalculator = (values: CalculatorStateShape['values']) => (BigDecimal | undefined)

export type ValueContainer<T = Decimal> = {
  [k: string]: T
}

export type Field = {
  name: string
  value: string
  unit: string
  dimension: string
}

export type CalculatorStateShape = {
  values: ValueContainer
  units: ValueContainer<string>
  dimensions: ValueContainer<string>
  scales: ValueContainer<number>
  globalScale: number
  significantDigits: ValueContainer<number>
  globalSignificantDigits: number
  calculations: ValueContainer<FieldCalculator>
  calculated: ValueContainer
}

export type CalculatorContextController = CalculatorStateShape & {
  render: number
  getValue: (name: string, namespace?: string[]) => BigDecimal | undefined
  setValue: (name: string, value: Decimal, namespace?: string[]) => void
  setUnit: (name: string, value: string, namespace?: string[]) => void
  setDimension: (name: string, value: string, namespace?: string[]) => void
  setScale: (name: string, value: number, namespace?: string[]) => void
  setGlobalScale: (value: number) => void
  setSignificantDigit: (name: string, value: number, namespace?: string[]) => void
  setGlobalSignificantDigits: (value: number) => void
  registerNestedCalculator: (ns: string, initialState: CalculatorStateShape) => void
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
  const [render, forceRender] = useReducer(x => x + 1, 0);
  const state = useRef<Partial<CalculatorStateShape>>(initialState!);
  // const [namespaces, setNamespaces] = useState<string[]>([]);
  // const [values, setValues] = useState<ValueContainer>(initialState?.values ?? {});
  // const [calculated, setCalculated] = useState<ValueContainer>({});
  // const [calculations, setCalculations] = useState<ValueContainer<FieldCalculator>>(initialState?.calculations ?? {});
  // const [units, setUnits] = useState<ValueContainer<string>>(initialState?.units ?? {});
  // const [dimensions, setDimensions] = useState<ValueContainer<string>>(initialState?.dimensions ?? {});
  // const [scales, setScales] = useState<ValueContainer<number>>(initialState?.scales ?? {});
  // const [globalScale, setGlobalScale] = useState<number>(initialState?.globalScale ?? 4);
  // const [significantDigits, setSignificantDigits] = useState<ValueContainer<number>>(initialState?.significantDigits ?? {});
  // const [globalSignificantDigits, setGlobalSignificantDigits] = useState<number>(initialState?.globalSignificantDigits ?? 12);

  const getValue = useCallback((name: string, namespace: string[] | undefined) => {
    return createProxy(namespace, values, calculated, calculations, initialState, setCalculated, namespaces)[name]
  }, [values, calculated, calculations, setCalculated]);
  const setValue = useCallback((name: string, value: Decimal, namespace: string[] | undefined) => {
    setCalculated({});
    setValues((values) => (autovivify(values, (namespace ?? []).concat([name]), value)))
  }, [setValues, setCalculated]);
  const setUnit = useCallback(fieldMutator(setUnits), []);
  const setDimension = useCallback(fieldMutator(setDimensions), []);
  const setScale = useCallback(fieldMutator(setScales), []);
  const setSignificantDigit = useCallback(fieldMutator(setSignificantDigits), []);

  const registerNestedCalculator = useCallback((ns: string, initialState: CalculatorStateShape) => {
    setNamespaces((namespaces) => (
      namespaces.concat([ns])
    ));
    if (initialState.values) {
      setValues((values) => (
        autovivify(values, [ns], initialState.values)
      ));
    }
    if (initialState.calculated) {
      setCalculated((calculated) => (
        autovivify(calculated, [ns], initialState.calculated)
      ));
    }
    if (initialState.calculations) {
      setCalculations((calculations) => (
        autovivify(calculations, [ns], initialState.calculations)
      ));
    }
    if (initialState.units) {
      setUnits((units) => (
        autovivify(units, [ns], initialState.units)
      ));
    }
    if (initialState.dimensions) {
      setDimensions((dimensions) => (
        autovivify(dimensions, [ns], initialState.dimensions)
      ));
    }
  }, [setValues, setCalculated, setCalculations, setUnits, setDimensions]);

  const controller: CalculatorContextController = {
    render,
    ...state.current,
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
    calculations,
    calculated,
    registerNestedCalculator,
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
        Calculations:
        <pre>
          {JSON.stringify(calculations, null, 2)}
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
