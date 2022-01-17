import * as conversion from '../conversion/convert';
import { units, systems } from '.';

describe('Quantity tests', () => {
  describe('Length', () => {
    describe('Intra-System Conversions', () => {
      const measures = systems.map((s) => (s.measures.length));
      const requiredComparisons = measures.reduce((res, measure) => {
        const base = Array.from(measure.values()).find((u) => (u.base));
        const nonbase = Array.from(measure.values()).filter((u) => (!u.base));
        return nonbase.reduce((res2, u) => ({
          ...res2,
          [u.symbol || u.singular.toLowerCase()]: base.symbol || base.singular.toLowerCase()
        }), res);
      }, {});
      let convert;

      beforeEach(() => {
        convert = jest.fn((quantity, origin, target, exp = undefined) => {
          // TODO Should make sure the target matches as well
          delete requiredComparisons[origin];
          return conversion.convert(quantity, origin, target, exp);
        });
      });

      it('Metric', () => {
        expect(convert(5, 'km', 'm').valueOf()).toEqual('5000');
        expect(convert(5, 'cm', 'm').valueOf()).toEqual('0.05');
        expect(convert(5, 'mm', 'm').valueOf()).toEqual('0.005');
        expect(convert(5, 'um', 'm').valueOf()).toEqual('0.000005');
        expect(convert(5, 'nm', 'm').toFixed()).toEqual('0.000000005');
        expect(convert(5, 'pm', 'm').toFixed()).toEqual('0.000000000005');
        expect(convert(5, 'fm', 'm').toFixed()).toEqual('0.000000000000005');
      });

      it('English Units - Pre-1826', () => {
        expect(convert(5, 'twip', 'foot').valueOf()).toEqual('0.0002893519');
        expect(convert(5, 'point', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'pica', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'line', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'barleycorn', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'finger', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'inch', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'stick', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'hand', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'digit', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'palm', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'nail', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'shaftment', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'span', 'foot').valueOf()).toEqual('');
        expect(convert(5, 'link', 'foot').valueOf()).toEqual('');
      });

      it('No remaining comparisons to make', () => {
        expect(Object.keys(requiredComparisons)).toHaveLength(0);
      });
    })
  });

  // describe('Length', () => {
  //   it.skip('km to in', () => {
  //     expect(convert(1, 'km', 'in').valueOf()).toEqual('39370.078740157485');
  //   });
  //   it.skip('km to in-us', () => {
  //     expect(convert(1, 'km', 'in-us').valueOf()).toEqual('39370');
  //   });
  //   it.skip('km to yd', () => {
  //     expect(convert(1, 'km', 'yd').valueOf()).toEqual('1093.6132983377079');
  //   });
  //   it.skip('km to ft', () => {
  //     expect(convert(1, 'km', 'ft').valueOf()).toEqual('3280.839895013123');
  //   });
  //   it.skip('km to ft-us', () => {
  //     expect(convert(1, 'km', 'ft-us').valueOf()).toEqual('3280.8333333465');
  //   });
  //   it.skip('km to fathom', () => {
  //     expect(convert(1, 'km', 'fathom').valueOf()).toEqual('546.8066491688539');
  //   });
  //   it.skip('km to mi', () => {
  //     expect(convert(1, 'km', 'mi').valueOf()).toEqual('0.621371192237334');
  //   });
  //   it.skip('km to mi-us', () => {
  //     expect(convert(1, 'km', 'mi-us').valueOf()).toEqual('0.6213700339330176');
  //   });
  //   it.skip('km to nmi', () => {
  //     expect(convert(1, 'km', 'nmi').valueOf()).toEqual('0.5399568034557235');
  //   });

  //   it.skip('fathom to km', () => {
  //     expect(convert(1, 'fathom', 'km').valueOf()).toEqual('0.0018288');
  //   });
  //   it.skip('fathom to m', () => {
  //     expect(convert(1, 'fathom', 'm').valueOf()).toEqual('1.8288');
  //   });
  //   it.skip('fathom to cm', () => {
  //     expect(convert(1, 'fathom', 'cm').valueOf()).toEqual('182.88');
  //   });
  //   it.skip('fathom to mm', () => {
  //     expect(convert(1, 'fathom', 'mm').valueOf()).toEqual('1828.8');
  //   });
  //   it.skip('fathom to nm', () => {
  //     expect(convert(1, 'fathom', 'nm').valueOf()).toEqual('1829000000');
  //   });
  //   // it('fathom to in', () => {
  //   // 	expect(convert(1, 'fathom', 'in').valueOf()).toEqual('72');
  //   // });
  //   // it('fathom to in-us', () => {
  //   // 	expect(convert(1, 'fathom', 'in-us').valueOf()).toEqual('1000');
  //   // });
  //   // it('fathom to yd', () => {
  //   // 	expect(convert(1, 'fathom', 'yd').valueOf()).toEqual('1000');
  //   // });
  //   // it('fathom to ft', () => {
  //   // 	expect(convert(1, 'fathom', 'ft').valueOf()).toEqual('1000');
  //   // });
  //   // it('fathom to ft-us', () => {
  //   // 	expect(convert(1, 'fathom', 'ft-us').valueOf()).toEqual('1000');
  //   // });
  //   // it('fathom to mi', () => {
  //   // 	expect(convert(1, 'fathom', 'mi').valueOf()).toEqual('1000');
  //   // });
  //   // it('fathom to mi-us', () => {
  //   // 	expect(convert(1, 'fathom', 'mi-us').valueOf()).toEqual('1000');
  //   // });
  //   // it('fathom to nmi', () => {
  //   // 	expect(convert(1, 'fathom', 'nmi').valueOf()).toEqual('1000');
  //   // });
  // });
});
