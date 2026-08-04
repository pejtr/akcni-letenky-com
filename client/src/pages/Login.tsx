import { useState } from "react";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Mail, Chrome, Apple, Github } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = (platform?: "google" | "apple" | "microsoft" | "github" | "email") => {
    setLoading(platform || "default");
    window.location.href = getLoginUrl(platform);
  };

  const providers = [
    {
      id: "google" as const,
      label: "Pokračovat s Google",
      icon: Chrome,
      bg: "bg-white hover:bg-gray-50 border-gray-300 text-gray-700",
    },
    {
      id: "apple" as const,
      label: "Pokračovat s Apple",
      icon: Apple,
      bg: "bg-black hover:bg-gray-800 text-white",
    },
    {
      id: "microsoft" as const,
      label: "Pokračovat s Microsoft",
      icon: undefined,
      bg: "bg-white hover:bg-gray-50 border-gray-300 text-gray-700",
    },
    {
      id: "github" as const,
      label: "Pokračovat s GitHub",
      icon: Github,
      bg: "bg-gray-800 hover:bg-gray-700 text-white",
    },
    {
      id: "email" as const,
      label: "Pokračovat s e-mailem",
      icon: Mail,
      bg: "bg-white hover:bg-gray-50 border-gray-300 text-gray-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <SEO
        title="Přihlášení | Akční Letenky"
        description="Přihlaste se do svého účtu pro sledování cen, správu wishlistu a personalizovaná doporučení."
        canonical="https://www.akcni-letenky.com/prihlaseni"
      />
      <Navigation />

      <main className="container max-w-md mx-auto py-24 px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg mb-6">
            <span className="text-3xl font-bold text-white">AL</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vítejte zpět</h1>
          <p className="text-gray-500">
            Přihlaste se pro přístup k exkluzivním funkcím
          </p>
        </div>

        <div className="space-y-3">
          {providers.map((provider) => (
            <Button
              key={provider.id}
              onClick={() => handleLogin(provider.id)}
              disabled={loading !== null}
              size="lg"
              className={`w-full h-12 flex items-center justify-center gap-3 border rounded-xl text-sm font-medium transition-all ${
                provider.bg
              } ${loading === provider.id ? "opacity-70" : "shadow-sm hover:shadow-md"}`}
            >
              {loading === provider.id ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : provider.icon ? (
                <provider.icon className="w-5 h-5" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
              )}
              {provider.label}
            </Button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
          Přihlášením souhlasíte s{" "}
          <a href="#" className="underline hover:text-gray-600">podmínkami použití</a>{" "}
          a{" "}
          <a href="#" className="underline hover:text-gray-600">ochranou osobních údajů</a>.
        </p>
      </main>

      <Footer />
    </div>
  );
}