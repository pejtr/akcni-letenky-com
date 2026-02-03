import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Minimize2, Maximize2, ExternalLink, Expand, Shrink, Trash2, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // NEW: Loading state for "Hledáme asistenta..."
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => {
    // Try to restore session from localStorage
    const stored = localStorage.getItem('akcni-letenky-chat-session');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Check if session is less than 24 hours old
        if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data.sessionId;
        }
      } catch (e) {
        console.error('Error restoring session:', e);
      }
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [greetingShown, setGreetingShown] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
  ]);
  const [hasMemory, setHasMemory] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [persona, setPersona] = useState<{ name: string; displayName: string; avatar: string; greetingMessage?: string } | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "💰 Letenky do 1500 Kč",
    "🔥 Last minute akce",
    "🏖️ Kam k moři?",
    "❓ Jak rezervovat?"
  ]);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const userMessageCount = messages.filter(m => m.role === "user").length;
  
  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation();
  const trackCommunityJoinMutation = trpc.chatbot.trackCommunityJoin.useMutation();
  const captureEmailMutation = trpc.chatbot.captureEmail.useMutation();

  // NEW: Handle opening chat with loading animation
  const handleOpenChat = () => {
    setIsOpen(true);
    setIsLoading(true);
    
    // Show loading animation for 3-4 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 3500);
  };

  const handleClearConversation = () => {
    if (confirm('Opravdu chcete smazat celou historii konverzace?')) {
      // Clear all state
      setMessages([]);
      setPersona(null);
      setConversationId(null);
      setHasMemory(false);
      setIsReturningUser(false);
      setEmailCaptured(false);
      setGreetingShown(false);
      setShowEmailCapture(false);
      
      // Clear localStorage
      localStorage.removeItem('akcni-letenky-chat-conversation');
      localStorage.removeItem('akcni-letenky-chat-session');
      localStorage.removeItem('akcni-letenky-email');
      
      // Close chat
      setIsOpen(false);
    }
  };

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
      
      // Update persona from A/B test and show greeting only once
      if (result.persona) {
        setPersona(result.persona);
        
        // Show greeting message only once when persona is first assigned
        if (!greetingShown && messages.length === 0) {
          setGreetingShown(true);
          // Show greeting as first message
          const greeting = result.persona.greetingMessage || "Ahoj! 👋 Jsem tu, abych ti pomohl najít tu nejlepší dovolenou!";
          setMessages([{ role: "assistant", content: greeting }]);
        }
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

  // Load conversation from localStorage on mount
  useEffect(() => {
    if (isInitialized) return;
    
    try {
      const storedConversation = localStorage.getItem('akcni-letenky-chat-conversation');
      if (storedConversation) {
        const data = JSON.parse(storedConversation);
        // Check if data is less than 24 hours old
        if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
          if (data.persona) {
            setPersona(data.persona);
          }
          if (data.conversationId) {
            setConversationId(data.conversationId);
          }
          if (data.hasMemory !== undefined) {
            setHasMemory(data.hasMemory);
          }
          if (data.isReturningUser !== undefined) {
            setIsReturningUser(data.isReturningUser);
          }
          if (data.emailCaptured !== undefined) {
            setEmailCaptured(data.emailCaptured);
          }
          if (data.greetingShown !== undefined) {
            setGreetingShown(data.greetingShown);
          }
        }
      }
    } catch (e) {
      console.error('Error loading conversation from localStorage:', e);
    }
    
    setIsInitialized(true);
  }, []);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const conversationData = {
        timestamp: Date.now(),
        sessionId,
        messages,
        persona,
        conversationId,
        hasMemory,
        isReturningUser,
        emailCaptured,
        greetingShown,
      };
      localStorage.setItem('akcni-letenky-chat-conversation', JSON.stringify(conversationData));
      
      // Also save session info separately
      const sessionData = {
        timestamp: Date.now(),
        sessionId,
      };
      localStorage.setItem('akcni-letenky-chat-session', JSON.stringify(sessionData));
    } catch (e) {
      console.error('Error saving conversation to localStorage:', e);
      // Handle quota exceeded error
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data');
        localStorage.removeItem('akcni-letenky-chat-conversation');
      }
    }
  }, [messages, persona, conversationId, hasMemory, isReturningUser, emailCaptured, greetingShown, sessionId, isInitialized]);

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
            🔥 Zobrazit všechny akce
          </Button>
        </div>
      );
    }

    return <p className={cn("whitespace-pre-wrap", textSize)}>{content}</p>;
  };

  const updateQuickReplies = (lastResponse: string) => {
    const lowerResponse = lastResponse.toLowerCase();
    
    if (lowerResponse.includes("destinac") || lowerResponse.includes("kam")) {
      setQuickReplies([
        "🏖️ K moři do 5000 Kč",
        "🏔️ Hory a příroda",
        "🌆 Evropská města",
        "🌴 Exotika"
      ]);
    } else if (lowerResponse.includes("rozpočet") || lowerResponse.includes("cen")) {
      setQuickReplies([
        "💰 Do 2000 Kč",
        "💵 2000-5000 Kč",
        "💎 5000-10000 Kč",
        "👑 Luxusní dovolená"
      ]);
    } else if (lowerResponse.includes("termín") || lowerResponse.includes("kdy")) {
      setQuickReplies([
        "📅 Tento víkend",
        "📆 Příští měsíc",
        "☀️ Léto 2026",
        "🎄 Vánoce/Silvestr"
      ]);
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
    // Focus input and trigger send
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Napište zprávu..."]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  };

  const getWindowSize = () => {
    if (isExpanded) {
      return "md:w-[600px] md:h-[700px]";
    }
    return "md:w-[380px] md:h-[550px]";
  };

  return (
    <>
      {/* COLLAPSED STATE: Icon only (no face) */}
      {!isOpen && (
        <>
          {/* WhatsApp Group Button */}
          <a
            href="https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-20 md:bottom-6 right-20 md:right-24 z-[70] group"
          >
            <div className="relative">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-[#25D366] text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
                <p className="font-semibold text-sm">🔥 VIP Skupina</p>
                <p className="text-xs opacity-90">Slevy až -70%</p>
              </div>
            </div>
          </a>
          
          {/* Travel Asistent Button */}
          <button
            onClick={handleOpenChat}
            className="fixed bottom-20 md:bottom-6 right-2 md:right-4 z-[70] group"
          >
          <div className="relative">
            {/* Icon-only button - no face when collapsed */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-[#f97316] to-[#ec4899] flex items-center justify-center shadow-xl hover:scale-110 transition-transform animate-pulse">
              <Plane className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          {/* Tooltip on hover */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-card text-card-foreground px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
              <p className="font-semibold text-sm">✈️ Travel Asistent</p>
              <p className="text-xs text-muted-foreground">Klikni pro pomoc</p>
            </div>
          </div>
        </button>
        </>
      )}

      {/* LOADING STATE: "Hledáme pro vás Travel Asistenta..." */}
      {isOpen && isLoading && (
        <div
          className={cn(
            "fixed z-[70] bg-card border border-border shadow-2xl transition-all duration-300",
            "inset-0 md:inset-auto",
            "md:bottom-6 md:right-6 md:rounded-2xl",
            "md:w-[380px] md:h-[300px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Travel Asistent</p>
                <p className="text-xs opacity-90">Připojování...</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsLoading(false);
              }}
              className="hover:bg-white/20 p-2 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading Animation */}
          <div className="flex flex-col items-center justify-center h-[200px] p-6">
            {/* Animated plane icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 flex items-center justify-center">
                <Plane className="w-10 h-10 text-orange-500 animate-bounce" />
              </div>
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-ping opacity-30" />
              <div className="absolute inset-[-8px] rounded-full border-2 border-pink-300 animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
            </div>
            
            {/* Loading text with animated dots */}
            <p className="text-lg font-semibold text-foreground mb-2">
              Hledáme pro vás Travel Asistenta
            </p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Váš osobní cestovní expert je na cestě
            </p>
          </div>
        </div>
      )}

      {/* OPEN STATE: Full chat window with face */}
      {isOpen && !isLoading && (
        <div
          className={cn(
            "fixed z-[70] bg-card border border-border shadow-2xl transition-all duration-300",
            "inset-0 md:inset-auto",
            isExpanded
              ? "md:bottom-8 md:right-8 md:rounded-2xl" 
              : "md:bottom-6 md:right-6 md:rounded-2xl",
            getWindowSize()
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              {/* NOW showing face after loading */}
              <div className={cn(
                "rounded-full overflow-hidden border-2 border-white",
                isExpanded ? "w-14 h-14" : "w-12 h-12"
              )}>
                <img
                  src={persona?.avatar || "/travel-expert-avatar.png"}
                  alt={persona?.displayName || "Travel Expert"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className={cn("font-semibold", isExpanded ? "text-xl" : "text-lg")}>{persona?.displayName || "Cestovní Asistent"}</p>
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
              {messages.length > 0 && (
                <button
                  onClick={handleClearConversation}
                  className="hover:bg-primary-foreground/20 p-2 rounded"
                  title="Smazat historii konverzace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
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

          {isMinimized ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">Chat minimalizován</p>
            </div>
          ) : (
            <>
              <div className={cn(
                "overflow-y-auto p-4 space-y-4 bg-muted/30",
                isExpanded ? "h-[500px]" : "h-[300px]"
              )}>
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className={cn(
                      "mx-auto rounded-full overflow-hidden border-4 border-orange-200 mb-4",
                      isExpanded ? "w-24 h-24" : "w-20 h-20"
                    )}>
                      <img
                        src={persona?.avatar || "/travel-expert-avatar.png"}
                        alt="Travel Expert"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className={cn("font-semibold text-foreground", isExpanded ? "text-xl" : "text-lg")}>
                      {persona?.displayName || "Ahoj! 👋"}
                    </p>
                    <p className={cn("text-muted-foreground mt-2", isExpanded ? "text-base" : "text-sm")}>
                      {persona?.name === "petra"
                        ? "Jsem Petra a pomůžu ti najít tu nejlepší dovolenou! ✈️🔥"
                        : persona?.name === "alice"
                          ? "Jsem Alice, vaše osobní cestovní expertka. Jak vám mohu pomoci?"
                          : "Jsem tu, abych vám pomohl najít ideální dovolenou. Zeptejte se mě na cokoliv!"}
                    </p>
                  </div>
                )}
                
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className={cn(
                        "rounded-full overflow-hidden mr-2 flex-shrink-0",
                        isExpanded ? "w-10 h-10" : "w-8 h-8"
                      )}>
                        <img
                          src={persona?.avatar || "/travel-expert-avatar.png"}
                          alt="Assistant"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      )}
                    >
                      {msg.role === "assistant" ? renderMessage(msg.content) : (
                        <p className={cn("whitespace-pre-wrap", isExpanded ? "text-lg" : "text-base")}>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {sendMessageMutation.isPending && (
                  <div className="flex justify-start">
                    <div className={cn(
                      "rounded-full overflow-hidden mr-2 flex-shrink-0",
                      isExpanded ? "w-10 h-10" : "w-8 h-8"
                    )}>
                      <img
                        src={persona?.avatar || "/travel-expert-avatar.png"}
                        alt="Assistant"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-card border border-border rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Email Capture */}
              {showEmailCapture && !emailCaptured && (
                <div className={cn("mx-4 mb-2 p-3 bg-orange-50 border border-orange-200 rounded-lg", isExpanded ? "p-4" : "p-3")}>
                  <p className={cn("font-semibold text-orange-800 mb-1", isExpanded ? "text-base" : "text-sm")}>
                    🎁 Speciální nabídka!
                  </p>
                  <p className={cn("text-orange-700 mb-3", isExpanded ? "text-base" : "text-sm")}>
                    {persona?.name === "petra"
                      ? "Zadej email a dostaneš 5% slevu na první rezervaci! 💰✈️"
                      : persona?.name === "alice"
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
                            content: persona?.name === "petra"
                              ? `Super! 🎉 Tvůj email ${emailInput} je uložený! Slevu 5% dostaneš na email. A teď - kam letíme?! ✈️🔥`
                              : persona?.name === "alice"
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
