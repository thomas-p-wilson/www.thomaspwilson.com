import Layout from "./Layout";
import Home from "./Home";
import Calculators from "./Calculators";
import Resume from "./Resume";
import UnitConverter from "./UnitConverter";
import ResistiveElementSizing from "./ResistiveElementSizing";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

const PAGES = {
  Home,
  Calculators,
  Resume,
  UnitConverter,
  ResistiveElementSizing,
};

function getCurrentPage(url: string) {
  const trimmed = url.endsWith("/") ? url.slice(0, -1) : url;
  const lastPart = (trimmed.split("/").pop() ?? "").split("?")[0];
  const pageName = Object.keys(PAGES).find((page) => page.toLowerCase() === lastPart.toLowerCase());
  return pageName ?? Object.keys(PAGES)[0];
}

function PagesContent() {
  const location = useLocation();
  const currentPage = getCurrentPage(location.pathname);

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
