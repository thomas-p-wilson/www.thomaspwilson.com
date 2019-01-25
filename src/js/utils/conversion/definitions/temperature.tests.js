import convert from '..';

describe('Temperature', () => {
	it('C to K', () => {
		expect(convert(0).from('C').to('K')).to.equal(273.15);
	});
	it('K to C', () => {
		expect(convert(273.15).from('K').to('C')).to.equal(0);
	});
	it('F to C', () => {
		expect(convert(32).from('F').to('C')).to.equal(0);
	});
	it('C to F', () => {
		expect(convert(0).from('C').to('F')).to.equal(32);
	});
	it('F to K', () => {
		expect(convert(32).from('F').to('K')).to.equal(273.15);
	});
	it('F to R', () => {
		expect(convert(100).from('F').to('R')).to.equal(559.67);
	});
	it('R to F', () => {
		expect(convert(670).from('R').to('F')).to.equal(210.33000000000007);
	});
	it('R to C', () => {
		expect(convert(612).from('R').to('C')).to.equal(66.85000000000002);
	});
	it('R to K', () => {
		expect(convert(459.67).from('R').to('K')).to.equal(255.37222222222223);
	});
});