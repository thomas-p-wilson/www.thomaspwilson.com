import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext';
import { decimal } from '@/utils/decimal';
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension';
import * as energy from '@/units/energy';
import * as time from '@/units/time';

export const state: Partial<CalculatorStateShape> = {
  values: {
    daily_demand: decimal(30000), // Wh
    insolation: decimal(5),
    panel_rating: decimal(280), // W
    panel_price: decimal(210), // $CAD
    efficiency_modifier: decimal('0.8'), // 80%
  },
  calculations: {
    demand_per_insolation_hour: ({ daily_demand, insolation }: any) => {
      if (daily_demand && insolation) {
        return daily_demand.div(insolation);
      }
    },
    real_rating: ({ panel_rating, efficiency_modifier }: any) => {
      if (panel_rating && efficiency_modifier) {
        return panel_rating.times(efficiency_modifier);
      }
    },
    cost_per_watt: ({ panel_price, real_rating }: any) => {
      if (panel_price && real_rating) {
        return panel_price.div(real_rating);
      }
    },
    panel_count: ({ demand_per_insolation_hour, real_rating }: any) => {
      if (demand_per_insolation_hour && real_rating) {
        return demand_per_insolation_hour.div(real_rating).ceil();
      }
    },
    total_cost: ({ panel_count, panel_price }: any) => {
      if (panel_count && panel_price) {
        return panel_count.times(panel_price);
      }
    },
  }
}

export const render = () => {
  return (
    <>
      <h1>Sizing a bank of solar panels</h1>
      <p>Determine the approximate total capacity needed to produce energy for a given period of time.</p>

      <ContextualInputWithDimension
        name="daily_demand"
        label="Daily demand"
        units={energy}
        unit="metric-kilowatt-hour"
        dimensions={time}
        dimension="hour"
      />
      <ContextualInputWithDimension
        name="insolation"
        label="Daily insolation"
      />
      <ContextualInputWithDimension
        name="demand_per_insolation_hour"
        label="Demand per insolation hour"
        units={energy}
        unit="metric-kilowatt-hour"
        disabled
      />
      <ContextualInputWithDimension
        name="panel_rating"
        label="Panel rating"
        units={energy}
        unit="metric-watt-hour"
      />
      <ContextualInputWithDimension
        name="panel_price"
        label="Panel cost"
      />
      <ContextualInputWithDimension
        name="efficiency_modifier"
        label="Efficiency modifier"
      />
      <ContextualInputWithDimension
        name="real_rating"
        label="Real rating"
        units={energy}
        unit="metric-watt-hour"
      />
      <ContextualInputWithDimension
        name="cost_per_watt"
        label="Cost per watt"
        disabled
      />
      <ContextualInputWithDimension
        name="panel_count"
        label="Panel count"
        disabled
      />
      <ContextualInputWithDimension
        name="total_cost"
        label="Total cost"
        disabled
      />
    </>
  )
}
