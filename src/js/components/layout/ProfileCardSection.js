import React from 'react';

const ProfileCardSection = () => (
    <section className="about-card">
       	<div className="container wide">
       		<div className="banner-inner d-flex align-items-center">
				<div className="banner_content">
					<div className="media">
						<div className="d-flex">
							<img src="/assets/img/me.jpg" alt="Thomas Wilson" />
						</div>
						<div className="media-body">
							<div className="about-text">
								<h3>Thomas P. Wilson</h3>
								<h4>Software Architect</h4>
								<p>Once something is a passion, the motivation is there. - Michael Schumacher</p>
								<p>I am a passionate, focused, and motivated architect who revels in crafting scalable, fault-tolerant solutions to whatever problem presents itself. I consult on the aforementioned matters, as well as those of security, performance, and general design.</p>
								<p>I build and restore boats. Wooden boats. In all other things, I dabble.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
        </div>
    </section>
);

export default ProfileCardSection;
