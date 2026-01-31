import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import Browse from './pages/Browse'; // 1. Import Browse
import Page from './pages/Page';   // 2. Import Read
import Manga from './pages/Manga';   // 2. Import Read

function AppContent() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* HOME ROUTE */}
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-screen bg-[#050505]"
            >
              <Home />
            </motion.div>
          }
        />

        {/* BROWSE ROUTE - This was the missing piece! */}
        <Route
          path="/browse"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-screen bg-[#050505]"
            >
              <Browse />
            </motion.div>
          }
        />


        <Route
          path="/read/:mangaId/chapter/:chapterId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-screen bg-[#050505]"
            >
              <Page />
            </motion.div>
          }
        />

        {/* READ ROUTE - This was the missing piece! */}
        <Route
          path="/read/:mangaId"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-screen bg-[#050505]"
            >
              <Manga />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;