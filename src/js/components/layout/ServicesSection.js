import React from 'react';

const ServicesSection = () => (
    <section className="services-section p_120">
    	<div className="container">
    		<div className="main_title">
    			<h2>Services</h2>
    			<p>I provide consulting and develompent services on a case-by-case basis, to those clients with an interesting proposition or problem. Feel free to [contact me]() if you would like to contract my services.</p>
    		</div>
    		<div className="services-wrapper row">
				<div className="service-item col-lg-4 col-md-6">
					<i className="fi flaticon-026-structure"></i>
					<h4>System Design</h4>
                    <p>Evermore complex projects require higher levels of application and system oversight. I can provide your in-house or outsourced development team with high-level design decisions, technical standards, and tooling and platform choices.</p>
				</div>
				<div className="service-item col-lg-4 col-md-6">
					<i className="fi flaticon-010-developer"></i>
					<h4>Development</h4>
					<p>Push your project to success by adding an experienced hand to your development project. My scope of experience will bring many benefits including a fast but reliable developer, fresh eyes to spot obscure problems, and a reasoned advocate for good development practices.</p>
				</div>
				<div className="service-item col-lg-4 col-md-6">
					<i className="fi flaticon-003-applications"></i>
					<h4>Security Consultation</h4>
					<p>My experience designing, building, and monitoring large and small systems gives me insight into a broad set of security issues, how to spot them, and how to remedy them. I crack your system so others won't.</p>
				</div>
    		</div>
    	</div>
    </section>
);

export default ServicesSection;
