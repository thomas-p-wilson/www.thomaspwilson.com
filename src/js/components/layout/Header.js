import React from 'react';
import classnames from 'classnames';
import { Link, NavLink } from 'react-router-dom';

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
                                    <li className="nav-item"><NavLink to="/" exact className="nav-link">Home</NavLink></li>
                                    <li className="nav-item"><NavLink to="/resume" className="nav-link">Résumé</NavLink></li>
                                    <li className="nav-item"><NavLink to="/calculators" className="nav-link">Calculators</NavLink></li>
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
