import React from 'react';
import ProgressiveImage from '../ProgressiveImage';
import { Link } from 'gatsby';

// const calculators = {
//     'Conversions': [
//         {
//             title: 'Units of Length',
//             path: 'length',
//             description: 'Convert between units of length in several systems.',
//             image: {
//                 small: '/img/calculators/length-sm.jpg',
//                 large: '/img/calculators/length-lg.jpg',
//                 author: {
//                     handle: '@sernarial',
//                     name: 'Patricia Serna'
//                 }
//             }
//         },
//         {
//             title: 'Units of Mass',
//             path: 'mass',
//             description: 'Convert between units of mass in several systems.',
//             image: {
//                 small: '/img/calculators/mass-sm.jpg',
//                 large: '/img/calculators/mass-lg.jpg',
//                 author: {
//                     handle: '@victorfreitas',
//                     name: 'Victor Freitas'
//                 }
//             }
//         }
//     ],
// }

// const calculators = {};

export default ({ calculators }) => (
    <div className="calculators-page">
        <div className="container">
            <ul className="calculator-list">
            {
                calculators.map((inner) => (
                    <li>
                        <ProgressiveImage name={ inner.context.meta.title }
                                smallSrc={ inner.context.meta.image.small }
                                largeSrc={ inner.context.meta.image.large }
                                aspect={ 63 }
                                caption={(
                                    <figcaption>
                                        <a href={ `https://unsplash.com/${ inner.context.meta.image.author.handle }?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge` }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={ `Image by ${ inner.context.meta.image.author.name } on Unsplash` }
                                                className="btn btn-circle">
                                            <span style={{ display:'inline-block', padding: '2px 3px'}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" style={{ height:'12px', width:'auto', position:'relative', verticalAlign: 'middle', top:'-2px', fill: 'white' }} viewBox="0 0 32 32">
                                                    <title>{ `Image by ${ inner.context.meta.image.author.name } on Unsplash` }</title>
                                                    <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z" />
                                                </svg>
                                            </span>
                                        </a>
                                    </figcaption>
                                )}
                                wrapper={ Link }
                                wrapperProps={{
                                    to: `${ inner.path }`
                                }} />
                        <Link to={ `${ inner.path }` }>
                            <h6>{ inner.context.meta.title }</h6>
                            <small>{ inner.context.meta.description }</small>
                        </Link>
                    </li>
                ))
            }
            </ul>

            <p>This list is really small at the moment. But I have plans! Maybe it'll take a day. Maybe it'll take a year. But I have plans:</p>
            <ul>
                <li>Unit of measure conversions</li>
                <li>Financial calculators</li>
                <li>Physics calculators</li>
                <li>Chemistry calculators</li>
                <li>Other categories</li>
                <li>Visualizations</li>
                <li>Detailed explanations of how the calculations work</li>
                <li>Android + iOS applications</li>
            </ul>
        </div>
    </div>
);
