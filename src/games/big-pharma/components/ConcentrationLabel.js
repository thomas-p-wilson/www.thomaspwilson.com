import React from 'react';

export default ({ start, end }) => (
  <span className="concentration-label">
    <span>{ start }{ end && (<>- { end }</>) } </span><img src="/img/games/big-pharma/concentration.png" alt="concentration" />
  </span>
);
