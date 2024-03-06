import { Decimal } from '@/types/Decimal'
import { PortalModal } from '../Modal/PortalModal'
import { useCallback, useState } from 'react';
import './PresetChooser.scss';

export type PresetChoice = {
  name: string,
  values: { [k: string]: Decimal }
};

export type PresetChooserProps = {
  choice?: string
  choices: Array<PresetChoice>
  onSelect: (name: string) => void
}

export type PresetChoiceItemProps = PresetChoice & {
  onSelect: PresetChooserProps['onSelect']
}

export const PresetChoiceItem = ({
  name,
  values,
  onSelect,
}: PresetChoiceItemProps) => {
  const _onSelect = useCallback(() => {
    onSelect(name);
  }, []);
  return (
    <li onClick={_onSelect}>
      <strong>{name}</strong>
      {
        Object.keys(values).map((key) => (
          <small key={key}>{key} - {values[key]!.toString()}</small>
        ))
      }
    </li>
  );
}

export const PresetChooser = ({
  choice,
  choices,
  onSelect,
}: PresetChooserProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);
  const onClose = useCallback(() => {
    setOpen(false);
  }, []);
  const _onSelect = useCallback((name: string) => {
    setOpen(false);
    onSelect(name);
  }, [])

  return (
    <>
      <button onClick={onOpen} className="btn preset-chooser-btn">Presets</button>
      {choice && (<abbr>{choice}</abbr>)}
      {open && (
        <PortalModal onClose={onClose} className="preset-chooser">
          <ul>
            {
              choices.map(({ name, values }) => (
                <PresetChoiceItem
                  key={name}
                  name={name}
                  values={values}
                  onSelect={_onSelect}
                />
              ))
            }
          </ul>
        </PortalModal>
      )}
    </>
  )
}
