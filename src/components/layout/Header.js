import React from 'react';
import classnames from 'classnames';
import { Link } from 'gatsby';

class PrimaryNavigation extends React.Component {
    constructor() {
        super();
        this.state = {
            open: false
        };
    }
    render() {
        return (
            <header className="primary-header navbar-fixed" ref={ (ref) => { this.container = ref; } }>
                <div className="main-menu">
                    <nav className="navbar navbar-expand-lg">
                        <div className="container wide">
                            <Link to="/" className="navbar-brand">TW</Link>
                            <button type="button"
                                    data-toggle="collapse"
                                    aria-controls="main-nav"
                                    aria-expanded={ this.state.open }
                                    aria-label="Toggle navigation"
                                    className="navbar-toggler"
                                    onClick={ () => { this.setState({ open: !this.state.open }); } }>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <div id="main-nav"
                                    className={ classnames('collapse navbar-collapse offset', { show: this.state.open }) }>
                                <ul className="nav navbar-nav ml-auto">
                                    <li className="nav-item"><Link to="/" exact className="nav-link">Home</Link></li>
                                    <li className="nav-item"><Link to="/resume" className="nav-link">Résumé</Link></li>
                                    <li className="nav-item"><Link to="/calculators" className="nav-link">Calculators</Link></li>
                                </ul>
                            </div> 
                        </div>
                    </nav>
                </div>
            </header>
        );
    }
}

export default PrimaryNavigation;
