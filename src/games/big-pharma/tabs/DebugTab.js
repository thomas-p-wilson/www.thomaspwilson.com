import React from 'react';
import { useEngine } from '../calculator';

const DebugTab = ({ save }) => {
  const engine = useEngine();
  return (
    <>
      {
        Object.keys(engine.save).map((key) => (
          <details key={ key }>
            <summary>{ key }</summary>

            <pre>
              { JSON.stringify(engine.save[key], null, 4) }
            </pre>
          </details>
        ))
      }
    </>
  )
};

export default DebugTab;
