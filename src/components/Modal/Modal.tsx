import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { Card } from '../Card/Card';
import { Overlay } from '../Overlay/Overlay';

export type ModalProps = {
  children?: React.ReactNode
  className?: string
  onClose: () => void
}

export const Modal = ({
  children,
  className,
  onClose,
}: ModalProps) => {
  const { ref } = useOnClickOutside(onClose);

  return (
    <Overlay>
      <Card ref={ref} className={className}>
        {children}
      </Card>
    </Overlay>
  );
}
