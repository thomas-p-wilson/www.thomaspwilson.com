import { Link, useResolvedPath } from 'react-router-dom';
import { ProgressiveImage } from '@/components/ProgressiveImage/ProgressiveImage';
import './calculators/list';
import './CalculatorList.scss';
import { descriptors } from './calculators/list';
import { CalculatorDescriptor } from '@/types/CalculatorDescriptor';

export const Component = () => {
  const match = useResolvedPath('');

  return (
    <div className="calculators-page">
      <div className="container">
        <ul className="calculator-list">
        {
          descriptors.map((descriptor: CalculatorDescriptor) => (
            <li>
              <ProgressiveImage name={descriptor.title}
                smallSrc={descriptor.image.small}
                largeSrc={descriptor.image.large}
                aspect={63}
                caption={(
                  <figcaption>
                    <a href={`https://unsplash.com/${descriptor.image.author.handle}?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Image by ${descriptor.image.author.name} on Unsplash`}
                      className="btn btn-circle">
                      <span style={{ display: 'inline-block', padding: '2px 3px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '12px', width: 'auto', position: 'relative', verticalAlign: 'middle', top: '-2px', fill: 'white' }} viewBox="0 0 32 32">
                          <title>{`Image by ${descriptor.image.author.name} on Unsplash`}</title>
                          <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z" />
                        </svg>
                      </span>
                    </a>
                  </figcaption>
                )}
                wrapper={Link}
                wrapperProps={{
                  to: `${match.pathname}/${descriptor.path}`
                }} />
              <Link to={`${match.pathname}/${descriptor.path}`}>
                <h6>{descriptor.title}</h6>
                <small>{descriptor.description}</small>
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
}
