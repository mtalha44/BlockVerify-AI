import FeaturesSection from "../../components/HomePageSections/FeatureSection";
import HeroSection from "../../components/HomePageSections/Hero";
import StatSection from "../../components/HomePageSections/Stats";
import TrustAndStats from "../../components/HomePageSections/TrustedUni";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TrustAndStats />
      <StatSection />
    </>
  );
};

export default HomePage;
