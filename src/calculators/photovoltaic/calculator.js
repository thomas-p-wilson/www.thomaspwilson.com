export function demandPerLightHour({ dailyDemand, dailyLightHours }) {
    console.log('Here')
    return dailyDemand / dailyLightHours;
}

export function panelRealRating(state) {
    return state.panelRating * state.panelEfficiencyModifier;
}

export function panelCostPerWatt(state) {
    return state.panelCost / panelRealRating(state);
}

export function panelsRequired(state) {
    return Math.ceil(demandPerLightHour(state) / panelRealRating(state));
}

export function panelTotalCost(state) {
    return panelsRequired(state) * state.panelCost;
}

export default {
    _meta: {
        title: 'Photovoltaic Bank Parameters',
        description: 'Determine approximately how much photovoltaic capacity you need to produce energy for a given period of time.',
        sections: {
            system: {
                title: 'System Details',
                fields: ['dailyDemand', 'dailyLightHours', 'demandPerLightHour'],
            },
            panels: {
                title: 'Panel Bank',
                fields: ['panelRating', 'panelCost', 'panelEfficiencyModifier', 'realRating', 'panelCostPerWatt', 'panelCount', 'totalCost'],
            }
        },
    },
    dailyDemand: {
        type: 'number',
        title: 'Daily Demand',
        unit: 'power-metric-watt',
        time: 'time-other-h',
        default: 30000,
    },
    dailyLightHours: {
        type: 'number',
        title: 'Daily Light Hours',
        default: 5,
    },
    demandPerLightHour: {
        type: 'number',
        title: 'Demand Per Light Hour',
        unit: 'power-metric-watt',
        readonly: true,
        calculate: demandPerLightHour,
    },

    panelRating: {
        type: 'number',
        title: 'Panel Rating',
        unit: 'power-metric-watt',
        default: 280,
    },
    panelCost: {
        type: 'number',
        title: 'Panel Cost',
        default: 210, // CAD
    },
    panelEfficiencyModifier: {
        type: 'number',
        title: 'Efficiency Modifier',
        default: .8, // 80%
    },
    realRating: {
        type: 'number',
        title: 'Real Rating',
        unit: 'power-metric-watt',
        readonly: true,
        calculate: panelRealRating,
    },
    panelCostPerWatt: {
        type: 'number',
        title: 'Cost / Watt',
        readonly: true,
        calculate: panelCostPerWatt,
    },
    panelCount: {
        type: 'number',
        title: 'Panels Required',
        readonly: true,
        calculate: panelsRequired,
    },
    totalCost: {
        type: 'number',
        title: 'Total Cost',
        readonly: true,
        calculate: panelTotalCost
    }
}