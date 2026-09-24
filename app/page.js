import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <footer className="py-10 text-center text-sm text-white/40 border-t border-white/5">
        © {new Date().getFullYear()} AegisDesk — Multi-tenant internal service agent.
      </footer>
    </main>
  );
}