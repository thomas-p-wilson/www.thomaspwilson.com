import React, { useState } from 'react';
import classnames from 'classnames';

const Tabs = ({ tabs, className, ...props }) => {
    const [currentTab, setCurrentTab] = useState(tabs[0]);

    return (
        <>
            <ul className={ classnames('tabs nav nav-pills justify-content-center', className) }>
                {
                    tabs.map((t) => (
                        <li className="nav-item" key={t.title}>
                            <button className={classnames('nav-link', {active: t === currentTab})} onClick={() => {setCurrentTab(t)}} href="#">{t.title}</button>
                        </li>
                    ))
                }
            </ul>
            <section className="App-content">
                <currentTab.component { ...props } />
            </section>
        </>
    );
}

export default Tabs;
