const types = {
    lion: {
        title: 'Lithium Ion',
        nominalChargeCycle: .8,
    },
    lipo: {
        title: 'Lithium Polymer',
        nominalChargeCycle: .8,
    },
    lifepo: {
        title: 'Lithium Iron Phosphate',
        nominalChargeCycle: 1,
    },
    leadacid: {
        title: 'Lead Acid',
        nominalChargeCycle: .5,
    },
}

export function nominalChargeCycle({ material }) {
    console.log('Material: ', material);
    return types[material].nominalChargeCycle;
}

export function nameplateCapacity(state) {
    const chargeCycle = nominalChargeCycle(state);
    return state.capacity / chargeCycle;
}

export function cellCount(state) {
    const cap = nameplateCapacity(state);
    return cap / (state.cellCapacity / 1000);
}

export function totalCost(state) {
    return cellCount(state) * state.cellCost * (1 + state.taxes);
}

export default {
    //
    // Material information
    //
    material: {
        type: 'select',
        title: 'Battery Type',
        options: {
            lion: 'Lithium Ion',
            lipo: 'Lithium Polymer',
            lifepo: 'Lithium Iron Phosphate',
            leadacid: 'Lead Acid',
        },
        default: 'lion',
    },
    nominalChargeCycle: {
        type: 'percent',
        title: 'Nominal Charge Cycle',
        calculate: nominalChargeCycle,
        readonly: true,
    },

    //
    // Capacity information
    //
    capacity: {
        type: 'number',
        title: 'Capacity',
        unit: 'energy-metric-kilowatt-hour',
        default: 300,
    },
    nameplateCapacity: {
        type: 'number',
        title: 'Nameplate Capacity',
        unit: 'energy-metric-kilowatt-hour',
        calculate: nameplateCapacity,
        readonly: true,
    },
    cellCapacity: {
        type: 'number',
        title: 'Cell Capacity',
        unit: 'energy-metric-watt-hour',
        default: .74
    },
    cellCount: {
        type: 'number',
        title: 'Cell Count',
        calculate: cellCount,
        readonly: true,
    },
    cellCost: {
        type: 'number',
        title: 'Cell Cost',
        default: 1.5
    },
    taxes: {
        type: 'percent',
        title: 'Taxes',
        default: .13,
    },
    totalCost: {
        type: 'number',
        title: 'Total Cost',
        calculate: totalCost,
        readonly: true,
    },
}