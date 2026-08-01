import Link from "next/link";
import Image from "next/image";
import { Play, Radio, BookOpen, ShoppingBag } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <section className="bg-brand-gradient animated-gradient relative overflow-hidden py-20 text-white">
        <span className="gradient-blob gradient-blob-1" aria-hidden="true" />
        <span className="gradient-blob gradient-blob-2" aria-hidden="true" />
        <span className="gradient-blob gradient-blob-3" aria-hidden="true" />
        <div className="container-page relative flex flex-col items-center gap-6 text-center">
          <span className="hero-logo-glow">
            <Image src="/logo.png" alt="God's Ark Missions" width={110} height={110} className="rounded-full bg-white p-2" />
          </span>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Welcome to God&apos;s Ark Missions</h1>
          <p className="max-w-xl text-white/90">
            A house of worship carrying the gospel to every shore — join us in person or online.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/live" className="btn-accent">Watch Live</Link>
            <Link href="/sermons" className="rounded-lg border-2 border-white px-5 py-2.5 font-semibold hover:bg-white hover:text-primary">
              Browse Sermons
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/sermons", icon: Play, title: "Sermons", desc: "Watch messages on demand." },
          { href: "/live", icon: Radio, title: "Live", desc: "Join Sunday service & special broadcasts." },
          { href: "/scriptures", icon: BookOpen, title: "Scriptures", desc: "Download preaching PDFs." },
          { href: "/store", icon: ShoppingBag, title: "Store", desc: "Bibles, apparel & church resources." },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-primary/10 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <c.icon className="mb-3 text-primary" size={28} />
            <h3 className="font-bold text-ink">{c.title}</h3>
            <p className="mt-1 text-sm text-ink/60">{c.desc}</p>
          </Link>
        ))}
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="container-page text-center">
          <h2 className="section-title !text-white">Support the Ministry</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/70">
            Your tithes and offerings help us reach more people with the gospel.
          </p>
          <Link href="/donate" className="btn-accent mt-6 inline-flex">Give Now</Link>
        </div>
      </section>
    </div>
  );
}
