import Hero from "./components/Hero.tsx";
import FeatureGrid from "./components/FeatureGrid.tsx";

export default function HomeApp(){
  return (
    <>
      <Hero />
      <FeatureGrid />
      {/* später: Testimonials, CTA */}
    </>
  )
}