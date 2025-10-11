import {
  HeroSection,
  SocialProof,
  FeaturesShowcase,
  DisciplineGrid,
  HowItWorks,
  CallToAction
} from '../components/landing';
import HomescreenReminderPopup from '../components/landing/HomescreenReminderPopup';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <HeroSection />
      <div className="px-6">
        <SocialProof ctaHref="https://discord.gg/mFwU76MTft" />
        <DisciplineGrid />
        <HowItWorks />
        <FeaturesShowcase />
      </div>
      <CallToAction />
      <HomescreenReminderPopup />
    </div>
  );
}
