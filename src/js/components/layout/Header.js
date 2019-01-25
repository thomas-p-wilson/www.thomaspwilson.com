import React from 'react';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';

class PrimaryNavigation extends React.Component {
    render() {
        return (
            <header className="primary-header navbar-fixed" ref={ (ref) => { this.container = ref; } }>
                <div className="main-menu">
                    <nav className="navbar navbar-expand-lg">
                        <div className="container wide">
                            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <div className="collapse navbar-collapse offset" id="navbarSupportedContent">
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
