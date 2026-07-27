import React from "react";
import { Link } from "wouter";
import { Plane, Compass, Train, MapPin, Tag, ArrowRight, Award } from "lucide-react";

export default function InternalLinkingHub() {
  return (
    <div className="my-12 p-6 md:p-8 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-slate-100 rounded-3xl shadow-xl border border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#E91E63] rounded-xl flex items-center justify-center text-white shadow-md">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-black text-white">
            Související průvodci a akční nabídky
          </h3>
          <p className="text-xs md:text-sm text-slate-400">
            Prozkoumejte další oblíbené kategorie a ušetřete na cestách
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category 1: Akční letenky */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 hover:border-pink-500/50 transition-all">
          <div className="flex items-center gap-2 text-pink-400 font-bold text-sm mb-3">
            <Plane className="w-4 h-4" />
            <span>Akční & Last Minute</span>
          </div>
          <ul className="space-y-2 text-xs md:text-sm text-slate-300">
            <li>
              <Link href="/last-minute">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>🔥 Last minute letenky z Prahy</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                </a>
              </Link>
            </li>
            <li>
              <Link href="/letenky-do-1500">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>✈️ Letenky do 1 500 Kč</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                </a>
              </Link>
            </li>
            <li>
              <Link href="/porovnani-cen">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>📊 Porovnání cen letenek</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                </a>
              </Link>
            </li>
            <li>
              <Link href="/levne-letenky">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>🏷️ Přehled slev letenek</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                </a>
              </Link>
            </li>
          </ul>
        </div>

        {/* Category 2: Oblíbené Destinace */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 hover:border-blue-500/50 transition-all">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>Průvodci Destinacemi</span>
          </div>
          <ul className="space-y-2 text-xs md:text-sm text-slate-300">
            <li>
              <Link href="/dubaj">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>🏙️ Akční letenky Dubaj & průvodce</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </a>
              </Link>
            </li>
            <li>
              <Link href="/bali">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>🌴 Akční letenky Bali & rady</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </a>
              </Link>
            </li>
            <li>
              <Link href="/new-york">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>🗽 Letenky New York od 8 990 Kč</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </a>
              </Link>
            </li>
            <li>
              <Link href="/reunion">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>🌋 Erotický ostrov Réunion</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </a>
              </Link>
            </li>
          </ul>
        </div>

        {/* Category 3: Doprava & Tipy */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 hover:border-emerald-500/50 transition-all">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
            <Train className="w-4 h-4" />
            <span>Dovolené & Doprava</span>
          </div>
          <ul className="space-y-2 text-xs md:text-sm text-slate-300">
            <li>
              <Link href="/dovolene">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>🏖️ Pobytové zájezdy & dovolená</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </Link>
            </li>
            <li>
              <Link href="/vlaky-autobusy">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>🚆 Vlaky a autobusy po Evropě</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </Link>
            </li>
            <li>
              <Link href="/aerolinky">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>✈️ Přehled leteckých společností</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </Link>
            </li>
            <li>
              <Link href="/tipy-pro-cestovatele">
                <a className="hover:text-white hover:underline flex items-center justify-between group">
                  <span>💡 Tipy a triky pro cestovatele</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
