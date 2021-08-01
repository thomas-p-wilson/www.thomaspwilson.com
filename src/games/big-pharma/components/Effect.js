/* eslint-disable jsx-a11y/mouse-events-have-key-events, jsx-a11y/interactive-supports-focus */

import React, { useState } from 'react';
import classnames from 'classnames';
import EffectStrengthBar from './EffectStrengthBar';
import Tooltip from './Tooltip';
import EffectReaction from './EffectReaction';
import './effects.scss';

const Effect = ({ id, level, catalyst, reaction, ...props }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const active = props.concentration < props.end && props.concentration > props.start;
  return (
    <div className={ classnames('effect', {
      'effect-active': active,
      'effect-sideeffect': !props.cure && !props.booster,
      'effect-booster': props.booster,
      'effect-cure': props.cure,
      [`level-${level}`]: true,
    }) }
        onMouseOver={ (ev) => (setIsTooltipVisible(true)) }
        onMouseOut={ (ev) => (setIsTooltipVisible(false)) }
        role="button">
      { id && (
        <>
          <div className="left">
            <p className="title">{ id }{ props.cure ? ` (lvl ${ level })` : '' }</p>
            <EffectStrengthBar { ...props } />
          </div>
          <div className="catalyst-logo">
            { catalyst && (<img src={`/img/games/big-pharma/${catalyst}.png`} alt="catalyst" />) }
          </div>
          <Tooltip visible={ isTooltipVisible } offsetX={ -335 } offsetY={ -165 } className="effect-tooltip">
            <EffectReaction reaction={ reaction } />
          </Tooltip>
        </>
      ) }
    </div>
  )
};

export default Effect;
