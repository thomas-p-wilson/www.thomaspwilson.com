// Sources:
// - http://wiki.gekgasifier.com/w/page/6123680/Biomass%20to%20Woodgas%20to%20BTU%20to%20HP%20to%20KW%20to%20MPG%20conversion%20rules
// - http://www.idc-online.com/technical_references/pdfs/mechanical_engineering/Converting_Fuel_into_Horsepower.pdf
// - https://www.netl.doe.gov/sites/default/files/netl-file/Session-6-Jenkins-Biomass-Gasification-101.pdf

// Based on the above:
// - 1 gal of gasoline/diesel produces ~15shp for one hour. This can produce ~10kWh if driving a genset
// - 1 gal of gasoline/diesel ~= 20lb of gasified biomass
// - 1 ton of biomass through a gasifier-engine system ~= 100 gal of liquid fuel in a genset, or ~1MWh of electricity
//
// Alternatively:
// 1kg biomass ~= 2m^3 woodgas ~= 1hp-hour ~= 0.75kWh electrical
//
// How much HP is your vehicle using at cruise?
// - 60mpg ~= 1gal/hr or 15HP/hr
// - 30mpg ~= 2gal/hr or 30HP/hr
// - 15mpg ~= 4gal/hr or 60HP/hr
//
// How much woodgas to produce `x` amount of HP?
// - 1HP ~= 2m^3 /hr
//
// Additional Info:
// 1kg of wood @ 15% moisture content produces ~2.185m^3 of gas
// ~ 3.165kW heat from burning gas direct
// ~ 0.837kW shaft power
// ~ 1.12shp
// ~ 0.754kW electric
// ~ 10799BTU
//
// Gasoline, according to Pratt & Whitney Aircraft data sheets, has a specific
// gravity of  0.71,  and  therefore  a  weight  of  about  5.92  pounds  per
// gallon,  and  releases approximately 19,000 BTU of energy per pound of fuel
// burned.
//
// Heating value of syngas is 5-16 MJ/kg (100-300 Btu/ft3)

//
// Gas-based calculations
//
export const gasMass = ({ gasoline }) => (
    gasoline * 5.92
);
export const gasBTU = ({ gasoline }) => (
    gasoline * 19000
);
export const gasKJ = (state) => (
    gasBTU(state) * 1.05506
);
export const gasShaftHorsePower = (state) => (
    gasBTU(state) / 2544.43
);
export const gasElectric = (state) => (
    gasBTU(state) * 0.00029307107017
);

//
// Woodgas-based calculations
//

export const woodgas = (state) => (
    gasBTU(state) / state.woodgasDensity
);
export const biomass = (state) => (
    woodgas(state) / 2.185
);

export default {
    _meta: {
        sections: {
            gas: {
                title: 'Gasoline',
                fields: ['gasoline', 'gasMass', 'gasBTU', 'gasKJ', 'gasShaftHorsePower', 'gasElectric'],
            },
            woodgas: {
                title: 'Woodgas/Syngas',
                fields: ['woodgasDensity', 'woodgas', 'biomass']
            }
        }
    },
    gasoline: {
        type: 'number',
        title: 'Gasoline',
        unit: 'volume-usCustomaryUnits-gal',
        default: 1,
    },
    gasMass: {
        type: 'number',
        title: 'Mass',
        unit: 'mass-usCustomaryUnits-pound-us',
        calculate: gasMass,
        readonly: true,
    },
    gasBTU: {
        type: 'number',
        title: 'BTU',
        calculate: gasBTU,
        readonly: true,
    },
    gasKJ: {
        type: 'number',
        title: 'kJ',
        unit: 'energy-metric-kJ',
        calculate: gasKJ,
        readonly: true,
    },
    gasShaftHorsePower: {
        type: 'number',
        title: 'SHP/hr',
        calculate: gasShaftHorsePower,
        readonly: true,
    },
    gasElectric: {
        type: 'number',
        title: 'Electric',
        unit: 'energy-metric-kilowatt-hour',
        calculate: gasElectric,
        readonly: true,
    },

    woodgasDensity: {
        type: 'number',
        title: 'Heating Value (BTU / m^3)',
        info: 'Syngas has a typical heating value of 3531.47-10594.4 BTU / m^3',
        default: 7062.93,
    },
    woodgas: {
        type: 'number',
        title: 'Woodgas',
        unit: 'length-metric-metre',
        exponent: 3,
        calculate: woodgas,
        readonly: true,
    },
    biomass: {
        type: 'number',
        title: 'Biomass (e.g. Wood)',
        unit: 'mass-metric-kilogram',
        calculate: biomass,
        readonly: true,
    },
};