import React from 'react';
import Effect from './Effect';
import EffectReaction from './EffectReaction';

const CureLineage = ({ family }) => {
    console.log('Family: ', family);
    return (
        <div className="lineage">
            <h3>{ family[0].family }</h3>

            {
                family.map((e, i) => ([
                    <Effect key={ `effect-${e.id}` } { ...e } />,
                    i >= family.length-1 ? null : <EffectReaction key={ `reaction-${e.id}` } reaction={ e.reaction } />
                ]))
            }

        </div>
    );
}

export default CureLineage;
