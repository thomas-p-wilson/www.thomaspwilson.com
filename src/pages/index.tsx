import Layout from "./Layout";
import Home from "./Home";
import Projects from "./Projects";
import CalculatorsList from "./projects/Calculators";
import Physical from "./projects/Physical";
import Gaming from "./projects/Gaming";
import Resume from "./Resume";
import UnitConverter from "./UnitConverter";
import ResistiveElementSizing from "./ResistiveElementSizing";
import Mortgage from "./calculators/Mortgage";
import Retirement from "./calculators/Retirement";
import Telescope from "./calculators/Telescope";
import CalculatorPage from "@/components/calculators/CalculatorPage";
import { genericCalculatorSpecs } from "@/data/calculator-specs";
import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function Pages() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/physical" element={<Physical />} />
          <Route path="/projects/gaming" element={<Gaming />} />
          <Route path="/projects/calculators" element={<CalculatorsList />} />
          <Route path="/projects/calculators/unit-converter" element={<UnitConverter />} />
          <Route path="/projects/calculators/resistive-element-sizing" element={<ResistiveElementSizing />} />
          <Route path="/projects/calculators/mortgage" element={<Mortgage />} />
          <Route path="/projects/calculators/retirement" element={<Retirement />} />
          <Route path="/projects/calculators/telescope-mirror" element={<Telescope />} />
          {genericCalculatorSpecs.map((spec) => (
            <Route
              key={spec.slug}
              path={`/projects/calculators/${spec.slug}`}
              element={<CalculatorPage spec={spec} />}
            />
          ))}
        </Routes>
      </Layout>
    </Router>
  );
}
