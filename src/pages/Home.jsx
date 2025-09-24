import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import SkillsSection from '../components/home/SkillsSection';
import ContactSection from '../components/home/ContactSection';

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ContactSection />
    </div>
  );
}