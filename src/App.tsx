import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import Home from "./Pages/home";
import AutomaticRecommendation from "./Pages/automatic_recommendation";
import CustomRecommendation from "./Pages/custom_recommendation";

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/automatic" element={<AutomaticRecommendation />} />
          <Route path="/custom" element={<CustomRecommendation />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
