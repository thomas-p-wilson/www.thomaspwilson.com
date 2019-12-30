import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import connect from '../decorators/connect';

@withRouter
@connect({
	manifest: {
        fetch: false
    }
})
class EventEditPage extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                id: PropTypes.string,
                model: PropTypes.string
            })
        }),
        manifest: PropTypes.array
    };

    render({ manifest }) {
        return (
            <div className="container">
                <div className="context-panel">
                    <p className="quote">
                        <p>Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding.</p>
                        <small>— William Paul Thurston, American mathematician</small>
                    </p>
                </div>
                <div className="content-panel">
                    <ul className="calculator-list">
                        {
                            (manifest && manifest.data && manifest.data.calculators || []).map((calculator) => (
                                <li>
                                    <Link to={ `/${ calculator.id }` }><span>{ calculator.title }</span></Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        );
    }
}

export default EventEditPage;
