import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
//import AnalyzerPage from './components/AnalyzerPage';
import ParsingPage from './components/ParsingPage';
import FilteringPage from './components/FilteringPage';
import AnalyticsPage from './components/AnalyticsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      { /* <Route path="/analyzer" element={<AnalyzerPage />} />*/}
        <Route path="/parsing" element={<ParsingPage />} />
        <Route path="/filtering" element={<FilteringPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;