import { Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import TrackingPage from "@/pages/TrackingPage";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/tracking" element={<TrackingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
