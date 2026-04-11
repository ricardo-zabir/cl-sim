import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Home from "./pages/Home";
import CopaLibertadoresSimulator from "./pages/CopaLibertadoresSimulator";
import CopaDoBrasilSimulator from "./pages/CopaDoBrasilSimulator";
import ChampionsLeagueSimulator from "./pages/ChampionsLeagueSimulator";
import WorldCup2026Simulator from "./pages/WorldCup2026Simulator";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/copa-libertadores" element={<CopaLibertadoresSimulator />} />
        <Route path="/copa-do-brasil" element={<CopaDoBrasilSimulator />} />
        <Route path="/champions-league" element={<ChampionsLeagueSimulator />} />
        <Route path="/copa-do-mundo-2026" element={<WorldCup2026Simulator />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}
