import React from 'react';
import EffectList from './EffectList';
import ConcentrationLabel from './ConcentrationLabel';
// import { useEngine } from '../calculator';

const style = {
    background: '#222729',
    margin: '2px',
    position: 'relative'
};

const Ingredient = ({ name, concentration, effects, effectData }) => {
  // const engine = useEngine();
  const _effects = effects.map((e) => (effectData.find((e1) => (e1.id === e))));
  return (
      <div style={ style }>
          <p style={{ background: '#1c2022', color: 'white', padding: '8px' }}>{ name }</p>

          <div className="concentration-tag" style={{ left: (concentration * 12) - 12 + 'px' }}>
            <ConcentrationLabel start={ concentration } />
          </div>
          <EffectList effects={ _effects } concentration={ concentration } style={{ flexDirection: 'column' }} />
      </div>
  )
}

export default Ingredient;
