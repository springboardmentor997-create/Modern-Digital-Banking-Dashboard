/**
 * Page: Home
 *
 * Purpose:
 * - Landing page of the application (public page)
 * - Introduces the Digital Banking platform to users
 *
 * Key Sections:
 * - Hero section (headline & call-to-action)
 * - Features overview
 * - How it works
 * - Reviews / trust indicators
 *
 * Connected Components:
 * - Navbar.jsx
 * - HeroSection.jsx
 * - Features.jsx
 * - HowItWorks.jsx
 * - Reviews.jsx
 * - Footer.jsx
 *
 * Navigation:
 * - Redirects users to Login or Register pages
 *
 * Note:
 * - No authentication required
 * - No API calls performed here
 */



import Navbar from "@/components/user/home/Navbar";
import HeroSection from "@/components/user/home/HeroSection";
import Features from "@/components/user/home/Features";
import HowItWorks from "@/components/user/home/HowItWorks";
import Reviews from "@/components/user/home/Reviews";
import Footer from "@/components/user/home/Footer";
import FAQ from "@/components/user/home/FAQ";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white">
      <Navbar />
      <HeroSection />
      <Features />
      <HowItWorks />
      <FAQ />
      <Reviews />
      <Footer />
    </div>
  );
};

export default Home;
