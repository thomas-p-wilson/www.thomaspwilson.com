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
                <img src="/assets/img/me.png" alt="Thomas Wilson" className="photo" />

                <nav>
                    <ul className="sidebar-nav">
                        <li>
                            <a href="https://erthalion.info/">About Me</a>
                        </li>
                        <li>
                            <a href="https://erthalion.info/blog" className="active">Blog</a>
                        </li>
                        <li>
                            <a href="https://erthalion.info/atom.xml">RSS</a>
                        </li>
                    </ul>
                </nav>

                <small className="colophon">© {(new Date()).getFullYear()} Thomas P. Wilson - All rights reserved.</small>
            </header>
        );
    }
}
