import { Decimal } from '@/types/Decimal';
import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState } from 'react';
import BigDecimal from 'decimal.js';
import { autovivify, get } from '@/utils/autovivify';

const createProxy = (
  namespace: string[] | undefined,
  state: CalculatorStateShape,
  setCalculated: React.Dispatch<React.SetStateAction<ValueContainer<BigDecimal>>>,
  parent: any,
) => (
  new Proxy({}, {
    get(_target: any, name: string): any {
      console.log('STate: ', state);
      const ns = namespace ?? [];
      const path = ns.concat(name);
      // console.log('Find for %s', path.join('.'));

      if (name === 'parent') {
        // console.log('GET PARENT');
        return parent;
      }

      if (state.namespaces.includes(name) && !namespace.includes(name)) {
        return createProxy(ns.concat(name), state, setCalculated, this);
      }

      const explicit = get(state.values, path);
      if (typeof explicit !== 'undefined' && explicit !== null) {
        // console.log('  Found %s for %s in explicit values', explicit, path.join('.'));
        return explicit;
      }

      if (typeof get(state.calculated, path) !== 'undefined') {
        // console.log('  Found %s for %s in calculated values', get(state.calculated, path), path.join('.'));
        return get(state.calculated, path)
      }

      if (state.calculations && typeof get(state.calculations, path) === 'function') {
        const value = get(state.calculations, path)!(createProxy(ns, state, setCalculated, this));
        if (value) {
          // console.log('  Found %s for %s via calculation', value, path.join('.'));
          setCalculated((calculated) => (
            autovivify(calculated, path, value)
          ));
        }
        return value;
      }

      // console.log('  Found nothing for %s', path.join('.'));
      return undefined;
    }
  })
)

export type FieldCalculator = (values: CalculatorStateShape['values'] & { parent: any }) => (BigDecimal | undefined)

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
  namespaces: string[]
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
  proxy: object
}

export const CalculatorContext = createContext<CalculatorContextController>(undefined!);

export type CalculatorContextProviderProps = {
  initialState?: Partial<CalculatorStateShape>
  children: any
}

const fieldMutator = <T,>(setter: React.Dispatch<React.SetStateAction<ValueContainer<T>>>) => (name: string, value: T, namespace: string[] | undefined) => {
  setter((container) => (autovivify(container, (namespace ?? []).concat([name]), value)));
}

export const CalculatorContextProvider = ({
  initialState,
  children
}: CalculatorContextProviderProps) => {
  const [render] = useReducer(x => x + 1, 0);
  const [state, setState] = useState<CalculatorStateShape>({
    namespaces: [],
    values: {},
    units: {},
    dimensions: {},
    scales: {},
    globalScale: 4,
    significantDigits: {},
    globalSignificantDigits: 12,
    calculations: {},
    calculated: {},
    ...initialState ?? {}
  });

  const valueContainerMutator = useMemo(() => <K extends keyof CalculatorStateShape,>(
    field: K
  ): React.Dispatch<React.SetStateAction<CalculatorStateShape[K]>> => (value) => {
    if (typeof value === 'function') {
      setState((state) => autovivify(state, [field], value(state[field])))
    } else {
      setState((state) => autovivify(state, [field], value));
    }
  }, []);

  const setNamespaces = useMemo(() => valueContainerMutator('namespaces'), []);
  const setValues = useMemo(() => valueContainerMutator('values'), []);
  const setCalculated = useMemo(() => valueContainerMutator('calculated'), []);
  const setCalculations = useMemo(() => valueContainerMutator('calculations'), []);
  const setUnits = useMemo(() => valueContainerMutator('units'), []);
  const setDimensions = useMemo(() => valueContainerMutator('dimensions'), []);
  const setScales = useMemo(() => valueContainerMutator('scales'), []);
  const setGlobalScale = useMemo(() => valueContainerMutator('globalScale'), []);
  const setSignificantDigits = useMemo(() => valueContainerMutator('significantDigits'), []);
  const setGlobalSignificantDigits = useMemo(() => valueContainerMutator('globalSignificantDigits'), []);

  const proxy = useMemo(() => (createProxy([], state, setCalculated, undefined)), [state, setCalculated]);
  const getValue = useCallback((name: string, namespace: string[] | undefined) => {
    return createProxy(namespace, state, setCalculated, undefined)[name]
  }, [state, setCalculated]);

  const setValue = useCallback((name: string, value: Decimal, namespace: string[] | undefined) => {
    setCalculated({});
    setValues((values) => (autovivify(values, (namespace ?? []).concat([name]), value)));
  }, [setValues, setCalculated]);
  const setUnit = useMemo(() => fieldMutator(setUnits), [setUnits, setCalculated]);
  const setDimension = useMemo(() => fieldMutator(setDimensions), [setDimensions]);
  const setScale = useMemo(() => fieldMutator(setScales), [setScales]);
  const setSignificantDigit = useMemo(() => fieldMutator(setSignificantDigits), [setSignificantDigits]);

  const registerNestedCalculator = useCallback((ns: string, initialState: CalculatorStateShape) => {
    console.log('Register ns ', ns, ' with state ', initialState);
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

  const controller: CalculatorContextController = useMemo(() => ({
    render,
    ...state,
    getValue,
    setValue,
    setUnit,
    setDimension,
    setScale,
    setGlobalScale,
    setSignificantDigit,
    setGlobalSignificantDigits,
    registerNestedCalculator,
    proxy,
  }), [
    render,
    getValue,
    setValue,
    setUnit,
    setDimension,
    setScale,
    setGlobalScale,
    setSignificantDigit,
    setGlobalSignificantDigits,
    registerNestedCalculator,
    proxy,
  ]);

  return (
    <CalculatorContext.Provider value={controller}>
      {children}

      <details>
        <summary>Debug</summary>

        Values:
        <pre>
          {JSON.stringify(state.values, null, 2)}
        </pre>
        Calculated:
        <pre>
          {JSON.stringify(state.calculated, null, 2)}
        </pre>
        Calculations:
        <pre>
          {JSON.stringify(state.calculations, null, 2)}
        </pre>
        Units:
        <pre>
          {JSON.stringify(state.units, null, 2)}
        </pre>
        Dimensions:
        <pre>
          {JSON.stringify(state.dimensions, null, 2)}
        </pre>
        Scales:
        <pre>
          {JSON.stringify(state.scales, null, 2)}
        </pre>
        Significant Digits:
        <pre>
          {JSON.stringify(state.significantDigits, null, 2)}
        </pre>

        Global Scale: {`${state.globalScale}`} <br/>
        Global Significant Digits: {`${state.globalSignificantDigits}`} <br/>
        Render: {`${render}`}
      </details>
    </CalculatorContext.Provider>
  )
}

export const useCalculatorContext = () => useContext(CalculatorContext);
