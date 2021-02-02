import React from 'react';

export default class Info extends React.Component {
    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
    }

    onClick(ev) {
        ev.target.parentElement.parentElement.classList.toggle('open');
        if (this.props.onClick) {
            this.props.onClick(ev);
        }
    }

    render() {
        const {
            field
        } = this.props;
        return (
            <a onClick={ this.onClick }
                    data-field={ field }
                    className="info">
                <i className="fa fa-info-circle" />
            </a>
        );
    }
}
