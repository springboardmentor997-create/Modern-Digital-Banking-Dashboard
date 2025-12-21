import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Services from './pages/Services';
import Analytics from './pages/Analytics';
import Support from './pages/Support';

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet /> 
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path = "/Dashboard" element = {<Dashboard/>} />
        <Route path="/Services" element={<Services />} />
        <Route path="/Analytics" element={<Analytics />} />
        <Route path="/Support" element={<Support />} />
      </Route>

      <Route path="/login" element={<Login />} />

    </Routes>
  );
}
