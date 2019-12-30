import convert from '..';

describe('Length', () => {
	it('km to m', () => {
		expect(convert(1).from('km').to('m')).to.equal(1000);
	});
	it('km to cm', () => {
		expect(convert(1).from('km').to('cm')).to.equal(100000);
	});
	it('km to mm', () => {
		expect(convert(1).from('km').to('mm')).to.equal(1000000);
	});
	it('km to um', () => {
		expect(convert(1).from('km').to('um')).to.equal(1000000000);
	});
	it('km to nm', () => {
		expect(convert(1).from('km').to('nm')).to.be.closeTo(1000000000000, 100);
	});
	it('km to in', () => {
		expect(convert(1).from('km').to('in')).to.equal(39370.078740157485);
	});
	it('km to in-us', () => {
		expect(convert(1).from('km').to('in-us')).to.be.closeTo(39370, 0.0001);
	});
	it('km to yd', () => {
		expect(convert(1).from('km').to('yd')).to.equal(1093.6132983377079);
	});
	it('km to ft', () => {
		expect(convert(1).from('km').to('ft')).to.equal(3280.839895013123);
	});
	it('km to ft-us', () => {
		expect(convert(1).from('km').to('ft-us')).to.be.closeTo(3280.8333333465, 0.0001);
	});
	it('km to fathom', () => {
		expect(convert(1).from('km').to('fathom')).to.equal(546.8066491688539);
	});
	it('km to mi', () => {
		expect(convert(1).from('km').to('mi')).to.equal(0.621371192237334);
	});
	it('km to mi-us', () => {
		expect(convert(1).from('km').to('mi-us')).to.equal(0.6213700339330176);
	});
	it('km to nmi', () => {
		expect(convert(1).from('km').to('nmi')).to.equal(0.5399568034557235);
	});

	it('fathom to km', () => {
		expect(convert(1).from('fathom').to('km')).to.equal(0.0018288);
	});
	it('fathom to m', () => {
		expect(convert(1).from('fathom').to('m')).to.equal(1.8288);
	});
	it('fathom to cm', () => {
		expect(convert(1).from('fathom').to('cm')).to.equal(182.88);
	});
	it('fathom to mm', () => {
		expect(convert(1).from('fathom').to('mm')).to.equal(1828.8);
	});
	it('fathom to nm', () => {
		expect(convert(1).from('fathom').to('nm')).to.be.closeTo(1829000000, 1000000);
	});
	// it('fathom to in', () => {
	// 	expect(convert(1).from('fathom').to('in')).to.equal(72);
	// });
	// it('fathom to in-us', () => {
	// 	expect(convert(1).from('fathom').to('in-us')).to.equal(1000);
	// });
	// it('fathom to yd', () => {
	// 	expect(convert(1).from('fathom').to('yd')).to.equal(1000);
	// });
	// it('fathom to ft', () => {
	// 	expect(convert(1).from('fathom').to('ft')).to.equal(1000);
	// });
	// it('fathom to ft-us', () => {
	// 	expect(convert(1).from('fathom').to('ft-us')).to.equal(1000);
	// });
	// it('fathom to mi', () => {
	// 	expect(convert(1).from('fathom').to('mi')).to.equal(1000);
	// });
	// it('fathom to mi-us', () => {
	// 	expect(convert(1).from('fathom').to('mi-us')).to.equal(1000);
	// });
	// it('fathom to nmi', () => {
	// 	expect(convert(1).from('fathom').to('nmi')).to.equal(1000);
	// });
});
