import { useCallback, useState } from 'react';
import { PortalModal } from '../Modal/PortalModal';
import { ModalProps } from '../Modal/Modal';
import { useCalculatorContext } from '../CalculatorContext/CalculatorContext';
import './CalculatorSettings.scss';
import { NumberInput } from '../controls/NumberInput/NumberInput';
import { Link } from 'react-router-dom';

export const CalculatorSettingsModal = (props: ModalProps) => {
  const controller = useCalculatorContext();
  const onChangeGlobalSignificantDigits = useCallback((_name: string, value: number) => {
    controller.setGlobalSignificantDigits(value);
  }, [controller.setGlobalSignificantDigits]);
  const onChangeGlobalScale = useCallback((_name: string, value: number) => {
    controller.setGlobalScale(value);
  }, [controller.setGlobalScale]);
  return (
    <PortalModal {...props} className="calculator-settings-modal">
      <label>
        Global Significant Digits:

        <NumberInput
          name="globalSignificantDigits"
          onChange={onChangeGlobalSignificantDigits}
          value={controller.globalSignificantDigits}
          number
        />
      </label>

      <label>
        Global Scale:

        <NumberInput
          name="globalScale"
          onChange={onChangeGlobalScale}
          value={controller.globalScale}
          number
        />
      </label>
    </PortalModal>
  );
}

export const CalculatorSettings = () => {
  const [open, setOpen] = useState<boolean>(false);

  const onClick = useCallback(() => {
    setOpen(true);
  }, []);
  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div className="calculator-settings-bar">
      <Link to="/calculators">Back</Link>
      <button onClick={onClick}>Calculator Settings</button>

      {open && (<CalculatorSettingsModal onClose={onClose} />)}
    </div>
  );
}
