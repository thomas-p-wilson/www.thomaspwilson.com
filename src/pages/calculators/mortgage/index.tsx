import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension'
import * as length from '@/units/length';
import * as energy from '@/units/energy';
import { decimal, pi } from '@/utils/decimal';
import { ContextualInput } from '@/components/CalculatorControls/ContextualInput/ContextualInput';
import { Field } from '@/components/controls/Field/Field';
import { ContextualField } from '@/components/CalculatorControls/ContextualField/ContextualField';
import { wrapWithStateLocator } from '@/utils/wrapWithStateLocator';
import { Decimal } from '@/types/Decimal';

type ScheduleEntry = {
  payment: Decimal
  principal_paid: Decimal
  principal_remaining: Decimal
}

export const state: Partial<CalculatorStateShape> = {
  globalScale: 2,
  values: {
    property_value: decimal('1000000'),
    downpayment_amount: decimal('200000'),
    interest_rate: decimal('0.05'),
    amortization_period: decimal('25'),
    payment_frequency: decimal('12'),
    term: decimal('5'),
  },
  calculations: {
    downpayment_percentage: ({ property_value, downpayment_amount }) => {
      if (property_value && downpayment_amount) {
        return downpayment_amount.div(property_value);
      }
    },
    principal: ({ property_value, downpayment_amount }) => {
      if (property_value && downpayment_amount) {
        return property_value.sub(downpayment_amount);
      }
    },

    chamber_radius: ({ chamber_diameter }: any) => {
      if (chamber_diameter) {
        return chamber_diameter.div(2);
      }
    },
    chamber_circumference: ({ chamber_height, chamber_radius }: any) => {
      if (chamber_height && chamber_radius) {
        return chamber_radius.times(pi).times(2);
      }
    },
    chamber_surface_area: ({ chamber_radius, chamber_height }: any) => {
      if (chamber_radius && chamber_height) {
        return pi.times(2).times(chamber_radius).times(chamber_height).add(pi.times(2).times(chamber_radius.pow(2)));
      }
      return undefined;
    },
    total_wattage: ({ chamber_surface_area, watts_per_unit_area }: any) => {
      if (chamber_surface_area && watts_per_unit_area) {
        return chamber_surface_area.times(watts_per_unit_area);
      }
    },
    payment: ({ principal, payment_frequency, amortization_period, interest_rate }) => {
      if (principal && payment_frequency && amortization_period && interest_rate) {
        const P = principal;
        const n = payment_frequency;
        const t = amortization_period;
        const t_p = n.times(t); // Total payments in the term
        const r = interest_rate.div(n); // Interest rate per payment period (ex monthly rate)
        const r_whole = r.add(1);

        console.log('Principal: ', P.toString());
        console.log('Freq: ', n.toString());
        console.log('Term: ', t);


        return P.times(r).times(r_whole.pow(t_p)).div(r_whole.pow(t_p).sub(1));
      }
    },
    // @ts-expect-error Unlike normal calculations, this returns an array
    schedule: ({ principal, interest_rate, payment_frequency, payment }) => {
      if (principal && interest_rate && payment_frequency && payment) {
        const r = interest_rate.div(payment_frequency); // Interest rate per payment period (ex monthly rate)
        let P = principal;
        const schedule: ScheduleEntry[] = [];
        while (P.greaterThan(0)) {
          const old = P;
          P = r.add(1).times(P).minus(payment);
          schedule.push({
            payment: payment,
            principal_remaining: P,
            principal_paid: old.minus(P),
          })
        }
        return schedule;
      }
      return undefined;
    },
    term_principal_paid: ({ schedule, term, payment_frequency }) => {
      if (schedule && term && payment_frequency) {
        return (schedule as unknown as ScheduleEntry[]).slice(0, term.times(payment_frequency).toNumber()).reduce((acc, row) => (
          acc.add(row.principal_paid)
        ), decimal(0));
      }
    }
  }
}

export const render = wrapWithStateLocator(({
  term,
  amortization_period,
  payment_frequency,
  prepayment_amount,
  payment,
  term_principal_paid,
}) => (
  <>
    <section>
      <h3>Payment Plan</h3>

      <ContextualField
        name="property_value"
        label="Property value"
        unit="$"
        type="number"
      />
      <ContextualField
        name="downpayment_amount"
        label="Downpayment $"
        unit="$"
        type="number"
      />
      <ContextualField
        name="downpayment_percentage"
        label="Downpayment %"
        unit="%"
        type="number"
      />
      <ContextualField
        name="principal"
        label="Principal"
        unit="$"
        type="number"
      />

      <ContextualField
        name="interest_rate"
        label="Interest rate"
        unit="%"
        type="number"
      />
      <ContextualField
        name="amortization_period"
        label="Amortization period"
        type="number"
      />
      <ContextualField
        name="payment_frequency"
        label="Payment frequency"
        type="number"
      />
      <ContextualField
        name="term"
        label="Term"
        type="number"
      />
    </section>

    <section>
      <h3>Prepayment Plan</h3>
      <ContextualField
        name="prepayment_amount"
        label="Prepayment amount"
        unit="$"
        type="number"
      />
      <ContextualField
        name="prepayment_frequency"
        label="Prepayment frequency"
        type="number"
      />
      <ContextualField
        name="prepayment_starting_payment"
        label="Starting payment"
        type="number"
      />
    </section>

    <section>
      <h3>Summary</h3>

      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Term</th>
            <th>Amortization Period</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Number of Payments</td>
            <td>{ term?.times(payment_frequency).toString() }</td>
            <td>{ amortization_period?.times(payment_frequency).toString() }</td>
          </tr>
          <tr>
            <td>Mortgage Payment</td>
            <td>{ payment?.toString() }</td>
            <td></td>
          </tr>
          <tr>
            <td>Prepayment</td>
            <td>{ prepayment_amount?.toString() }</td>
            <td></td>
          </tr>
          <tr>
            <td>Principal Payments</td>
            <td>{ term_principal_paid?.toString() }</td>
            <td></td>
          </tr>
          <tr>
            <td>Interest Payments</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Total Cost</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </section>
  </>
));
