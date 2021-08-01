import effects from '../effects';
import Effect from './effect';
import Ingredient from './ingredient';
import ProductLineStart from './product-line-start';

const rawEffectToObject = (calculator, {
  id,
  family,
  level,
  reaction,
  start,
  end,
  cure,
  booster,
  catalyst,
  peak,
}) => (
  new Effect(
    calculator,
    id,
    family,
    level,
    reaction,
    start,
    end,
    cure,
    booster,
    catalyst,
    peak,
  )
);

export default class Engine {
  /**
   * A map of ingredients, keyed by ingredient id.
   */
  ingredients = {}
  /**
   * A list of cures known to the player. Cures beyond this cannot be used.
   */
  knownCures = []
  /**
   * A map of effects, keyed by effect id. These effects include cures,
   * boosters, and side-effects.
   */
  effects = {}
  /**
   * A list of cure family names.
   */
  families = []


  constructor(save) {
    this.save = save;

    // Get ingredients
    this.ingredients = save.ingredients
        .map(({ name, effectIds: effects, concentration, baseValue }) => (new Ingredient(
          this,
          name,
          effects,
          concentration
        )))
        .reduce((res, i) => ({
          ...res,
          [i.name]: i,
        }), {});

    // Get all known effects
    // - boosters
    // - side-effects
    // - max cures
    this.effects = Object.values(this.ingredients)
        .map(({ effects }) => (effects))
        .flat()
        .filter((value, index, self) => (self.indexOf(value) === index))
        .filter((e) => (e))
        .map((id) => {
          const raw = effects.find((e) => (e.id === id));
          if (raw && raw.family) {
            return effects
                .filter((e) => (
                    e.family === raw.family
                    && e.level <= save.maxCureLevel
                ))
                .map((e) => (e.id));
          }
          return id;
        })
        .flat()
        .reduce((res, id) => ({
          ...res,
          [id]: rawEffectToObject(this, effects.find((e) => (e.id === id)) || {
            id,
            start: 1,
            end: 20,
            booster: true,
          })
        }), {});

    // Get cure families
    // const effectList = Object.values(effects);
    this.families = Array.from(
      new Set(
        Object.values(this.ingredients)
          .map((i) => (i.effects))
          .flat()
          .filter((e) => (e))
          .map((e) => (this.effects[e].family))
          .filter((family, index, self) => (
            family && self.indexOf(family) === index
          ))
      )
    )
        .reduce((res, family) => ({
          ...res,
          [family]: Object.values(this.effects)
              .filter((e) => (e.family === family))
              .sort((a, b) => (a.level > b.level ? 1 : -1))
        }), {});


    // Determine visible/known cures
    // - `save.curesReached`
    // - `save.curesReached` + 1 level _if_ that level is at or below
    //     `save.maxCureLevel`
    this.knownCures = Array.from(save.curesReached
        .reduce((set, reached) => {
          const e = effects.find((e) => (e.id === reached));
          set.add(e.id);
          if (e.level < save.maxCureLevel) {
            set.add(e.reaction.upgrade.product);
          }
          return set;
        }, new Set()));
    this.knownEffects = this.knownCures
        .concat(save.ingredients.map(({ effectIds }) => (effectIds)).flat());

    // Peak Concentrations
    save.maxStrengthConcentrations.forEach(({ conc, effect }) => {
      if (this.effects[effect]) {
        this.effects[effect].peak = conc;
      }
    });
  }

  //
  // Getters
  //
  get effectList() {
    return Object.values(this.effects);
  }

  get cureList() {
    return this.effectList.filter((e) => (e.cure));
  }

  get boosterList() {
    return this.effectList.filter((e) => (e.booster));
  }

  get sideeffectList() {
    return this.effectList.filter((e) => (!e.cure && !e.booster));
  }

  get ingredientList() {
    return Object.values(this.ingredients);
  }

  get familyList() {
    return Object.values(this.families);
  }

  //
  // Product Line Computation
  //
  product_lines = [];
  computeBasicProductLines() {
    return Object.keys(this.families)
        .map((family) => (this.computeBasicProductLine(family)))
        .flat();
  }

  computeBasicProductLine(family) {
    const effects = this.families[family];

    // Get starting ingredient(s)
    const steps = this.ingredientList
        .filter((i) => (i.effects.includes(effects[0].id)))
        .map((i) => {
          // console.log('Ingredient: ', i);
          return new ProductLineStart(i);
        });

    steps.forEach((step) => (step.computeNextSteps()));
    this.product_lines = steps;
    this.onUpdate();
    return steps;
  }

  //
  // Update Listener
  //
  update_listeners = []

  addUpdateListener(listener) {
    this.update_listeners.push(listener);
  }

  removeUpdateListener(listener) {
    this.update_listeners = this.update_listeners.filter((l) => (l !== listener));
  }

  onUpdate() {
    this.update_listeners.forEach((l) => (l()));
  }

}