export type LabelProps = {
  children: React.ReactNode
}

export const Label = ({ children }: LabelProps) => (
  <label>{children}</label>
);
