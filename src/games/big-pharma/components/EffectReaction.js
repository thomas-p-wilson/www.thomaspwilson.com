import React from 'react';
import ConcentrationLabel from './ConcentrationLabel';

const EffectReaction = ({ reaction }) => {
  if (!reaction) {
    return null;
  }
  const name = Object.keys(reaction)[0];
  const r = Object.values(reaction)[0];
  return (
    <div className="effect-reaction">
      <p className="title">{ name }</p>
      <div>
        <div className="prerequisites">
          <p className="title">PRE-REQUIREMENTS:</p>
          <p className="requirements">
            <ConcentrationLabel start={ r.conc[0] } end={ r.conc[1] } />
          </p>
          <p className="conc">CONC.</p>
        </div>
        <div className="machine">
          <p className="title">UPGRADE WITH:</p>
          <div><img src={ `/img/games/big-pharma/${ r.machine }.png` } alt={ r.machine } /></div>
          <p className="name">{ r.machine }</p>
        </div>
      </div>
    </div>
  );
}

export default EffectReaction;
