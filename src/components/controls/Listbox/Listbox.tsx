import { DropdownBase } from '@/components/Dropdown/DropdownBase'
import { useMemo } from 'react'

export type ListboxProps = {

}

export const Listbox = () => {
  const control = useMemo(() => (
    <span>test</span>
  ), []);
  const content = useMemo(() => (
    <ul>
      <li>Millimetres (mm)</li>
      <li>Centimetres (cm)</li>
      <li>Metres (m)</li>
      <li>Inches (in)</li>
      <li>Feet (ft)</li>
      <li>Feet / Inches (ft/in)</li>
      <li>Metres / Centimetres (m/cm)</li>
    </ul>
  ), []);

  return (
    <DropdownBase
      className="listbox"
      control={control}
      content={content}
    />
  )
}
