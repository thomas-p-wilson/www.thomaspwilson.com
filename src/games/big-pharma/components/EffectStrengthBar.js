import React from 'react';
import classnames from 'classnames';

const EffectStrengthBar = ({ concentration, start, end, peak, cure=false, benefit=false }) => {
  const range = [...Array(20).keys()];

  return (
    <div className="bar">
      {
        range.map((c, i) => (
          <div key={ i } title={ i+1 } className={ classnames('segment', {
            boundary: i >= start-1 && i <= end-1,
            concentration: i === concentration-1,
            peak: i === peak,
          }) } />
        ))
      }
    </div>
  )
}

export default EffectStrengthBar;
