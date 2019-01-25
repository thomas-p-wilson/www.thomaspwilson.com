import React from 'react';

const Footer = () => (
    <footer className="footer-section">
    	<div className="container">
    		<div className="row">
                <p class="copyright">&copy; 2014-{ (new Date()).getFullYear() } Thomas P. Wilson</p>
    		</div>
    	</div>
    </footer>
);

export default Footer;
