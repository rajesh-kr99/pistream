import PiDisplay from "@/components/PiDisplay";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "π Forever",
  url: "https://pistream.xyz",
  description:
    "A new digit of π is revealed every 60 seconds, starting Pi Day 2026. Watch pi unfold in real time, search for your birthday, and predict the next digit.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  datePublished: "2026-03-14",
  inLanguage: "en",
  isAccessibleForFree: true,
  about: {
    "@type": "Thing",
    name: "Pi (mathematical constant)",
    sameAs: "https://en.wikipedia.org/wiki/Pi",
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PiDisplay />
    </main>
  );
}
