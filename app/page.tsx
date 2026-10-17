import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Highlights } from "@/components/landing/highlights";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Documents } from "@/components/landing/documents";
import { SchoolScores } from "@/components/landing/school-scores";
import { QuoteForm } from "@/components/landing/quote-form";
import { FaqSection } from "@/components/landing/faq";
import { CtaBanner } from "@/components/landing/cta-banner";
import { ChatWidget } from "@/components/landing/chat-widget";

// Danh sách trường lấy từ Supabase; làm mới tối đa 5 phút một lần
export const revalidate = 300;

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Stats />
        <Highlights />
        <HowItWorks />
        <Documents />
        <SchoolScores />
        <QuoteForm />
        <FaqSection />
        <CtaBanner />
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
