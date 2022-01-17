import React from 'react';
import { useEngine } from '../calculator';
import EffectList from '../components/EffectList';

const EffectTab = () => {
  const engine = useEngine();
  return (
    <>
      <h2>Cure Effect</h2>
      <EffectList effects={ engine.cureList } />

      <h2>Side Effects</h2>
      <EffectList effects={ engine.sideeffectList } />

      <h2>Booster Effect</h2>
      <EffectList effects={ engine.boosterList } />
    </>
  );
}

export default EffectTab;
