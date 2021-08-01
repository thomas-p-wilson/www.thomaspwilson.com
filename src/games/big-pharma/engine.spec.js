import Engine from './engine';

const save = {
  ingredients: [
    {
      "effectIds": [
        "drymouth",
        "warts",
        null,
        null
      ],
      "baseValue": 35,
      "locationId": "forest1",
      "discovered": false,
      "type": "pellets",
      "name": "Dewey Tray Fly Essence",
      "concentration": 10,
      "ingredientNumber": 0,
      "projectSize": 1
    },
    {
      "effectIds": [
        null,
        null,
        "painkiller",
        "headaches"
      ],
      "baseValue": 35,
      "locationId": "forest5",
      "discovered": false,
      "type": "pellets",
      "name": "Foaming Jelly Fish Vapour",
      "concentration": 14,
      "ingredientNumber": 1,
      "projectSize": 1
    },
    {
      "effectIds": [
        "easytoswallow",
        "pinsandneedles",
        null,
        "encouragesanxiety"
      ],
      "baseValue": 35,
      "locationId": "forest7",
      "discovered": false,
      "type": "solution",
      "name": "Wilted Acidifolia Discharge",
      "concentration": 17,
      "ingredientNumber": 4,
      "projectSize": 1
    },
  ],
  curesReached: [
    "warts",
    "femalecontraceptive",
    "painkiller",
  ],
  maxStrengthConcentrations: [
    {
      "conc": 3,
      "effect": "drymouth"
    },
    {
      "conc": 13,
      "effect": "warts"
    },
    {
      "conc": 2,
      "effect": "femalecontraceptive"
    },
    {
      "conc": 5,
      "effect": "painkiller"
    },
    {
      "conc": 9,
      "effect": "headaches"
    },
    {
      "conc": 16,
      "effect": "easytoswallow"
    },
    {
      "conc": 13,
      "effect": "pinsandneedles"
    },
    {
      "conc": 9,
      "effect": "encouragesanxiety"
    },
  ],
  maxCureLevel: 3
}


describe('Big Pharma', () => {
  describe('Engine', () => {
    const engine = new Engine(save);

    it('Can create', () => {
      expect(engine.ingredients).toMatchObject({
        'Dewey Tray Fly Essence': {
          name: 'Dewey Tray Fly Essence',
          effects: [ 'drymouth', 'warts', null, null ],
          concentration: 10,
        },
        'Foaming Jelly Fish Vapour': {
          name: 'Foaming Jelly Fish Vapour',
          effects: [ null, null, 'painkiller', 'headaches' ],
          concentration: 14,
        },
        'Wilted Acidifolia Discharge': {
          name: 'Wilted Acidifolia Discharge',
          effects: [ 'easytoswallow', 'pinsandneedles', null, 'encouragesanxiety' ],
          concentration: 17,
        }
      });
      expect(engine.effects).toMatchObject({
        drymouth: {
          id: 'drymouth',
          family: undefined,
          level: -1,
          start: 2,
          end: 10,
          cure: false,
          booster: undefined,
          catalyst: undefined,
          peak: 3
        },
        warts: {
          id: 'warts',
          family: 'sex',
          level: 0,
          start: 11,
          end: 16,
          cure: true,
          booster: undefined,
          catalyst: undefined,
          peak: 13
        },
        femalecontraceptive: {
          id: 'femalecontraceptive',
          family: 'sex',
          level: 1,
          start: 1,
          end: 6,
          cure: true,
          booster: undefined,
          catalyst: undefined,
          peak: 2
        },
        erectiledysfunction: {
          id: 'erectiledysfunction',
          family: 'sex',
          level: 2,
          start: 9,
          end: 13,
          cure: true,
          booster: undefined,
          catalyst: undefined,
          peak: undefined
        },
        malecontraceptive: {
          id: 'malecontraceptive',
          family: 'sex',
          level: 3,
          start: 15,
          end: 17,
          cure: true,
          booster: undefined,
          catalyst: undefined,
          peak: undefined
        },
        painkiller: {
          id: 'painkiller',
          family: 'pain',
          level: 0,
          start: 5,
          end: 12,
          cure: true,
          booster: undefined,
          catalyst: undefined,
          peak: 5
        },
        migraine: {
          id: 'migraine',
          family: 'pain',
          level: 1,
          start: 5,
          end: 9,
          cure: true,
          booster: undefined,
          catalyst: undefined,
          peak: undefined
        },
        antiseizure: {
          id: 'antiseizure',
          family: 'pain',
          level: 2,
          start: 11,
          end: 15,
          cure: true,
          booster: undefined,
          catalyst: undefined,
          peak: undefined
        },
        anesthetic: {
          id: 'anesthetic',
          family: 'pain',
          level: 3,
          start: 14,
          end: 18,
          cure: true,
          booster: undefined,
          catalyst: undefined,
          peak: undefined
        },
        headaches: {
          id: 'headaches',
          family: undefined,
          level: -1,
          start: 4,
          end: 12,
          cure: false,
          booster: undefined,
          catalyst: undefined,
          peak: 9
        },
        easytoswallow: {
          id: 'easytoswallow',
          family: undefined,
          level: undefined,
          start: 1,
          end: 20,
          cure: undefined,
          booster: true,
          catalyst: undefined,
          peak: 16
        },
        pinsandneedles: {
          id: 'pinsandneedles',
          family: undefined,
          level: -1,
          start: 3,
          end: 14,
          cure: false,
          booster: undefined,
          catalyst: undefined,
          peak: 13
        },
        encouragesanxiety: {
          id: 'encouragesanxiety',
          family: undefined,
          level: -2,
          start: 5,
          end: 17,
          cure: false,
          booster: undefined,
          catalyst: 'catalyst1',
          peak: 9
        } 
      });
      expect(engine.families).toMatchObject({
        sex: [
          engine.effects.warts,
          engine.effects.femalecontraceptive,
          engine.effects.erectiledysfunction,
          engine.effects.malecontraceptive,
        ],
        pain: [
          engine.effects.painkiller,
          engine.effects.migraine,
          engine.effects.antiseizure,
          engine.effects.anesthetic,
        ]
      });
    });

    it('Calculate basic product lines', () => {
      const result = engine.computeBasicProductLines();
      console.log('Result: ', result);
    });
  });
});