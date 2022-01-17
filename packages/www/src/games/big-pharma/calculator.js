import React, { useContext } from 'react';
import Engine from './engine';

export const CalculatorContext = React.createContext({});
export const useCalculator = () => {
  const context = useContext(CalculatorContext)
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorContext.Provider')
  }
  return context
};

export const EngineContext = React.createContext({});
export const useEngine = () => {
  const context = useContext(EngineContext)
  if (context === undefined) {
    throw new Error('useEngine must be used within a EngineContext.Provider')
  }
  return context
};


export class Calculator extends React.Component {
  engine = null;

  setSaveData(save) {
    this.engine = new Engine(save);
    this.forceUpdate();
  }

  render() {
    return (
      <CalculatorContext.Provider value={ this }>
        <EngineContext.Provider value={ this.engine }>
          { this.props.children }
        </EngineContext.Provider>
      </CalculatorContext.Provider>
    );
  }
}
