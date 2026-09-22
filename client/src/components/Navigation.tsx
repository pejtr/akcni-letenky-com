import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Bell, Heart, Lightbulb, Menu, Plane, Search, Sun, X } from "lucide-react";

const navItems = [
  { href: "/#dnesni-akce", label: "Dnešní akce", icon: Plane, anchor: true },
  { href: "/letenky", label: "Letenky", icon: Search },
  { href: "/dovolene", label: "Dovolená", icon: Sun },
  { href: "/hlidac-cen", label: "Hlídač cen", icon: Bell },
  { href: "/tipy-pro-cestovatele", label: "Tipy", icon: Lightbulb },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="container flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="Akční Letenky – domů">
          <img src="/logo-akcni-letenky.png" alt="Akční Letenky" className="h-9 w-auto md:h-10" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Hlavní navigace">
          {navItems.map((item) => {
            const Icon = item.icon;
            const classes =
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-sky-800";
            return item.anchor ? (
              <a key={item.href} href={item.href} className={classes}>
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={classes}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/wishlist"
            className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            aria-label="Uložené nabídky"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/letenky"
            className="hidden min-h-10 items-center gap-2 rounded-xl bg-[#0f5fc2] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#0a4f9f] md:inline-flex"
          >
            <Search className="h-4 w-4" />
            Najít let
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Otevřít menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Zavřít menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[min(88vw,360px)] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-slate-900">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Zavřít menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 space-y-1" aria-label="Mobilní navigace">
              {navItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon className="h-5 w-5 text-sky-700" />
                    <span>{item.label}</span>
                  </>
                );
                const classes =
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-sky-50";
                return item.anchor ? (
                  <a key={item.href} href={item.href} className={classes} onClick={() => setMobileOpen(false)}>
                    {content}
                  </a>
                ) : (
                  <Link key={item.href} href={item.href} className={classes} onClick={() => setMobileOpen(false)}>
                    {content}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/letenky"
              onClick={() => setMobileOpen(false)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5fc2] px-5 py-3 text-sm font-black text-white"
            >
              <Search className="h-4 w-4" />
              Najít konkrétní let
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
