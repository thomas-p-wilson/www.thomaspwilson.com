export const metric = {
    name: 'Metric',
    description: '',
    units: {
        kelvin: {
            symbol: 'K',
            singular: 'Kelvin',
            plural: 'Kelvin',
        },
        celsius: {
            symbol: 'C',
            singular: 'Celsius',
            plural: 'Celsius',
            shift: -273.15
        }
    }
}

export const other = {
    name: 'Other',
    description: '',
    units: {
        fahrenheit: {
            symbol: 'F',
            singular: 'Fahrenheit',
            plural: 'Fahrenheit',
            transform: (F, K) => { //  To Kelvin
                if (F) {
                    return ((F - 32) * (5 / 9) + 273.15);
                }
                return (K - 273.15) * (9 / 5) + 32;
            }
        },
        rankine: {
            symbol: 'R',
            singular: 'Rankine',
            plural: 'Rankine',
            multiplier: 5 / 9
        }
    }
}