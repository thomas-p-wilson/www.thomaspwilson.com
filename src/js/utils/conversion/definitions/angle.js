export const other = {
    name: 'Other',
    description: '',
    units: {
        rad: {
            symbol: 'rad',
            singular: 'Radian',
            plural: 'Radians',
            measure: 'Angle',
            multiplier: 180 / Math.PI
        },
        deg: {
            symbol: 'deg',
            singular: 'Degree',
            plural: 'Degrees',
            measure: 'Angle',
            multiplier: 1
        },
        grad: {
            symbol: 'grad',
            singular: 'Gradian',
            plural: 'Gradian',
            measure: 'Angle',
            multiplier: 9 / 10
        },
        arcmin: {
            symbol: 'arcmin',
            singular: 'Arcminute',
            plural: 'Arcminutes',
            measure: 'Angle',
            multiplier: 1 / 60
        },
        arcsec: {
            symbol: 'arcsec',
            singular: 'Arcsecond',
            plural: 'Arcsecond',
            measure: 'Angle',
            multiplier: 1 / 3600
        }
    }
}
