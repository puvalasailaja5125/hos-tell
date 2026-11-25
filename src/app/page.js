import Link from "next/link";
import { ArrowRight, ChevronDown, Plane, Sparkles, UtensilsCrossed, Wallet, Wrench } from "lucide-react";
import { getSession } from "@/lib/auth";
import LandingNav from "@/components/landing/landing-nav";
import CampaignCarousel from "@/components/landing/campain-carousel";
import Facilities from "@/components/landing/facilities";
import MealMenu from "@/components/landing/meal-menu";
import { buttonVariants } from "@/components/ui/button";

const appFeatures = [
  { icon: Wallet, title: "Rent tracking", text: "See your monthly dues, payment status and full history in one place." },
  { icon: UtensilsCrossed, title: "Meal opt-ins", text: "Skip meals you will miss so the kitchen wastes less food." },
  { icon: Wrench, title: "Maintenance tickets", text: "Report a problem and watch it move from open to resolved." },
  { icon: Plane, title: "Leave requests", text: "Going home? Request leave in advance and get a quick answer." },
];

const steps = [
  { title: "Create your account", text: "Register with your email in under a minute." },
  { title: "Get your room", text: "The owner assigns your room and starts your monthly billing." },
  { title: "Manage everything", text: "Track rent, plan meals, raise tickets and request leave." },
];

const faqs = [
  { q: "How do I pay my rent?", a: "The owner generates your bill every month. You can see what is due in your dashboard, and the owner marks it paid once received." },
  { q: "Can I skip a meal?", a: "Yes. Choose the meals you will skip any time before 10 PM the night before." },
  { q: "How does leave work?", a: "Send a request with your dates and reason in advance. The owner reviews it along with your pending dues and approves or rejects it, and you see the answer in the app." },
  { q: "I forgot my password. What now?", a: "Use the Forgot password link on the login page. We email you a link that works for 30 minutes." },
  { q: "Who can see my information?", a: "Only you and the PG owner. Other residents never see your rent, meals or requests." },
];

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-muted-foreground">{text}</p>}
    </div>
  );
}

export default async function HomePage() {
  const session = await getSession();
  const loggedIn = Boolean(session);

  return (
    <div className="min-h-screen">
      <LandingNav loggedIn={loggedIn} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5 text-primary" /> Smart living for PGs and hostels
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold sm:text-5xl lg:text-6xl">
              Your home away from home, <span className="text-primary">made simple.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Pay rent, plan your meals, report problems and apply for leave, all from one place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {loggedIn ? (
                <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
                  Go to dashboard <ArrowRight className="size-4" />
                </Link>
              ) : (
                <>
                  <Link href="/register" className={buttonVariants({ size: "lg" })}>
                    Get started <ArrowRight className="size-4" />
                  </Link>
                  <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
                    Login
                  </Link>
                </>
              )}
            </div>

            <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
              {[
                { value: "4", label: "meals a day" },
                { value: "24/7", label: "security" },
                { value: "0", label: "paperwork" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border bg-background/70 p-4 backdrop-blur">
                  <p className="font-heading text-2xl font-bold text-primary sm:text-3xl">{s.value}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Offers */}
        <section id="campaigns" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
          <CampaignCarousel />
        </section>

        {/* Facilities */}
        <section id="facilities" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Facilities"
            title="Everything you need to live comfortably"
            text="Filter by what matters most to you."
          />
          <div className="mt-10">
            <Facilities />
          </div>
        </section>

        {/* Mess menu */}
        <section id="menu" className="scroll-mt-20 bg-muted/40 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Mess menu"
              title="Fresh, home-style food every day"
              text="Pick a day to see what is on the menu."
            />
            <div className="mt-10">
              <MealMenu />
            </div>
          </div>
        </section>

        {/* App features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="The Hos-Tell app"
            title="Hostel life, without the hassle"
            text="Everything you used to chase on paper or WhatsApp now lives in one app."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {appFeatures.map((f) => (
              <div key={f.title} className="rounded-2xl border bg-card p-5">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="FAQ" title="Questions? We have answers" />
          <div className="mt-10 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border bg-card p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        {!loggedIn && (
          <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
              <h2 className="text-3xl font-bold">Ready to move in?</h2>
              <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
                Create your account and get your room, meals and rent sorted in minutes.
              </p>
              <Link href="/register" className={`${buttonVariants({ variant: "secondary", size: "lg" })} mt-6`}>
                Create my account
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Hos-Tell. All rights reserved.
      </footer>
    </div>
  );
}