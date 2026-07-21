import { MeasureFile } from '@/units/MeasureFile';
import { InputGroup } from '../InputGroup/InputGroup'
import { NumberInput, NumberInputProps } from '../NumberInput/NumberInput'
import { UnitSelector } from '../UnitSelector/UnitSelector';
import { Decimal } from '@/types/Decimal';


type Units = {
  units: MeasureFile
  unit: string // TODO keyof T['measure']
  unitExponent?: Decimal
  onChangeUnit: (name: string, value: string) => void
} | {
  units?: never
  unit?: never
  unitExponent?: never
  onChangeUnit?: never
}

type Dimension = {
  dimensions: MeasureFile
  dimension: string
  dimensionExponent?: Decimal
  onChangeDimension: (name: string, value: string) => void
} | {
  dimensions?: never
  dimension?: never
  dimensionExponent?: never
  onChangeDimension?: never
}

/**
 * If the field is a number, require number-related options
 */
type NumberFieldProps = {
  type: 'number' | undefined
} & NumberInputProps<false> & Units & Dimension;

type FieldTypeProps = NumberFieldProps;

export type FieldProps = {
  /**
   * The name of the field as specified in a submitted form
   */
  name: string
  /**
   * The label given to the field to show the user the purpose of the field
   */
  label?: string
  /**
   * If true, disables the field so it cannot be edited
   */
  disabled?: boolean
  /**
   * The type of the field
   */
  type?: 'number' | 'text' | 'select'
} & FieldTypeProps

/**
 * Display a simple field. If the label is provided, display it at the
 * beginning. If the unit is provided, display the unit selector at the
 * end.
 */
export const Field = ({
  name,
  label,
  disabled,
  type = 'number',
  ...props
}: FieldProps) => (
  <InputGroup disabled={disabled}>
    {label && (<label htmlFor={name}>{label}</label>)}
    {type === 'number' && (
      <NumberInput
        name={name}
        value={props.value}
        units={props.units}
        unit={props.unit}
        unitExponent={props.unitExponent}
        dimensions={props.dimensions}
        dimension={props.dimension}
        dimensionExponent={props.dimensionExponent}
        onChange={props.onChange}
        disabled={disabled}
      />
    )}
    {
      (props.unit && props.units) && (
        <UnitSelector
          name={name}
          value={props.unit}
          units={props.units}
          exponent={props.unitExponent}
          onChange={props.onChangeUnit}
        />
      )
    }
    {
      (props.dimension && props.dimensions) && (
        <UnitSelector
          name={name}
          value={props.dimension}
          units={props.dimensions}
          exponent={props.dimensionExponent}
          onChange={props.onChangeDimension}
        />
      )
    }
  </InputGroup>
)
