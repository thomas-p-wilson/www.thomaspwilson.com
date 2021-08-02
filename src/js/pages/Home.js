import React from 'react'
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { useScrollableBackground } from '../utils/background';

export default () => {
    useScrollableBackground('.home section');

    return (
        <div className="home">
            <section className="splash" data-background="#ffffff">
                <div>
                    <img src="/assets/img/me.png" alt="Thomas Wilson" className="photo" />
                    <h1>Thomas P. Wilson</h1>
                    <p>Skilled and passionate developer and architect, focusing on data privacy and security.</p>
                    <p>I build and restore boats.</p>
                </div>
            </section>

            <section className="side-by-side bragging" data-background="#d9dbf1">
                <h2>About Me</h2>
                <article>
                    <p>I have been designing and building software professionally for {(new Date()).getFullYear() - 2003} years. In that time I have been driven by a motivation to always learn as much as I can about everything I encounter. It is this drive to learn and improve that has made me an asset to those organizations I have served.</p>

                    <p>Technologies I have worked with include:</p>
                    <ul className="tag-list">
                        <li className="badge badge-pill">Testing</li>
                        <li className="badge badge-pill">TDD</li>
                        <li className="badge badge-pill">Docker</li>
                        <li className="badge badge-pill">Python</li>
                        <li className="badge badge-pill">BDD</li>
                        <li className="badge badge-pill">Linux</li>
                        <li className="badge badge-pill">Git</li>
                        <li className="badge badge-pill">Hudson</li>
                        <li className="badge badge-pill">Gitlab</li>
                        <li className="badge badge-pill">Tomcat</li>
                        <li className="badge badge-pill">Java</li>
                        <li className="badge badge-pill">Spring</li>
                        <li className="badge badge-pill">Struts</li>
                        <li className="badge badge-pill">PHP</li>
                        <li className="badge badge-pill">Ruby</li>
                        <li className="badge badge-pill">C</li>
                        <li className="badge badge-pill">C++</li>
                        <li className="badge badge-pill">Javascript</li>
                        <li className="badge badge-pill">(X)HTML</li>
                        <li className="badge badge-pill">CSS 1,2,3</li>
                        <li className="badge badge-pill">Angular.js</li>
                        <li className="badge badge-pill">React.js</li>
                        <li className="badge badge-pill">Node.js</li>
                        <li className="badge badge-pill">MSSQL</li>
                        <li className="badge badge-pill">MySQL</li>
                        <li className="badge badge-pill">PostgreSQL</li>
                        <li className="badge badge-pill">MongoDB</li>
                        <li className="badge badge-pill">Cassandra</li>
                        <li className="badge badge-pill">Elasticsearch</li>
                        <li className="badge badge-pill">AWS</li>
                        <li className="badge badge-pill">Windows</li>
                        <li className="badge badge-pill">Subversion</li>
                        <li className="badge badge-pill">OracleDB</li>
                        <li className="badge badge-pill">.NET</li>
                        <li className="badge badge-pill">Subversion</li>
                        <li className="badge badge-pill">CVS</li>
                        <li className="badge badge-pill">ActionScript</li>
                        <li className="badge badge-pill">Haskell</li>
                        <li className="badge badge-pill">Eclipse</li>
                        <li className="badge badge-pill">Netbeans</li>
                        <li className="badge badge-pill">Sublime</li>
                        <li className="badge badge-pill">Vim</li>
                        <li className="badge badge-pill">Atom</li>
                        <li className="badge badge-pill">Liferay</li>
                        <li className="badge badge-pill">OracleAS</li>
                        <li className="badge badge-pill">Jetty</li>
                        <li className="badge badge-pill">Pluto</li>
                        <li className="badge badge-pill">Netty</li>
                        <li className="badge badge-pill">Hudson</li>
                        <li className="badge badge-pill">TravisCI</li>
                        <li className="badge badge-pill">CircleCI</li>
                        <li className="badge badge-pill">Redis</li>
                        <li className="badge badge-pill">Memcached</li>
                        <li className="badge badge-pill">Kafka</li>
                        <li className="badge badge-pill">React.js</li>
                        <li className="badge badge-pill">Redux</li>
                        <li className="badge badge-pill">GraphQL</li>
                        <li className="badge badge-pill">Websockets</li>
                        <li className="badge badge-pill">Sock.js / Socket.io</li>
                        <li className="badge badge-pill">J2EE</li>
                        <li className="badge badge-pill">Machine Learning</li>
                        <li className="badge badge-pill">Erlang</li>
                        <li className="badge badge-pill">Elixir</li>
                        <li className="badge badge-pill">Phoenix</li>
                        <li className="badge badge-pill">Meteor.js</li>
                    </ul>
                </article>
            </section>

            <section id="experience" className="side-by-side reverse" data-background="#d0cdd7">
                <h2 style={{ textAlign: 'left' }}>CTO/Co-Founder<br /><small><span className="badge badge-pill">Privacy+</span></small></h2>
                <article>
                    <p>I head the engineering department at Privacy Request. We're a team of engineers who, in many cases, have a storied history of punching well above our weight. Together, we are even stronger, and many of us have worked together before! We're obsessed with bringing tools and guidance to the thousands of organizations that require privacy management tools.</p>

                    <p>I break my responsibilities into three broad categories:</p>
                    <ul>
                        <li>Architecture & Engineering</li>
                        <li>Team Morale, Cohesion, and Proficiency</li>
                        <li>Business Growth & Success</li>
                    </ul>

                    <p>Architecture & Engineering</p>
                    <ul>
                        <li>Leading architecture and design efforts</li>
                        <li>Act as the technical authority for solution, system, data, and business architecture</li>
                        <li>Research, recommend, and implement innovative technologies for internal and external products</li>
                        <li>Design enterprise solutions focused on performance, scalability, and fault-tolerance</li>
                    </ul>

                    <p>Team Morale, Cohesion, and Proficiency</p>
                    <ul>
                        <li>Participate in the senior management role of strategizing on the company's future goals and ultimate success</li>
                        <li>Provide leadership and guidance to the engineering team</li>
                        <li>Implement engineering best-practices policies</li>
                        <li>Expand the engineering team through the hiring of new teammates</li>
                    </ul>

                    <p>Business Growth & Success</p>
                    <ul>
                        <li>Provide governance and support for internal and external projects</li>
                        <li>Identify and develop new business opportunities</li>
                        <li>Assist acquisition of new business for the company's services and products</li>
                    </ul>

                    <p>Privacy Request is a Canadian company working tirelessly to provide its clients with intelligent, intuitive software for managing all aspects of customer privacy in an increasingly regulated and litigious society. We reduce running costs for our clients by making privacy compliance easy and minimizing the amount of time privacy practitioners spend categorizing data and fulfilling requests.</p>
                    <ul class="tag-list brand">
                        <li className="badge badge-pill">Docker</li>
                        <li className="badge badge-pill">Python</li>
                        <li className="badge badge-pill">Linux</li>
                        <li className="badge badge-pill">Git</li>
                        <li className="badge badge-pill">Java</li>
                        <li className="badge badge-pill">Javascript</li>
                        <li className="badge badge-pill">HTML</li>
                        <li className="badge badge-pill">CSS 1,2,3</li>
                        <li className="badge badge-pill">Node.js</li>
                        <li className="badge badge-pill">PostgreSQL</li>
                        <li className="badge badge-pill">AWS</li>
                        <li className="badge badge-pill">CircleCI</li>
                        <li className="badge badge-pill">Redis</li>
                        <li className="badge badge-pill">React.js</li>
                        <li className="badge badge-pill">Redux</li>
                        <li className="badge badge-pill">GraphQL</li>
                        <li className="badge badge-pill">Websockets</li>
                        <li className="badge badge-pill">Apollo</li>
                        <li className="badge badge-pill">Terraform</li>
                    </ul>
                </article>
            </section>

            <section id="services" data-background="#e6eeef">
                <h2>Services</h2>
                <article>
                    <p>I provide consulting and develompent services on a case-by-case basis, to those clients with an interesting proposition or problem. Feel free to <Link to="#contact">contact me</Link> if you would like to contract my services.</p>

                    <ul className="service-list">
                        <li>
                            <div className="icon-wrapper">
                                <i className="icon icon-gauge" />
                            </div>
                            <div>
                                <h4>Performance Diagnostics &amp; Remediation</h4>
                                <p>Locate problematic configurations, queries, and functions that are dragging down your application.</p>
                            </div>
                        </li>
                        <li>
                            <div className="icon-wrapper">
                                <i className="icon icon-infrastructure" />
                            </div>
                            <div>
                                <h4>Infrastructure Provisioning &amp; Management</h4>
                                <p>Provision and maintain your cloud infrastructure in a variety of platforms, including hybrid cloud.</p>
                            </div>
                        </li>
                        <li>
                            <div className="icon-wrapper">
                                <i className="icon icon-pipeline" />
                            </div>
                            <div>
                                <h4>Deployment Pipeline Automation</h4>
                                <p>Deploy your applications using CircleCI, Travis, Jenkins, or other CI/CD pipelines.</p>
                            </div>
                        </li>
                        <li>
                            <div className="icon-wrapper">
                                <i className="icon icon-containers" />
                            </div>
                            <div>
                                <h4>Application Dockerization</h4>
                                <p>Produce a production-ready dockerized application for easy container-based orchestration.</p>
                            </div>
                        </li>
                        <li>
                            <div className="icon-wrapper">
                                <i className="icon icon-cloud" />
                            </div>
                            <div>
                                <h4>Architecture Consulting</h4>
                                <p>Provide a high-level implementation strategy, appropriate technical standards, tooling, and platform choices.</p>
                            </div>
                        </li>
                        <li>
                            <div className="icon-wrapper">
                                <i className="icon icon-lock" />
                            </div>
                            <div>
                                <h4>Security Consulting</h4>
                                <p>Spot and remedy network and application security issues, configure appropriate monitoring and alerts.</p>
                            </div>
                        </li>
                    </ul>
                </article>
            </section>

            <section id="contact" data-background="#f7f1f4">
                <h2>Contact</h2>
                <article>
                    <ul className="nav nav-horizontal social-button-list">
                        <li><a href="https://ca.linkedin.com/in/thomaspwilson" title="LinkedIn"><i className="icon icon-linkedin"></i></a></li>
                        <li><a href="https://github.com/thomas-p-wilson" title="Github"><i className="icon icon-github"></i></a></li>
                    </ul>
                    <div className="row">
                        <div className="col-sm-12">
                            <form action="#" method="post">
                                <input type="text" className="form-control" placeholder="Name" />
                                <input type="email" className="form-control" placeholder="Email Address" />
                                <textarea className="form-control" placeholder="Talk to me..." rows="5" cols="10"></textarea>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </form>
                        </div>
                    </div>
                </article>
            </section>
        </div>
    );
}
