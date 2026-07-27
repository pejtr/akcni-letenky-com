import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Gift, CheckCircle2, MessageCircle } from "lucide-react";

export default function SpinWheel({ onWin, whatsappLink }: { onWin: (code: string) => void, whatsappLink?: string }) {
    const [email, setEmail] = useState("");
    const [isSpinning, setIsSpinning] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [rotation, setRotation] = useState(0);

    const subscribeMutation = trpc.newsletter.subscribe.useMutation();

    const prizes = ["Sleva 500 Kč", "Nic", "Sleva 1000 Kč", "Sleva 1500 Kč", "Nic", "Doprava zdarma"];
    // We rig the wheel to land on "Sleva 1500 Kč" which is index 3 
    const targetIndex = 3;

    const handleSpin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSpinning || hasSpun) return;

        try {
            // Opt in logic
            await subscribeMutation.mutateAsync({ email });
        } catch {
            // Ignored for UX
        }

        setIsSpinning(true);

        // Calculate rotation: 5 full spins + degrees to reach target index
        const segmentDegree = 360 / prizes.length;
        // We want the targeted segment to stop at the TOP (270 degrees normally, but CSS rotate starts from top)
        // Actually the pointer is at the top, so we want the target segment to be at 0/360 degrees.
        // If segment 0 is at top, segment 1 is at 60deg, etc.
        const targetDegree = 360 - (targetIndex * segmentDegree);
        const finalRotation = rotation + 360 * 5 + targetDegree - (rotation % 360);

        setRotation(finalRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setHasSpun(true);
            onWin("KOLO1500");
        }, 4000); // 4 seconds spin
    };

    if (hasSpun) {
        return (
            <div className="text-center py-6 animate-in zoom-in-95 duration-500">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Vyhráváte Slevu 1500 Kč!</h3>
                <p className="text-gray-600 mb-4">Váš unikátní kód pro slevu na zájezdy od Pelikána:</p>
                <div className="bg-yellow-100 border-2 border-dashed border-yellow-400 p-4 rounded-xl text-3xl font-black text-orange-600 tracking-wider">
                    KOLO1500
                </div>
                <p className="text-sm text-gray-500 mt-4">Kód byl odeslán i na váš email ({email})</p>

                {/* WhatsApp Link intentionally hidden until WhatsApp API is connected 
                {whatsappLink && (
                    <div className="mt-6 text-left bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <MessageCircle className="w-7 h-7 text-green-600 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">BONUS: Připojte se k WhatsApp komunitě</h4>
                                <p className="text-xs text-gray-600">
                                    Exkluzivní nabídky navíc!
                                </p>
                            </div>
                        </div>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-5 font-bold">
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Připojit se do skupiny ZDARMA
                            </Button>
                        </a>
                    </div>
                )}
                */}
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-indigo-50 to-blue-100 p-6 md:p-8 rounded-2xl border border-indigo-100 shadow-inner">
            {/* The Wheel */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-600 drop-shadow-md" />

                {/* Wheel body */}
                <div
                    className="w-full h-full rounded-full border-4 border-indigo-600 shadow-xl overflow-hidden transition-all ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transitionDuration: isSpinning ? "4s" : "0s",
                        background: "conic-gradient(#f87171 0deg 60deg, #fbbf24 60deg 120deg, #60a5fa 120deg 180deg, #34d399 180deg 240deg, #a78bfa 240deg 300deg, #fb923c 300deg 360deg)"
                    }}
                >
                    {prizes.map((prize, idx) => {
                        const rot = idx * 60;
                        return (
                            <div
                                key={idx}
                                className="absolute w-full h-full font-bold text-white text-xs md:text-sm drop-shadow-md"
                                style={{ transform: `rotate(${rot}deg)` }}
                            >
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 text-center transform origin-bottom -rotate-90">
                                    {prize}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border-4 border-indigo-600 flex items-center justify-center shadow-lg z-10">
                    <Gift className="w-4 h-4 text-indigo-600" />
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-black text-indigo-900 mb-2">Roztočte kolo o 1500 Kč!</h3>
                <p className="text-gray-600 text-sm md:text-base mb-6">Zadejte svůj email, roztočte Kolo štěstí a získejte okamžitou slevu na váš další let.</p>

                <form onSubmit={handleSpin} className="flex flex-col gap-3">
                    <Input
                        type="email"
                        placeholder="vas@email.cz"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={isSpinning}
                        className="bg-white"
                    />
                    <Button
                        type="submit"
                        disabled={isSpinning || !email}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        {isSpinning ? "Točím..." : "ZKUSIT ŠTĚSTÍ"}
                    </Button>
                </form>
                <p className="text-xs text-gray-400 mt-4 text-center md:text-left">
                    Zadáním emailu souhlasíte se zasíláním TOP akčních nabídek. Z odběru se můžete kdykoliv odhlásit.
                </p>
            </div>
        </div>
    );
}
