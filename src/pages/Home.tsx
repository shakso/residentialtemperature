import React from 'react';
import HomeNavbar from '../components/navigation/HomeNavbar';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import PlansSection from '../components/home/PlansSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <HomeNavbar />
      <div className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <PlansSection />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
