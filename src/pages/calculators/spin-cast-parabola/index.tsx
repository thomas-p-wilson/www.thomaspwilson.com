import { CalculatorContextProvider, CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext';
import { decimal } from '@/utils/decimal';
import { G } from '@/utils/constants';
import { CalculatorSettings } from '@/components/CalculatorSettings/CalculatorSettings';
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension';
import * as angle from '@/units/angle';
import * as length from '@/units/length';
import * as time from '@/units/time';

export const SpinCastingParabolaInitialState: Partial<CalculatorStateShape> = {
  values: {
    focal_length: decimal(1.5)
  },
  calculations: {
    angular_velocity: ({ focal_length }: any) => {
      if (focal_length) {
        // https://www.sfu.ca/~mbahrami/ENSC%20283/Suggested%20Problems/Chapter%202/White_P2_159.pdf
        return G.div(decimal(2).times(focal_length)).sqrt().times(180).div(Math.PI);
      }
      return undefined;
    }
  }
}

export default () => {
  return (
    <CalculatorContextProvider initialState={SpinCastingParabolaInitialState}>
      <CalculatorSettings />

      <h1>Spin-Casting a Paraboloid</h1>

      <ContextualInputWithDimension
        name="focal_length"
        label="Focal length"
        units={length}
        unit="metric-metre"
      />
      <ContextualInputWithDimension
        name="angular_velocity"
        label="Angular velocity"
        units={angle}
        unit="rad"
        unitExponent={decimal(-1)}
        dimensions={time}
        dimension="metric-second"
        disabled
      />
    </CalculatorContextProvider>
  )
}

//                                 <dt { ...hide(this.state.primaryType !== 'paraboloidal') }><Info field="primaryRotation" onClick={ this.onInfo } /> Cast Rotation</dt>
//                                 <dd { ...hide(this.state.primaryType !== 'paraboloidal') }>
//                                     <NumberField field="primaryRotation"
//                                             value={ output.rotation(this.state.primaryFocalLength) }
//                                             state={ this.state }
//                                             unit="angle-other-rad"
//                                             time="time-metric-second"
//                                             readonly
//                                             onChange={ this.onChange } />
//                                 </dd>
//                                 <InfoSection show={ this.state.info === 'primaryRotation' } { ...hide(this.state.primaryType !== 'paraboloidal') }>
//                                     The angular velocity with which the mirror must be rotated in order to achieve the desired focal length during spin-casting.

//                                     <table>
//                                         <tr>
//                                             <td>
//                                                 <MathJax math={ String.raw`
//                                                     $$
//                                                     w = \sqrt{\dfrac{g}{2f}}
//                                                     $$
//                                                 `} />

//                                                 { /* h = \dfrac{1}{2g}w^2r^2 ??? WHERES THIS FROM???? */ }
//                                             </td>
//                                             <td>
//                                                 <ul>
//                                                     <li><MJ>$w$ represent the angular velocity of the liquid's rotation, in radians per second</MJ></li>
//                                                     <li><MJ>$g$ represent the acceleration due to gravity</MJ></li>
//                                                     <li><MJ>$f$ represent the focal length of the mirror</MJ></li>
//                                                 </ul>
//                                             </td>
//                                         </tr>
//                                     </table>
//                                 </InfoSection>
//                             </dl>
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         );
//     }
// }
