export type CopyIcon = "sparkles" | "heart" | "users" | "calendar" | "tag" | "clock";

export interface SiteCopy {
  tagline: string;
  hero: { badge: string; titleTop: string; titleAccent: string; intro: string; primary: string; secondary: string };
  why: { title: string; intro: string; cards: Array<{ icon: CopyIcon; title: string; description: string }> };
  services: { title: string; intro: string; viewAll: string };
  cta: { title: string; text: string; primary: string; secondary: string };
  stats: Array<{ label: string; value: string }>;
}

export const siteCopy: SiteCopy = {
  tagline: "Nail care and spa services",
  hero: {
    badge: "NAIL CARE & SPA",
    titleTop: "Indulge in",
    titleAccent: "Pure Elegance",
    intro: "Manicures, pedicures and more. Take a moment for yourself and let us look after your hands and feet.",
    primary: "Book now",
    secondary: "Call us",
  },
  why: {
    title: "Why Choose",
    intro: "Simple, friendly nail care with clear prices.",
    cards: [
      { icon: "sparkles", title: "Nail and spa services", description: "Manicures, pedicures, sets and waxing in one place." },
      { icon: "tag", title: "Clear prices", description: "Every service is listed with its price and time." },
      { icon: "calendar", title: "Easy booking", description: "Book online or give us a call." },
      { icon: "heart", title: "A relaxing visit", description: "We want every visit to feel calm and unhurried." },
    ],
  },
  services: {
    title: "Popular Services",
    intro: "A few of our services. See the full list for everything we offer.",
    viewAll: "View All Services",
  },
  cta: {
    title: "Ready for Your Visit?",
    text: "Book your appointment online or give us a call.",
    primary: "Book now",
    secondary: "Explore Services",
  },
  stats: [],
};
