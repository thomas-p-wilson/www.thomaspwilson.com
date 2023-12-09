import { createPortal } from 'react-dom';
import { Modal, ModalProps } from './Modal';

export const PortalModal = (props: ModalProps) => (
  createPortal(
    <Modal {...props} />,
    document.body,
  )
)
