import React, { useCallback, useEffect } from 'react';
import { useEngine } from '../calculator';
import { replacer } from '../../../utils/json';

const ProductTab = () => {
  const engine = useEngine();

  const onUpdate = useCallback(() => {
    this.forceUpdate();
  }, []);
  useEffect(
    () => {
      engine.addUpdateListener(onUpdate);
      return () => {
        engine.removeUpdateListener(onUpdate);
      }
    },
    [engine, onUpdate]
  )

  const style = {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center'
  }
  return (
    <div className="product-tab" style={ style }>
      <pre>
      {
        JSON.stringify(engine.product_lines, replacer(['calculator']), 4)
      }
      </pre>
    </div>
  );
}

export default ProductTab;