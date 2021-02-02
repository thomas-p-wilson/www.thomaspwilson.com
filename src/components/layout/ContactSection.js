import React from 'react';

const ContactSection = () => (
    <section className="contact-section p_120">
    	<div className="container">
    		<div className="main_title">
    			<h2>Contact</h2>
    		</div>
    		<ul className="nav nav-horizontal social-button-list">
                <li><a href="https://ca.linkedin.com/in/thomaspwilson" title="LinkedIn"><i className="fa fa-linkedin-square"></i></a></li>
                <li><a href="https://github.com/thomas-p-wilson" title="Github"><i className="fa fa-github-square"></i></a></li>
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
    	</div>
    </section>
);

export default ContactSection;
