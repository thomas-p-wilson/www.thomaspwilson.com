import React from 'react';
import TagList from '../components/TagList';

const Resume = () => (
    <div>
        <section class="section-padded resume">
            <div class="container">
                <h2 class="section-title">Résumé</h2>

                <ul className="experience-list">
                    <li>
                        <h4>Independent Consultant <small>Thomas P. Wilson</small></h4>
                        <h5>January 2006 – Present</h5>
                        <p>I provide software design and architecture consulting services for small, medium, and large technology organizations alike. I also provide development services for organizations that require new software, or updates and changes to existing systems.</p>
                        <TagList tags={['Linux', 'Git', 'Hudson', 'Gitlab', 'Tomcat', 'Java', 'Spring', 'Struts', 'PHP', 'Ruby', 'C/C++', 'Javascript', 'HTML', 'CSS', 'Angular.js', 'React.js', 'NodeJS', '.NET', 'MSSQL', 'MySQL', 'MongoDB', 'ElasticSearch', 'Cassandra', 'AWS']} />
                    </li>
                    <li>
                        <h4>Systems and Development Lead <small>Shore Consulting Group</small></h4>
                        <h5>October 2011 - January 2014 (2 years 4 months)</h5>
                        <ul>
                            <li>Responsible for company hardware/software setup and maintenance. This includes Windows and Linux servers, workstations, etc.</li>
                            <li>Maintain development systems and procedures. This includes Subversion and Git source control server maintenance, continuous integration, testing frameworks, etc.</li>
                            <li>Responsible for network and system security.</li>
                            <li>Lead developer for education information system. SaaS architecture.</li>
                            <li>Heavy J2EE focus. Both SQL and NoSQL datasources.</li>
                            <li>Responsible for maintaining legacy PHP-based projects.</li>
                            <li>Architectural and some requirements-gathering responsibilities.</li>
                            <li>Light duties associated with two government-related projects. MSSQL, Oracle maintenance/utilization.</li>
                            <li>Some work in .NET technologies (C#, VB, ASP)</li>
                            <li>Some work in Ruby and RoR</li>
                        </ul>
                        <TagList tags={['Windows', 'Linux', 'Subversion', 'Git', 'Gitlab', 'Tomcat', 'SAS', 'Java', 'Spring', 'Struts', 'PHP', 'Ruby', 'OracleDB', 'Javascript', 'HTML', 'CSS', '.NET', 'MSSQL', 'MySQL', 'MongoDB', 'ElasticSearch', 'AWS']} />
                    </li>
                    <li>
                        <h4>Intermediate Programmer <small>Shore Consulting Group</small></h4>
                        <h5>May 2011 - October 2011 (6 months)</h5>
                        <ul>
                            <li>Developer for education information system.</li>
                            <li>Some responsibility for client communication and product review.</li>
                            <li>Maintenance of Linux and Windows infrastructure.</li>
                            <li>Some development for other government-related projects. Copious amounts of Java.</li>
                        </ul>
                        <TagList tags={['Linux', 'Windows', 'PHP', 'Java', 'Spring', 'Struts', 'HTML', 'CSS', 'Javascript', 'OracleDB', 'Git', 'Tomcat', 'Hudson', 'Eclipse']} />
                    </li>
                    <li>
                        <h4>Jr. Programmer <small>Shore Consulting Group</small></h4>
                        <h5>January 2011 - May 2011 (5 months)</h5>
                        <ul>
                            <li>Discovered and rectified a platform-dependency flaw in one product, reducing deployment complexity and reducing deploy time from ~2 hours to ~30 seconds.</li>
                            <li>Introduced Git and Hudson/Jenkins environment, further reducing deployment time.</li>
                            <li>Maintenance and stability enhancements for education information system.</li>
                            <li>Focus on PHP development and cleanup. Heavy MySQL utilization.</li>
                            <li>Basic maintenance of some infrastructure.</li>
                        </ul>
                        <TagList tags={['Linux', 'Windows', 'PHP', 'HTML', 'CSS', 'Javascript', 'OracleDB', 'Git', 'Hudson', 'Eclipse']} />
                    </li>
                    <li>
                        <h4>Programmer/Analyst <small>Georgian College</small></h4>
                        <h5>January 2010 - October 2010 (10 months)</h5>
                        <ul>
                            <li>Responsible for most portal maintenance.</li>
                            <li>Worked to migrate from Oracle Application Server to Liferay</li>
                            <li>Heavy focus on requirements analysis</li>
                            <li>Dealt with several politically volatile and stressful situations with ease</li>
                        </ul>
                        <TagList tags={['Java', 'HTML', 'CSS', 'Javascript', 'OracleDB', 'Subversion', 'Liferay', 'Tomcat', 'OracleAS', 'Hudson', 'Eclipse']} />
                    </li>
                    <li>
                        <h4>Programmer <small>CampusEAI Consortium (Cleveland, OH)</small></h4>
                        <h5>September 2009 - December 2009 (4 months)</h5>
                        <ul>
                            <li>Developed several portal-based J2EE applications for Liferay platform.</li>
                            <li>Focus on MySQL and OracleDB, with Hypersonic for dev-station development.</li>
                            <li>Tasked with researching various subjects, usually resulting in feasability studies.</li>
                        </ul>
                        <TagList tags={['Java', 'HTML', 'CSS', 'Javascript', 'OracleDB', 'Subversion', 'Liferay', 'Tomcat', 'OracleAS', 'Hudson', 'Eclipse']} />
                    </li>
                    <li>
                        <h4>Programmer/Analyst <small>Georgian College</small></h4>
                        <h5>November 2008 – September 2009 (11 months)</h5>
                        <p>Designed and implemented department-specific productivity applications, comprised of J2EE services coupled with Oracle Application Server and Oracle DB.</p>
                        <ul>
                            <li>Introduced robust development environment and procedurces consisting of Hudson CI, Subversion VCS, and other automation and productivity software,</li>
                            <li>Streamlined application deployment process, decreasing deployment time by more than 50%.</li>
                            <li>Heavy focus on J2EE development of applications and services.</li>
                            <li>Maintained both Tomcat and Oracle Application Server installations</li>
                        </ul>
                        <TagList tags={['Java', 'HTML', 'CSS', 'Javascript', 'OracleDB', 'Subversion', 'Liferay', 'Tomcat', 'OracleAS', 'Hudson', 'Eclipse']} />
                    </li>
                    <li>
                        <h4>Jr. Programmer <small>Arcline (2000) Inc.</small></h4>
                        <h5>May 2008 - August 2008 (4 months)</h5>
                        <ul>
                            <li>Responsible for client-side and server-side software updates.</li>
                            <li>Customer support responsibilities. Interpersonal skills proved invaluable.</li>
                            <li>Rewrote web-based freight tracking application, increasing efficiency and security.</li>
                        </ul>
                        <TagList tags={['Visual FoxPro', 'Visual Basic', 'Visual Source Safe', 'ASP Classic', 'HTML', 'CSS', 'Javascript']} />
                    </li>
                </ul>
            </div>
        </section>
    </div>
);

export default Resume;
