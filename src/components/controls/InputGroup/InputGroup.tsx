import clsx from 'clsx';
import './InputGroup.scss';

export type InputGroupProps = {
  /**
   * The children to display as a single input
   */
  children: any

  disabled?: boolean
}

export const InputGroup = ({
  children,
  disabled,
}: InputGroupProps) => (
  <div className={clsx("input-group", { disabled })}>
    {children}
  </div>
);
