export default class Ingredient {
  constructor(calculator, name, effects, concentration) {
    this.calculator = calculator;
    this.name = name;
    this.effects = effects;
    this.concentration = concentration;

    // console.log('New Ingredient: ', this);
  }
}
