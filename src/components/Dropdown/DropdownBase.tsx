import clsx from 'clsx';
import React, { ForwardedRef } from 'react';
import { Card } from '@/components/Card/Card';
import './DropdownBase.scss';

export type DropdownProps = {
  /**
   * The control element, which is always to be displayed.
   */
  control: React.ReactElement
  /**
   * The box contents to display when the dropdown is open.
   */
  content: React.ReactElement
  /**
   * True if the box is open, false otherwise.
   */
  open?: boolean
  /**
   * If true, indicates the field is disabled. Note that there is no strict
   * requirement to set disabled on the Dropdown instance. It is perfectly
   * acceptable for a higher-order component to manage disabled states and
   * styling.
   */
  disabled?: boolean
  className?: React.ComponentPropsWithoutRef<'div'>['className']
};

/**
 * The Dropdown component provides a mechanism to add dropdown-like
 * functionality to many different components. The dropdown requires a
 * `control` attribute and a `content` attribute in order to display
 * properly. These represent the element that controls opening and closing,
 * and the element that is displayed when opened, respectively.
 */
export const DropdownBase = React.forwardRef(({
  className,
  control,
  content,
  open,
  disabled,
}: DropdownProps, ref: ForwardedRef<any>) => {
  return (
    <div
      className={clsx('dropdown', className, { disabled })}
      aria-haspopup="listbox"
      aria-expanded={open}
      role="combobox"
      ref={ref}
    >
      <div className="control">
        {control}
      </div>
      <Card className={clsx('dropdown-content floating unpadded', { open })}>
        {content}
      </Card>
    </div>
  );
})
