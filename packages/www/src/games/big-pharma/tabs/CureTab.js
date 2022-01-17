import React from 'react';
import { useEngine } from '../calculator';
import CureLineage from '../components/CureLineage';

const CureTab = () => {
  const engine = useEngine();
  return (
    <div className="cure-tab">
      {
        Object.keys(engine.families).map((family) => (
          <CureLineage key={ family } family={ engine.families[family] } />
        ))
      }
    </div>
  )
}

export default CureTab;
