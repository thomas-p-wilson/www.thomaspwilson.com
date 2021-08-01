import effects from '../effects';

export default class ProductLineStep {
  effects = null;
  concentration = null;
  action_taken = null;
  parent = null;
  children = [];

  constructor(effects, concentration) {
    this.effects = [ ...effects ];
    this.concentration = concentration;
  }

  //
  // Getters
  //
  get cures() {
    console.log('Effects: ', this.effects);
    return this.effects
        .map((e) => (effects.find((e1) => (e1.id === e))))
        .filter((e) => (e && e.cure));
  }

  get boosters() {
    return this.effects
        .map((e) => (effects.find((e1) => (e1.id === e))))
        .filter((e) => (e && e.booster));
  }

  get sideeffects() {
    return this.effects
        .map((e) => (effects.find((e1) => (e1.id === e))))
        .filter((e) => (e && (!e.cure && !e.booster)));
  }

  //
  // Reactions
  //
  /**
   * The concentration distance until we can perform the next upgrade. Negative
   * result indicates that the concentration must decrease (dissolve, ionise)
   * and a positive result indicates that the concentration must increase
   * (evaporate, agglomerate).
   */
  get distance() {
    const cures = this.cures;
    if (cures.length !== 1) {
      throw new Error('Incorrect number of cures: ' + cures.length);
    }
    if (this.concentration < cures[0].start) {
      return cures[0].start - this.concentration;
    }
    if (this.concentration > cures[0].end) {
      return cures[0].end - this.concentration;
    }
    return Number.NaN;
  }

  dissolve() {
    const step = this.duplicate();
    step.concentration -= 1;
    step.action_taken = 'dissolve';
    step.parent = this;
    this.children.push(step);
  }

  ionise() {
    const step = this.duplicate();
    step.concentration -= 3;
    step.action_taken = 'ionise';
    step.parent = this;
    this.children.push(step);
  }

  evaporate() {
    const step = this.duplicate();
    step.concentration += 1;
    step.action_taken = 'evaporate';
    step.parent = this;
    this.children.push(step);
  }

  agglomerate() {
    const step = this.duplicate();
    step.concentration += 3;
    step.action_taken = 'agglomerate';
    step.parent = this;
    this.children.push(step);
  }

  //
  // Misc
  //
  computeNextSteps() {
    const distance = this.distance;
    if (distance >= 3) {
      this.dissolve();
      this.ionise();
    } else if (distance > 0) {
      this.dissolve();
    } else if (distance === 0) {
      // react
    } else if (distance < -3) {
      this.agglomerate();
      this.evaporate();
    } else if (distance < 0) {
      this.evaporate();
    }
  }

  duplicate() {
    return new ProductLineStep(this.effects, this.concentration);
  }
}
