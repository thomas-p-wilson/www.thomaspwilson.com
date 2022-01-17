import React from 'react';
import { graphql } from 'gatsby';
import Header from '../components/layout/Header';
import ProfileCardSection from '../components/layout/ProfileCardSection';
import SkillsSection from '../components/layout/SkillsSection';
import ExperienceSection from '../components/layout/ExperienceSection';
import ServicesSection from '../components/layout/ServicesSection';
import ContactSection from '../components/layout/ContactSection';
import Footer from '../components/layout/Footer';
import '../scss/style.scss';

const Root = () => (
  <div>
      <Header />
      <ProfileCardSection />
      <SkillsSection />
      <ExperienceSection />
      <ServicesSection />
      <ContactSection />
      <Footer />
  </div>
);
export default Root;

export const query = graphql`
  # query will go here
  query HomePageQuery {
    site {
      siteMetadata {
        description
      }
    }
  }
`;
