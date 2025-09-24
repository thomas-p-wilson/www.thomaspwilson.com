import Layout from "./Layout.jsx";

import Home from "./Home";

import Calculators from "./Calculators";

import Resume from "./Resume";

import UnitConverter from "./UnitConverter";

import ResistiveElementSizing from "./ResistiveElementSizing";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Calculators: Calculators,
    
    Resume: Resume,
    
    UnitConverter: UnitConverter,
    
    ResistiveElementSizing: ResistiveElementSizing,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Calculators" element={<Calculators />} />
                
                <Route path="/Resume" element={<Resume />} />
                
                <Route path="/UnitConverter" element={<UnitConverter />} />
                
                <Route path="/ResistiveElementSizing" element={<ResistiveElementSizing />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}