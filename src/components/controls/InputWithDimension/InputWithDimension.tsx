import { InputGroup } from '../InputGroup/InputGroup'
import { UnitSelector } from '../UnitSelector/UnitSelector'
import { NumberInput } from '../NumberInput/NumberInput'
import { Decimal } from '@/types/Decimal'
import { WithUnit } from '@/types/WithUnit'
import { WithDimension } from '@/types/WithDimension'

export type InputWithDimensionProps = WithUnit & WithDimension & {
  /**
   * Name of the field
   */
  name: string
  /**
   * The label to display at the beginning of the field
   */
  label: string
  /**
   * The value of the field
   */
  value: Decimal | undefined

  // Unit
  onChange?: any
  onChangeUnit?: (name: string, value: string) => void
  onChangeDimension?: (name: string, value: string) => void
  disabled?: boolean
}
/**
 *
 */
export const InputWithDimension = ({
  name,
  label,
  value,
  units,
  unit,
  unitExponent,
  dimensions,
  dimension,
  dimensionExponent,
  onChange,
  onChangeUnit,
  onChangeDimension,
  disabled,
}: InputWithDimensionProps) => (
  <InputGroup disabled={disabled}>
    {label && (<label htmlFor={name}>{label}</label>)}
    <NumberInput
      name={name}
      value={value}
      units={units}
      unit={unit}
      unitExponent={unitExponent}
      dimensions={dimensions}
      dimension={dimension}
      dimensionExponent={dimensionExponent}
      onChange={onChange}
      disabled={disabled}
    />
    {
      (unit && units) && (
        <UnitSelector
          name={name}
          value={unit}
          units={units}
          exponent={unitExponent}
          onChange={onChangeUnit}
        />
      )
    }
    {
      (dimension && dimensions) && (
        <UnitSelector
          name={name}
          value={dimension}
          units={dimensions}
          exponent={dimensionExponent}
          onChange={onChangeDimension}
        />
      )
    }
  </InputGroup>
);
