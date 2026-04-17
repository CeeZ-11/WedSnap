import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation } from
'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { UploadPage } from './pages/UploadPage';
import { GalleryPage } from './pages/GalleryPage';
import { SlideshowPage } from './pages/SlideshowPage';
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<UploadPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/slideshow" element={<SlideshowPage />} />
      </Routes>
    </AnimatePresence>);

}
export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-ivory font-sans text-dark selection:bg-gold/30">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>);

}