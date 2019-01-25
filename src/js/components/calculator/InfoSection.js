import React from 'react';
import classnames from 'classnames';

export default class InfoSection extends React.Component {
    constructor() {
        super();
        this.state = {
            closed: true
        };
        this.expand = this.expand.bind(this);
        this.collapse = this.collapse.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show === this.props.show) {
            return;
        }

        if (this.props.show) {
            console.log('Expand');
            this.expand();
        } else {
            console.log('Collapse');
            this.collapse();
        }
    }

    expand() {
        const self = this;

        this.setState({ closed: false }, () => {
            var sectionHeight = this.node.scrollHeight;
            this.node.style.height = sectionHeight + 'px';

            this.node.addEventListener('transitionend', function f(e) {
                self.node.removeEventListener('transitionend', f);

                self.node.style.height = null;
            });

            this.node.setAttribute('data-collapsed', 'false');
        })
    }

    collapse() {
        const self = this;

        var sectionHeight = this.node.scrollHeight;
        this.node.style.height = sectionHeight + 'px';

        this.setState({ closed: true }, () => {
            this.node.addEventListener('transitionend', function f(e) {
                self.node.removeEventListener('transitionend', f);

                self.node.style.display = null;
            });

            requestAnimationFrame(() => {
                self.node.style.height = 0 + 'px';
            });

            this.node.setAttribute('data-collapsed', 'true');
        })
    }

    render() {
        const { closed } = this.state;
        const { className, ...props } = this.props;
        return (
            <dd { ...props } className={ classnames('info-section', className, { closed }) }
                    ref={ (ref) => { this.node = ref; } }>
                <p>{ this.props.children }</p>
            </dd>
        );
    }
}