import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { MeasureFile } from '@/units/MeasureFile';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { DropdownBase } from '@/components/Dropdown/DropdownBase';
import './UnitSelector.scss';
import { Decimal } from '@/types/Decimal';

export type UnitSelectorProps = {
  name: string
  value: string
  units: MeasureFile
  disabled?: boolean
  onChange?: (name: string, value: string) => void
  exponent?: Decimal
}

/**
 *
 */
export const UnitSelector = ({
  name,
  value,
  units,
  disabled,
  onChange,
  exponent,
}: UnitSelectorProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  // Visibility
  const onClose = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);
  const { ref } = useOnClickOutside(onClose);
  const onToggle = useCallback(() => setOpen((open) => (!open)), []);

  // Search
  const onSearch = useCallback((ev: any) => {
    setSearch(ev.target.value);
  }, []);

  // renderExponent() {
  //   if (this.props.exponent) {
  //     return (<sup>{this.props.exponent}</sup>);
  //   }
  // }

  const _onChange = useCallback((ev: any) => {
    onChange?.(name, ev.target.dataset.unit);
    onClose();
  }, [onChange]);

  const unitItems = useMemo(() => {
    if (!onChange) {
      return [];
    }
    return Object.keys(units.grouped)
      .reduce((result, groupName) => {
        return result
          .concat([(
            <span className="dropdown-header" key={groupName}>{groupName} ({Object.keys(units.grouped[groupName]!).length})</span>
          )])
          .concat(
            Object.keys(units.grouped[groupName]!)
              .filter((unitId) => (!search || units.measure[unitId]!.singular.toLowerCase().indexOf(search) !== -1))
              .map((unitId) => (
                <a
                  className="dropdown-item"
                  onClick={_onChange}
                  data-unit={unitId}
                  key={unitId}
                >
                  {units.measure[unitId]!.singular}{/*this.renderExponent()*/}
                </a>
              ))
          )
      }, [] as any[]);
  }, [search]);

  const obj = units.measure[value]!;
  if (!obj) {
    return (<div>Could not find {value}</div>)
  }

  const control = useMemo(() => (
    <button className={clsx('unit-selector btn btn-outline-secondary', { 'dropdown-toggle': !disabled && onChange })}
      type="button"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded={open}
      onClick={onToggle}
      disabled={disabled || !onChange}
    >
      {obj.symbol}{exponent && (<sup>{exponent.toString()}</sup>)}
    </button>
  ), [disabled, onChange, obj, open, onToggle]);
  const content = useMemo(() => (
    <>
      <input type="search" value={search} onChange={onSearch} placeholder="Search..." className="form-control" />
      <span className="dropdown-divider" />
      {unitItems}
    </>
  ), [search, onSearch, unitItems]);

  return (
    <DropdownBase
      control={control}
      content={content}
      open={open}
      ref={ref}
    />
  );
}
