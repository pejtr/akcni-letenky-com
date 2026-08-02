import React from "react";
import { Ticket, Star, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Experience {
  title: string;
  price: string;
  rating: number;
  reviewsCount: number;
  url: string;
  badge?: string;
}

const DESTINATION_EXPERIENCES: Record<string, Experience[]> = {
  "Dubaj": [
    { title: "Burj Khalifa: Vstupenka do 124. a 125. patra", price: "1 190 Kč", rating: 4.8, reviewsCount: 14200, url: "https://www.getyourguide.com/dubai-l173/burj-khalifa-t3884/", badge: "Nejprodávanější" },
    { title: "Pouštní Safari s BBQ večeří a jízdu na velbloudech", price: "990 Kč", rating: 4.9, reviewsCount: 8900, url: "https://www.getyourguide.com/dubai-l173/desert-safari-t4120/" },
    { title: "Akvárium v Dubai Mall & Podmořská ZOO", price: "790 Kč", rating: 4.7, reviewsCount: 5400, url: "https://www.getyourguide.com/dubai-l173/dubai-aquarium-t6210/" },
  ],
  "Paříž": [
    { title: "Eiffelova věž: Vstupenka na vrchol bez fronty", price: "890 Kč", rating: 4.8, reviewsCount: 19500, url: "https://www.getyourguide.com/paris-l16/eiffel-tower-t3400/", badge: "Bez fronty" },
    { title: "Muzeum Louvre: Vstupenka s přesným časem", price: "590 Kč", rating: 4.9, reviewsCount: 24100, url: "https://www.getyourguide.com/paris-l16/louvre-museum-t2100/" },
    { title: "Vyhlídková plavba po řece Seině", price: "390 Kč", rating: 4.7, reviewsCount: 12800, url: "https://www.getyourguide.com/paris-l16/seine-cruise-t5400/" },
  ],
  "Řím": [
    { title: "Koloseum & Forum Romanum: Přednostní vstup bez fronty", price: "690 Kč", rating: 4.8, reviewsCount: 28900, url: "https://www.getyourguide.com/rome-l33/colosseum-t1200/", badge: "TOP Výběr" },
    { title: "Vatikánská Muzea & Sixtinská Kaple", price: "790 Kč", rating: 4.9, reviewsCount: 31200, url: "https://www.getyourguide.com/rome-l33/vatican-museums-t1500/" },
  ],
  "New York": [
    { title: "Empire State Building: Vstupenka do 86. patra", price: "1 090 Kč", rating: 4.8, reviewsCount: 16400, url: "https://www.getyourguide.com/new-york-city-l59/empire-state-building-t4100/" },
    { title: "Socha Svobody & Ellis Island trajekt", price: "690 Kč", rating: 4.8, reviewsCount: 11500, url: "https://www.getyourguide.com/new-york-city-l59/statue-of-liberty-t3900/" },
  ],
  "Bali": [
    { title: "Celodenní výlet: Chrámy, vodopády a terasovitá rýžová políčka", price: "850 Kč", rating: 4.9, reviewsCount: 9200, url: "https://www.getyourguide.com/bali-l347/bali-tour-t5500/", badge: "Nejoblíbenější" },
    { title: "Nusa Penida: Šnorchlování s mantami a pláž Kelingking", price: "1 290 Kč", rating: 4.9, reviewsCount: 6400, url: "https://www.getyourguide.com/bali-l347/nusa-penida-t6700/" },
  ],
};

export default function ExperiencesWidget({ destination = "Dubaj" }: { destination?: string }) {
  const experiences = DESTINATION_EXPERIENCES[destination] || DESTINATION_EXPERIENCES["Dubaj"];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm my-6">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-500" />
            TOP Zážitky & Vstupenky v destinaci {destination}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Rezervujte vstupenky bez front s garancí zrušení zdarma</p>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          GetYourGuide Partner
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {experiences.map((exp, idx) => (
          <a
            key={idx}
            href={exp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-gray-50 hover:bg-amber-50/50 border border-gray-200 hover:border-amber-300 rounded-xl p-3.5 transition-all"
          >
            {exp.badge && (
              <span className="text-[10px] bg-amber-500 text-gray-950 font-bold px-2 py-0.5 rounded-full inline-block mb-1.5">
                {exp.badge}
              </span>
            )}
            <h4 className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {exp.title}
            </h4>
            <div className="flex items-center justify-between mt-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{exp.rating}</span>
                <span className="text-[10px] text-gray-400 font-normal">({exp.reviewsCount.toLocaleString()})</span>
              </div>
              <span className="font-extrabold text-gray-900">od {exp.price}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
