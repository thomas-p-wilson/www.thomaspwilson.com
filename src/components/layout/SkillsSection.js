import React from 'react';

const SkillsSection = () => (
    <section className="welcome_area p_120">
    	<div className="container">
    		<div className="row welcome_inner">
    			<div className="col-lg-6">
    				<div className="welcome_text">
    					<h4>About Me</h4>
    					<p>I have been designing and building software professionally for ~{ (new Date()).getFullYear() - 2003 } years. In that time I have been driven by a motivation to always learn as much as I can about everything I encounter. It is this drive to learn and improve that has made me an asset to those organization I have served.</p>
    					{ /*<div className="row">
    						<div className="col-md-4">
    							<div className="wel_item">
    								<i className="lnr lnr-database"></i>
    								<h4>$2.5M</h4>
    								<p>Total Donation</p>
    							</div>
    						</div>
    						<div className="col-md-4">
    							<div className="wel_item">
    								<i className="lnr lnr-book"></i>
    								<h4>1465</h4>
    								<p>Total Projects</p>
    							</div>
    						</div>
    						<div className="col-md-4">
    							<div className="wel_item">
    								<i className="lnr lnr-users"></i>
    								<h4>3965</h4>
    								<p>Total Volunteers</p>
    							</div>
    						</div>
    					</div> */ }
    				</div>
    			</div>
    			<div className="col-lg-6">
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
    			</div>
    		</div>
    	</div>
    </section>
);

export default SkillsSection;
