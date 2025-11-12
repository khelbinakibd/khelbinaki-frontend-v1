import { Outlet } from "react-router";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import ScrollToTop from "../utils/ScrollToTop ";
import OfflineIndicator from "../Components/OfflineIndicator";
// import { useEffect } from "react";
// import Lenis from "@studio-freight/lenis";

const MainLayout = () => {

  // useEffect(() => {
  //   const lenis = new Lenis({
  //     duration: 1.4, // little slower for buttery feel
  //     easing: (t) => 1 - Math.pow(2, -10 * t), // smooth easeOutExpo
  //     smoothWheel: true,
  //     // smoothTouch removed in newer versions; touch behavior handled internally
  //     touchMultiplier: 1.8, // faster swipe response on mobile
  //     infinite: false, // set true if you want infinite scroll
  //   });

  //   function raf(time: number) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }
  //   requestAnimationFrame(raf);
  //   return () => {
  //     lenis.destroy();
  //   };
  // }, []);


  return (
    <div>
      <OfflineIndicator />
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}
export default MainLayout;
