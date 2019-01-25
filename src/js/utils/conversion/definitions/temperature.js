export default {
    K: {
        symbol: 'K',
        singular: 'degree Kelvin',
        plural: 'degrees Kelvin',
        measure: 'Temperature',
        system: 'Metric'
    },
    C: {
        symbol: 'C',
        singular: 'degree Celsius',
        plural: 'degrees Celsius',
        measure: 'Temperature',
        system: 'Metric',
        shift: -273.15
    },
    F: {
        symbol: 'F',
        singular: 'degree Fahrenheit',
        plural: 'degrees Fahrenheit',
        measure: 'Temperature',
        system: 'US Customary',
        transform: (F, K) => { //  To Kelvin
            if (F) {
                return ((F - 32) * (5 / 9) + 273.15);
            }
            return (K - 273.15) * (9 / 5) + 32;
        }
    },
    R: {
        symbol: 'R',
        singular: 'degree Rankine',
        plural: 'degrees Rankine',
        measure: 'Temperature',
        system: 'US Customary',
        multiplier: 5 / 9
    }
}