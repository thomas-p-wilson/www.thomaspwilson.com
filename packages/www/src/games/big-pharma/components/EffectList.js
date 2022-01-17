import React from 'react';
import Effect from './Effect';

const EffectList = ({ effects, concentration, style }) => {
  const _style = {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center',
    position: 'relative',
    zIndex: '0',
    ...style
  }
  return (
    <div style={ _style }>
      {
        effects.map((e = {}, i) => (
          <Effect key={ e.id || `null${i}` } concentration={ concentration } { ...e } />
        ))
      }
    </div>
  );
}

export default EffectList;
