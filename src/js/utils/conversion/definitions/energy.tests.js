import convert from '..';

describe('Energy', () => {
    it('Wh to J', () => {
        expect(convert(50).from('Wh').to('J')).to.equal(180000);
    });

    it('J to Wh', () => {
        expect(convert(180000).from('J').to('Wh')).to.equal(50);
    });
});