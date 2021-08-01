import React from 'react';

import Header from '../components/layout/Header';
import ProfileCardSection from '../components/layout/ProfileCardSection';
import SkillsSection from '../components/layout/SkillsSection';
import ExperienceSection from '../components/layout/ExperienceSection';
import ServicesSection from '../components/layout/ServicesSection';
import ContactSection from '../components/layout/ContactSection';
import Footer from '../components/layout/Footer';

const Home = () => (
    <>
        <Header />
        <div className="content container">
            <ProfileCardSection />
            <SkillsSection />
            <ExperienceSection />
            <ServicesSection />
            <ContactSection />
        </div>
    </>
);

export default Home;
