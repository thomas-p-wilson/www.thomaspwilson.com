import React from 'react';
import { useEngine } from '../calculator';
import Ingredient from '../components/Ingredient';

const IngredientTab = () => {
  const engine = useEngine();
  const style = {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center'
  }
  console.log('Ingredients: ', engine.ingredientList)
  return (
    <div className="ingredient-tab" style={ style }>
      {
        engine.ingredientList.map(({ name, ...rest }) => (
          <Ingredient key={ name } name={ name } { ...rest } effectData={ engine.effectList } />
        ))
      }
    </div>
  );
}

export default IngredientTab;