import Layout from "./Layout";
import Home from "./Home";
import Projects from "./Projects";
import Resume from "./Resume";
import UnitConverter from "./UnitConverter";
import ResistiveElementSizing from "./ResistiveElementSizing";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function Pages() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/calculators/unit-converter" element={<UnitConverter />} />
          <Route path="/projects/calculators/resistive-element-sizing" element={<ResistiveElementSizing />} />
        </Routes>
      </Layout>
    </Router>
  );
}
