import React, { useCallback, useEffect, useState } from 'react';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import DropZone from '../games/big-pharma/components/DropZone';
import { Calculator, useCalculator, useEngine } from '../games/big-pharma/calculator';
import Tabs from '../components/Tabs';
import ProductTab from '../games/big-pharma/tabs/ProductTab';
import CureTab from '../games/big-pharma/tabs/CureTab';
import EffectTab from '../games/big-pharma/tabs/EffectTab';
import IngredientTab from '../games/big-pharma/tabs/IngredientTab';
import DebugTab from '../games/big-pharma/tabs/DebugTab';


const tabs = [{
  title: 'Products',
  component: ProductTab,
}, {
  title: 'Cures',
  component: CureTab,
}, {
  title: 'Effects',
  component: EffectTab,
}, {
  title: 'Ingredients',
  component: IngredientTab,
}, {
  title: 'Debug',
  component: DebugTab,
}];

const BigPharmaCalculator = () => {
  const [save, setSave] = useState(null);
  const calculator = useCalculator();
  const engine = useEngine();

  const onDrop = useCallback(([file]) => {
    if (file.type && !file.type.startsWith('application/x-spss-sav')) {
      console.log('File is not a save file.', file.type, file);
      return
    }

    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      const data = JSON.parse(event.target.result);
      setSave(data);
      calculator.setSaveData(data);
      calculator.engine.computeBasicProductLines();
    });
    reader.readAsText(file);
  }, [calculator]);

  useEffect(() => {
    if (!engine && save) {
      calculator.setSaveData(save);
      calculator.engine.computeBasicProductLines();
    }
  }, [calculator, engine, save]);

  if (!engine) {
    return (<DropZone onDrop={ onDrop } />);
  }
  return (
      <Tabs tabs={ tabs } />
  );
}

const BigPharmaCalculatorPage = () => (
  <Calculator>
      <Header />
      <div className="calculators-page big-pharma">
          <BigPharmaCalculator />
      </div>
      <Footer />
  </Calculator>
);
export default BigPharmaCalculatorPage;
