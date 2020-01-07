import React from 'react';

const modalContainer = document.getElementById('modal-container');

export default class Overlay extends React.Component {
    constructor(props) {
        super(props);
        this.el = document.createElement('div');
    }

    // componentDidMount() {
    //     modalContainer.appendChild(this.el);
    // }

    // componentWillUnmount() {
    //     modalContainer.removeChild(this.el);
    // }

    render() {
        return React.createPortal(
            (
                <div className="overlay">
                    { this.props.children }
                </div>
            ),
            // this.el,
            modalContainer
        );
    }
}
