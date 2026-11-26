import Layout from "./Layout";
import Home from "./Home";
import Projects from "./Projects";
import CalculatorsList from "./projects/Calculators";
import Physical from "./projects/Physical";
import Gaming from "./projects/Gaming";
import PiPrecision from "./projects/gaming/PiPrecision";
import Resume from "./Resume";
import UnitConverter from "./UnitConverter";
import ResistiveElementSizing from "./ResistiveElementSizing";
import Mortgage from "./calculators/Mortgage";
import Retirement from "./calculators/Retirement";
import CalculatorPage from "@/components/calculators/CalculatorPage";
import PhysicalProjectPage from "./projects/PhysicalProjectPage";
import SimpleEvolutionSimulator from "./projects/gaming/SimpleEvolutionSimulator";
import { genericCalculatorSpecs } from "@/data/calculator-specs";
import { physicalProjects } from "@/data/physical-projects";
import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the intentional trigger to re-run on navigation
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
          {physicalProjects.map((project) => (
            <Route
              key={project.slug}
              path={`/projects/physical/${project.slug}`}
              element={<PhysicalProjectPage project={project} />}
            />
          ))}
          <Route path="/projects/gaming" element={<Gaming />} />
          <Route path="/projects/gaming/pi-precision" element={<PiPrecision />} />
          <Route path="/projects/gaming/simple-evolution-simulator" element={<SimpleEvolutionSimulator />} />
          <Route path="/projects/calculators" element={<CalculatorsList />} />
          <Route path="/projects/calculators/unit-converter" element={<UnitConverter />} />
          <Route path="/projects/calculators/resistive-element-sizing" element={<ResistiveElementSizing />} />
          <Route path="/projects/calculators/mortgage" element={<Mortgage />} />
          <Route path="/projects/calculators/retirement" element={<Retirement />} />
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
