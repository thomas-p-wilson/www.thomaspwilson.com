import ProductLineStep from './product-line-step';

export default class ProductLineStart extends ProductLineStep {
  ingredient = null;

  constructor(ingredient) {
    super(ingredient.effects, ingredient.concentration);
    this.ingredient = ingredient;
  }
}
