import React from 'react';
import classNames from 'classnames';

export default class Accordion extends React.Component {
    constructor() {
        super();
        this.state = { section: -1 };
        this.onClick = this.onClick.bind(this);
    }

    onClick(ev, i) {
        const panel = ev.target.closest('.accordion-element').querySelector('.panel');
        this.setState(({ section, maxHeight }) => {
            if (section !== i) {
                return {
                    section: i,
                    maxHeight: panel.scrollHeight,
                }
            }
            return {
                section: -1,
            };
        });
    }

    render() {
        return (
            <ul className="accordion">
                {
                    this.props.data.map((datum, i) => (
                        <li className="accordion-element">
                            <div className="title" onClick={ (el) => { this.onClick(el, i) } }>
                                { datum.title }
                            </div>
                            <div className={ classNames('panel', { active: i === this.state.section }) }
                                    style={{ maxHeight: i === this.state.section ? this.state.maxHeight : undefined }}>
                                { datum.body }
                            </div>
                        </li>
                    ))
                }
            </ul>
        );
    }
}
