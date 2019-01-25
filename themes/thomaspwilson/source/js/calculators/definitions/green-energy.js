import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Calculator from '../Calculator';

const G = 9.80665; // m/s^2

export default new Calculator({
    'title': 'Green Energy',
    'slug': 'green-energy',
    'description': 'Analyze hybrid green (solar, wind, hydro) installation requirements for housing.',
    'default': {
        'system_demand': 30000,
        'system_daily_light_hours': 6,

        'solar_panel_rating': 280,
        'solar_panel_cost': 210,
        'solar_panel_efficiency_adjustment': .8,

        'storage_type': 'lion'
    },
    'compute': {
        'system_demand_per_light_hour': function() {
            return this.system_demand / this.system_daily_light_hours;
        },
        'system_grid_cost_per_day': function() {
            return this.system_demand * this.grid_cost_per_wh;
        },
        'system_grid_cost_per_month': function() {
            return this.system_grid_cost_per_day * 30;
        },

        //
        // Solar
        //
        'solar_panel_actual_rating': function() {
            return this.solar_panel_rating * this.solar_panel_efficiency_adjustment;
        },
        'solar_panel_cost_per_watt': function() {
            return this.solar_panel_cost / this.solar_panel_actual_rating;
        },
        'solar_panel_number_required': function() {
            return Math.ceil(this.system_demand_per_light_hour / this.solar_panel_actual_rating);
        },
        'solar_materials_cost': function() {
            return this.solar_panel_number_required * this.solar_panel_cost;
        },
        'solar_microgen_payout_per_month': function() {
            return (this.system_demand * this.solar_microgen_price) * 30;
        },
        'solar_payoff_time': function() {
            let microgen_payout = this.solar_microgen_payout_per_month;
            if (microgen_payout) {
                return (Math.ceil(this.solar_materials_cost / (microgen_payout - this.system_grid_cost_per_month)));
            }
            return Math.ceil(this.solar_materials_cost / this.system_grid_cost_per_month);
        },

        //
        // Storage
        //
        'storage_hours': function() {
            return 24 - this.system_daily_light_hours;
        },
        'storage_usable_capacity': function() {
            return this.system_demand_per_light_hour * this.storage_hours;
        },
        'storage_nameplace_capacity': function() {
            if (this.storage_type === 'lion') {
                // Lithium-ion batteries last longest if charged to 80% and
                // discharged to 40%, which leaves 60% usable capacity. So tack
                // on an additional 60% to the storage capacity to get total
                // capacity.
                return this.storage_usable_capacity / .6;
            } else if (this.storage_type === 'flooded') {
                // Should not discharge a flooded lead-acid battery beyond 50%
                return this.storage_usable_capacity  * 2;
            } else {
                return this.storage_usable_capacity;
            }
        },
        'storage_batteries_required': function() {
            return Math.ceil(this.storage_nameplace_capacity / this.storage_battery_capacity);
        },
        'storage_bank_cost': function() {
            return this.storage_batteries_required * this.storage_battery_cost;
        }
    },
    'watch': {},
    'sections': [{
        'title': 'System Info',
        'fields': ['system_demand', 'grid_cost_per_wh', 'system_grid_cost_per_day', 'system_grid_cost_per_month', 'system_daily_light_hours', 'system_demand_per_light_hour']
    }, {
        'title': 'Solar Info',
        'fields': ['solar_panel_rating', 'solar_panel_cost', 'solar_panel_efficiency_adjustment', 'solar_panel_actual_rating', 'solar_panel_cost_per_watt', 'solar_panel_number_required', 'solar_materials_cost', 'solar_microgen_price', 'solar_microgen_payout_per_month', 'solar_payoff_time']
    }, {
        'title': 'Storage Info',
        'fields': ['storage_hours', 'storage_usable_capacity', 'storage_type', 'storage_nameplace_capacity', 'storage_battery_capacity', 'storage_batteries_required', 'storage_battery_cost', 'storage_bank_cost']
    }],
    'fields': {
        'system_demand': {
            'title': 'Daily System Demand',
            'unit': {
                'type': 'power',
                'options': ['W', 'kW', 'MW']
            },
            'info': 'The daily electrical demand of your system that you wish to meet with renewable energy sources. Average, maximum, or arbitrary; you decide.'
        },
        'grid_cost_per_wh': {
            'title': 'Grid Electricity Price',
            'addon': '$/Wh',
            'info': 'The cost of electricity from your local utility grid, in dollars per watt-hour'
        },
        'system_grid_cost_per_day': {
            'title': 'Grid Cost Per Day',
            'addon': '$',
            'info': 'The cost of your system\'s demand per day on grid',
            'output': true
        },
        'system_grid_cost_per_month': {
            'title': 'Grid Cost Per Month',
            'addon': '$',
            'info': 'Daily cost x 30',
            'output': true
        },
        'system_daily_light_hours': {
            'title': 'Daily Light Hours',
            'addon': 'hr',
            'info': 'The average number of good daily light hours you receive in your location.'
        },
        'system_demand_per_light_hour': {
            'title': 'Demand Per Light Hour',
            'unit': {
                'type': 'power',
                'options': ['W', 'kW', 'MW']
            },
            'info': 'The amount of energy to be generated per good light hour in order to meet daily needs',
            'output': true
        },

        'solar_panel_rating': {
            'title': 'Panel Rating',
            'addon': 'W',
            'info': 'The electrical rating of your solar panels, usually expressed in watt-hours (Wh)'
        },
        'solar_panel_cost': {
            'title': 'Panel Cost',
            'addon': '$',
            'info': 'The cost of each solar panel. For a more accurate final figure, you should include tax and any fees in the price.'
        },
        'solar_panel_efficiency_adjustment': {
            'title': 'Efficiency Adjustment',
            'addon': '%',
            'info': 'Solar panel output degrades over time, and they often do not produce their rated power even when brand new. The efficiency adjustment allows you to take this into account by altering the specs of the panel by a givne percentage. 80% is usually a reasonable value.'
        },
        'solar_panel_actual_rating': {
            'title': 'Real Panel Rating',
            'addon': 'W',
            'info': 'The more accurate solar panel rating after considering efficiency degredation',
            'output': true
        },
        'solar_panel_cost_per_watt': {
            'title': 'Panel Cost / Watt',
            'addon': '$',
            'info': 'The cost of the panel per delivered watt',
            'output': true
        },
        'solar_panel_number_required': {
            'title': 'Panels Required',
            'info': 'The number of solar panels required to meet demand',
            'output': true
        },
        'solar_materials_cost': {
            'title': 'Total Materials Cost',
            'addon': '$',
            'info': 'The total cost of the solar panels. Currently only accounts for the panels, no wiring, inverters, or other equipment. That\'ll come soon hopefully!',
            'output': true
        },
        'solar_microgen_price': {
            'title': 'Microgeneration Price',
            'addon': '$/Wh',
            'info': 'The amount (if any) that your government is willing to pay for your generated electricity. Optional.'
        },
        'solar_microgen_payout_per_month': {
            'title': 'Microgeneration Payout',
            'addon': '$/Month',
            'info': 'An estimate of the system income based on the microgeneration price',
            'output': true
        },
        'solar_payoff_time': {
            'title': 'Payoff Time',
            'addon': 'Months',
            'info': 'The approximate amount of time the system would take to pay itself off assuming you stop consuming $system_demand electricity from the grid',
            'output': true
        },

        'storage_hours': {
            'title': 'Hours of Storage',
            'addon': 'hr',
            'info': 'The number of average-demand hours of energy you wish to store. If you want to survive a day off-grid, this could be somewhere in the neighbourhood of twenty-four hours less your daily generating time.'
        },
        'storage_usable_capacity': {
            'title': 'Minimum Storage Capacity',
            'unit': {
                'type': 'power',
                'options': ['W', 'kW', 'MW']
            },
            'info': 'The theoretical minimum storage capacity that could supply your average daily demand. Battery characteristics will determine how accurate this is.',
            'output': true
        },
        'storage_type': {
            'title': 'Battery Type',
            'options': {
                'abuse': 'I abuse my batteries',
                'flooded': 'Flooded Lead-Acid',
                'lion': 'Lithium Ion'
            },
            'info': 'All batteries need to be treated differently due to differences in chemistry. Lithium-ion batteries last longest if charged to no more than 80% and discharged to no more than 40%.'
        },
        'storage_nameplace_capacity': {
            'title': 'Nameplate Capacity',
            'unit': {
                'type': 'power',
                'options': ['W', 'kW', 'MW']
            },
            'info': 'After considering battery type, this is the adjusted storage bank capacity that will allow optimal treatment of the batteries while still meeting demand.'
        },
        'storage_battery_capacity': {
            'title': 'Battery Capacity',
            'unit': {
                'type': 'power',
                'options': ['W', 'kW', 'MW']
            },
            'info': 'The nameplate capacity of a single battery as installed in the bank'
        },
        'storage_batteries_required': {
            'title': 'Batteries Required',
            'info': 'The number of batteries required in order to reach nameplate capacity'
        },
        'storage_battery_cost': {
            'title': 'Battery Cost',
            'addon': '$',
            'info': 'The cost of a single battery as installed in the bank. Including taxes will yield a more accurate calculation.'
        },
        'storage_bank_cost': {
            'title': 'Bank Cost',
            'addon': '$',
            'info': 'The approximate cost of the storage bank, not including connectors, inverters, or other equipment. That\'ll come soon hopefully!',
            'output': true
        }
    }
});