import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Minimize2, Maximize2, ExternalLink, Expand, Shrink } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Ahoj! 👋 Jsem tvoje průvodkyně světem zájezdů. Kam se chystáš? Moře, hory, nebo městská dobrodružství? 🌴🏔️🏙️",
    },
  ]);
  const [hasMemory, setHasMemory] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [persona, setPersona] = useState<{ name: string; displayName: string; avatar: string } | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "🏖️ Kam k moři?",
    "✈️ Nejlevnější letenky",
    "🌴 Last minute dovolená",
    "🏔️ Hory a lyžování"
  ]);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMessageCount = messages.filter(m => m.role === "user").length;
  
  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation();
  const trackCommunityJoinMutation = trpc.chatbot.trackCommunityJoin.useMutation();
  const captureEmailMutation = trpc.chatbot.captureEmail.useMutation();

  const handleSendMessage = async () => {
    if (!message.trim() || sendMessageMutation.isPending) return;

    const userMessage = message;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessage("");

    try {
      const result = await sendMessageMutation.mutateAsync({
        sessionId,
        message: userMessage,
        projectId: "akcni-letenky",
      });

      if (result.conversationId) {
        setConversationId(result.conversationId);
      }
      
      // Update memory status from response
      if (result.hasMemory !== undefined) {
        setHasMemory(result.hasMemory);
      }
      if (result.returningUser !== undefined) {
        setIsReturningUser(result.returningUser);
      }
      
      // Update persona from A/B test
      if (result.persona) {
        setPersona(result.persona);
      }
      
      // Update quick replies based on context
      updateQuickReplies(result.message);
      
      // Show email capture after 3 user messages (if not already captured)
      const newUserMessageCount = messages.filter(m => m.role === "user").length + 1;
      if (newUserMessageCount >= 3 && !emailCaptured && !showEmailCapture) {
        setTimeout(() => setShowEmailCapture(true), 1500);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.message },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Omlouvám se, něco se pokazilo. Můžeš to zkusit znovu? 😊",
        },
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderMessage = (content: string) => {
    const lowerContent = content.toLowerCase();
    const textSize = isExpanded ? "text-lg" : "text-base";
    
    if (lowerContent.includes("fb skupina") || lowerContent.includes("facebook")) {
      return (
        <div className="space-y-3">
          <p className={cn("whitespace-pre-wrap", textSize)}>{content}</p>
          <div className="flex flex-col gap-2 mt-2">
            <a
              href="https://www.facebook.com/groups/akcniletenky/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors",
                isExpanded ? "text-base" : "text-sm"
              )}
              onClick={() => {
                if (conversationId) {
                  trackCommunityJoinMutation.mutate({
                    conversationId,
                    communityType: "facebook",
                  });
                }
              }}
            >
              <ExternalLink className="w-4 h-4" />
              Připojit se k FB skupině (33 500 členů)
            </a>
            <a
              href="https://www.facebook.com/groups/TourDeSvetLacneCestovani/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors",
                isExpanded ? "text-base" : "text-sm"
              )}
              onClick={() => {
                if (conversationId) {
                  trackCommunityJoinMutation.mutate({
                    conversationId,
                    communityType: "facebook",
                  });
                }
              }}
            >
              <ExternalLink className="w-4 h-4" />
              TOUR de SVĚT (29 200 členů)
            </a>
          </div>
        </div>
      );
    }

    if (content.includes("Kč") && content.includes("→")) {
      return (
        <div className="space-y-3">
          <p className={cn("whitespace-pre-wrap", textSize)}>{content}</p>
          <Button
            size={isExpanded ? "lg" : "default"}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            ✈️ Zobrazit všechny nabídky
          </Button>
        </div>
      );
    }

    return <p className={cn("whitespace-pre-wrap", textSize)}>{content}</p>;
  };

  const getWindowSize = () => {
    if (isExpanded) return "w-screen h-screen md:w-[650px] md:h-[85vh] md:rounded-2xl";
    return "w-screen h-screen md:w-[420px] md:h-[650px] md:rounded-2xl";
  };

  const getMessagesHeight = () => {
    if (isExpanded) return "h-[calc(800px-220px)] md:h-[calc(85vh-220px)]";
    return "h-[calc(650px-220px)]";
  };

  // Update quick replies based on conversation context
  const updateQuickReplies = (lastMessage: string) => {
    const lowerMsg = lastMessage.toLowerCase();
    
    if (lowerMsg.includes("moře") || lowerMsg.includes("pláž") || lowerMsg.includes("beach")) {
      setQuickReplies(["🇬🇷 Řecko", "🇪🇸 Španělsko", "🇭🇷 Chorvatsko", "🇹🇷 Turecko"]);
    } else if (lowerMsg.includes("hory") || lowerMsg.includes("lyž") || lowerMsg.includes("alpy")) {
      setQuickReplies(["🇦🇹 Rakousko", "🇮🇹 Itálie - Dolomity", "🇫🇷 Francie - Alpy", "🇨🇭 Švýcarsko"]);
    } else if (lowerMsg.includes("město") || lowerMsg.includes("city") || lowerMsg.includes("eurovíkend")) {
      setQuickReplies(["🇬🇧 Londýn", "🇫🇷 Paříž", "🇮🇹 Řím", "🇪🇸 Barcelona"]);
    } else if (lowerMsg.includes("exotik") || lowerMsg.includes("daleko") || lowerMsg.includes("asie")) {
      setQuickReplies(["🇹🇭 Thajsko", "🇻🇳 Vietnam", "🇮🇩 Bali", "🇲🇻 Maledivy"]);
    } else if (lowerMsg.includes("levn") || lowerMsg.includes("slev") || lowerMsg.includes("akce")) {
      setQuickReplies(["💰 Do 5000 Kč", "🔥 Last minute", "📅 Flexibilní termín", "👨‍👩‍👧‍👦 Rodinná dovolená"]);
    } else if (lowerMsg.includes("facebook") || lowerMsg.includes("skupin")) {
      setQuickReplies(["📧 Odebírat novinky", "🔔 Nastavit upozornění", "✈️ Zpět k nabídkám", "💬 Další dotaz"]);
    } else {
      // Default suggestions
      setQuickReplies(["🏖️ Kam k moři?", "✈️ Nejlevnější letenky", "🌴 Last minute", "❓ Mám dotaz"]);
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
    // Auto-send after short delay for better UX
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Napište zprávu..."]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-2 md:right-4 z-50 group animate-pulse"
        >
          <div className="relative">
            <div className="w-12 h-12 md:w-24 md:h-24 rounded-full overflow-hidden border-2 md:border-4 border-white shadow-xl hover:scale-110 transition-transform">
              <img
                src="/travel-expert.jpg"
                alt="Travel Expert"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 md:w-6 md:h-6 bg-[#FF6B35] rounded-full border-1 md:border-2 border-white animate-pulse" />
          </div>
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-card text-card-foreground px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
              <p className="font-semibold">Travel Expert</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-card border border-border shadow-2xl transition-all duration-300",
            "inset-0 md:inset-auto",
            isExpanded
              ? "md:bottom-8 md:right-8 md:rounded-2xl" 
              : "md:bottom-6 md:right-6 md:rounded-2xl",
            getWindowSize()
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-full overflow-hidden border-2 border-white",
isExpanded ? "w-14 h-14" : "w-12 h-12"
              )}>
                <img
                  src={persona?.avatar || "/travel-expert.jpg"}
                  alt={persona?.displayName || "Travel Expert"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className={cn("font-semibold", isExpanded ? "text-xl" : "text-lg")}>{persona?.displayName || "Travel Expert"}</p>
                <div className="flex items-center gap-2">
                  <p className={cn("opacity-90", isExpanded ? "text-sm" : "text-xs")}>Online</p>
                  {hasMemory && (
                    <span className={cn(
                      "px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full font-medium",
                      isExpanded ? "text-xs" : "text-[10px]"
                    )} title="Pamatuji si tě z minulých konverzací">
                      🧠 Paměť
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:block hover:bg-primary-foreground/20 p-2 rounded"
                title={isExpanded ? "Zmenšit" : "Zvětšit"}
              >
                {isExpanded ? (
                  <Shrink className="w-5 h-5" />
                ) : (
                  <Expand className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden md:block hover:bg-primary-foreground/20 p-2 rounded"
              >
                {isMinimized ? (
                  <Maximize2 className="w-5 h-5" />
                ) : (
                  <Minimize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-foreground/20 p-2 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", getMessagesHeight())}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl",
                        isExpanded ? "px-5 py-3" : "px-4 py-2",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {renderMessage(msg.content)}
                    </div>
                  </div>
                ))}
                {sendMessageMutation.isPending && (
                  <div className="flex justify-start">
                    <div className={cn(
                      "max-w-[85%] rounded-2xl bg-muted text-foreground",
                      isExpanded ? "px-5 py-3" : "px-4 py-2"
                    )}>
                      <p className={cn(isExpanded ? "text-lg" : "text-base")}>Píše... ✍️</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Email Capture Popup */}
              {showEmailCapture && !emailCaptured && (
                <div className={cn(
                  "mx-4 mb-2 p-4 rounded-xl border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg animate-in slide-in-from-bottom-2",
                  isExpanded ? "mx-5" : "mx-4"
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎁</span>
                      <p className={cn("font-bold text-orange-800", isExpanded ? "text-lg" : "text-base")}>
                        {persona?.name === "phoebe" 
                          ? "Heeej! Mám pro tebe super nabídku! 🔥" 
                          : persona?.name === "prue"
                            ? "Exkluzivní nabídka pro vás"
                            : "Speciální nabídka pro vás!"}
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowEmailCapture(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className={cn("text-orange-700 mb-3", isExpanded ? "text-base" : "text-sm")}>
                    {persona?.name === "phoebe"
                      ? "Zadej email a dostaneš 5% slevu na první rezervaci! 💰✈️"
                      : persona?.name === "prue"
                        ? "Získejte 5% slevu na vaši první rezervaci a exkluzivní nabídky."
                        : "Získejte 5% slevu na první rezervaci a nejlepší nabídky přímo do emailu."}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="vas@email.cz"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className={cn("flex-1 border-orange-300 focus:border-orange-500", isExpanded ? "text-base" : "text-sm")}
                    />
                    <Button
                      onClick={async () => {
                        if (!emailInput.includes("@")) return;
                        setEmailSubmitting(true);
                        try {
                          // Extract last destination and budget from messages
                          const lastDestination = messages
                            .filter(m => m.role === "user")
                            .reverse()
                            .find(m => /\b(paříž|londýn|barcelona|řím|praha|vídeň|madrid|amsterdam|berlín|dubaj|bangkok|tokio|new york|los angeles|miami|cancún|phuket|bali|maledivy|mauricius|seychely|zanzibar|kapverdy|egypt|turecko|řecko|španělsko|itálie|francie|chorvatsko|bulharsko)\b/i.test(m.content))
                            ?.content.match(/\b(paříž|londýn|barcelona|řím|praha|vídeň|madrid|amsterdam|berlín|dubaj|bangkok|tokio|new york|los angeles|miami|cancún|phuket|bali|maledivy|mauricius|seychely|zanzibar|kapverdy|egypt|turecko|řecko|španělsko|itálie|francie|chorvatsko|bulharsko)\b/i)?.[0];
                          
                          const lastBudget = messages
                            .filter(m => m.role === "user")
                            .reverse()
                            .find(m => /\d{3,6}/.test(m.content))
                            ?.content.match(/\d{3,6}/)?.[0];

                          // Save email to database
                          await captureEmailMutation.mutateAsync({
                            email: emailInput,
                            sessionId,
                            personaId: persona ? parseInt(persona.name.replace(/\D/g, "")) : undefined,
                            personaName: persona?.displayName,
                            messageCount: userMessageCount,
                            lastDestinationMentioned: lastDestination,
                            lastBudgetMentioned: lastBudget ? parseInt(lastBudget) : undefined,
                            gdprConsent: true,
                            consentText: "Souhlasím se zasíláním marketingových nabídek a newsletteru.",
                          });

                          // Also store in localStorage as backup
                          localStorage.setItem("akcni-letenky-email", emailInput);
                          setEmailCaptured(true);
                          setShowEmailCapture(false);
                          
                          // Add thank you message
                          setMessages(prev => [...prev, {
                            role: "assistant",
                            content: persona?.name === "phoebe"
                              ? `Super! 🎉 Tvůj email ${emailInput} je uložený! Slevu 5% dostaneš na email. A teď - kam letíme?! ✈️🔥`
                              : persona?.name === "prue"
                                ? `Děkuji. Váš email ${emailInput} byl zaregistrován. Slevový kód obdržíte do několika minut.`
                                : `Děkujeme! 🎉 Váš email ${emailInput} byl uložen. Slevový kód 5% vám brzy přijde. Pokračujme v hledání ideální dovolené!`
                          }]);
                        } catch (error) {
                          console.error("Error capturing email:", error);
                          // Still show success message to user even if DB save fails
                          setEmailCaptured(true);
                          setShowEmailCapture(false);
                          setMessages(prev => [...prev, {
                            role: "assistant",
                            content: "Děkujeme za váš email! 🎉"
                          }]);
                        } finally {
                          setEmailSubmitting(false);
                        }
                      }}
                      disabled={emailSubmitting || !emailInput.includes("@")}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      size={isExpanded ? "default" : "sm"}
                    >
                      {emailSubmitting ? "..." : "🎁 Získat slevu"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Reply Suggestions */}
              <div className={cn("px-4 py-2 border-t border-border bg-muted/30", isExpanded ? "px-5" : "px-4")}>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground transition-colors",
                        isExpanded ? "text-sm" : "text-xs",
                        "whitespace-nowrap"
                      )}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              <div className={cn("border-t border-border", isExpanded ? "p-5" : "p-4")}>
                <div className="flex gap-3">
                  <Input
                    placeholder="Napište zprávu..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className={cn("flex-1", isExpanded ? "text-lg py-6" : "text-base")}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size={isExpanded ? "lg" : "icon"}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className={cn(isExpanded ? "w-6 h-6" : "w-5 h-5")} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
