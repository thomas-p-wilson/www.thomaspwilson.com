import React, { useState } from 'react';
import classnames from 'classnames';

const DropZone = ({ onDrop, style }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e.dataTransfer.files);
    setIsOver(false);
  };
  return (
    <div className={ classnames('drop-zone', { over: isOver }) }
        onDrop={ handleDrop }
        onDragOver={ handleDragOver }
        onDragEnter={ handleDragEnter }
        onDragLeave={ handleDragLeave }
        role="textbox"
        tabIndex={0}
        style={ style || {} }>
      <div>
        <img src="/img/games/big-pharma/logo.png" alt="Big Pharma Logo" style={{ display: 'block', width: '8%', margin: '0 auto' }} />
      </div>
      <p style={{ textAlign: 'center' }}>Drag a save here to analyze...</p>
    </div>
  );
};

export default DropZone;
