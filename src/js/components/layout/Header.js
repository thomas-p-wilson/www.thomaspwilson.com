import React from 'react';
import classnames from 'classnames';
import { Link, NavLink } from 'react-router-dom';

export default class Header extends React.Component {
    constructor() {
        super();
        this.state = {
            open: false
        };
    }
    render() {
        return (
            <header className="sidebar">
                <nav>
                    <ul className="sidebar-nav">
                        <li>
                            <NavLink to="/" exact>About Me</NavLink>
                        </li>
                        <li>
                            <NavLink to="/blog">Blog</NavLink> (<a href="/atom.xml">RSS</a>)
                        </li>
                        <li>
                            <NavLink to="/cv">Résumé / CV</NavLink>
                        </li>
                        <li>
                            <NavLink to="/calculators">Calculators</NavLink>
                        </li>
                    </ul>
                </nav>

                <small className="colophon">© {(new Date()).getFullYear()} Thomas P. Wilson - All rights reserved.</small>
            </header>
        );
    }
}
