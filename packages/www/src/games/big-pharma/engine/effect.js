export default class Effect {
  constructor(calculator, id, family, level, reaction, start, end, cure, booster, catalyst, peak) {
    this.calculator = calculator;
    this.id = id;
    this.family = family;
    this.level = level;
    this.reaction = reaction;
    this.start = start;
    this.end = end;
    this.cure = cure;
    this.booster = booster;
    this.catalyst = catalyst;
    this.peak = peak;

    // console.log('New Effect: ', this);
  }
}
