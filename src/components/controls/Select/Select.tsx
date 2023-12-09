import { DropdownBase } from '@/components/Dropdown/DropdownBase'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import clsx from 'clsx'
import { useCallback, useMemo, useState } from 'react'

export type SelectItem = {
  text: string
  value: any
}

export type SelectProps = {
  name: string
  items: Array<SelectItem>
  value: any
  onChange: (name: string, value: any) => void
  disabled?: boolean
}

export type SelectItemComponentProps = SelectItem & {
  name: SelectProps['name']
  onChange: SelectProps['onChange']
}

export const SelectItemComponent = ({
  name,
  text,
  value,
  onChange,
}: SelectItemComponentProps) => {
  const _onChange = useCallback(() => {
    onChange(name, value);
  }, []);
  return (
    <a
      className="dropdown-item"
      onClick={_onChange}
    >
      {text}
    </a>
  )
}

export const Select = ({
  name,
  items,
  value,
  onChange,
  disabled,
}: SelectProps) => {
  const [open, setOpen] = useState<boolean>(false);

  // Visibility
  const onClose = useCallback(() => {
    setOpen(false);
  }, []);
  const { ref } = useOnClickOutside(onClose);
  const onToggle = useCallback(() => setOpen((open) => (!open)), []);

  const _onChange = useCallback((name: string, value: any) => {
    onChange(name, value);
    onClose();
  }, [onChange]);
  const _value = useMemo(() => (items.find((i) => (i.value === value))), [items, value]);

  const control = useMemo(() => (
    <button className={clsx('unit-selector btn btn-outline-secondary', { 'dropdown-toggle': !disabled && onChange })}
      type="button"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded={open}
      onClick={onToggle}
      disabled={disabled || !onChange}
    >
      {_value?.text}{/*this.renderExponent()*/}
    </button>
  ), [disabled, onChange, open, onToggle, value, items]);
  const content = useMemo(() => (
    <>
      {items.map(({ text, value }) => (
        <SelectItemComponent
          name={name}
          text={text}
          value={value}
          onChange={_onChange}
        />
      ))}
    </>
  ), [items, name, _onChange]);

  return (
    <DropdownBase
      control={control}
      content={content}
      open={open}
      ref={ref}
    />
  );
}
