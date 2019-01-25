import React from 'react';
import classnames from 'classnames';
import OutsideClickWatcher from '../box/OutsideClickWatcher';
import stateful from '../../decorators/stateful';

const defaultTransformer = (options) => {
    if (Array.isArray(options)) {
        return options;
    }

    return Object.keys(options)
            .reduce((o, value) => {
                o.push({
                    title: options[value],
                    value: value
                });
                return o;
            }, []);
}

const titleTransformer = (title, options) => {
    const selected = options.find((o) => (o.selected));
    if (selected) {
        return selected.title;
    }
    return title;
}

export default stateful({ open: true })(({ id, title, options, transformer = defaultTransformer, onChange, className, open, updateopen }) => (
    <div className={ classnames('dropdown clearfix', className, { open }) }>
        <button type="button" className="btn btn-default dropdown-toggle" onClick={ () => { updateopen(!open) } }>{ titleTransformer(title, options) } <span className="caret"></span></button>
        <OutsideClickWatcher onClick={ () => { updateopen(false); } }>
            <ul className="dropdown-menu">
                {
                    transformer(options).map((option) => (
                        <li className={ option.selected ? 'active' : '' }><a onClick={ () => { onChange(id, option.value); updateopen(false); } }>{ option.title }</a></li>
                    ))
                }
            </ul>
        </OutsideClickWatcher>
    </div>
));
