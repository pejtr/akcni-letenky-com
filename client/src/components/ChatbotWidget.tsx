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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation();
  const trackCommunityJoinMutation = trpc.chatbot.trackCommunityJoin.useMutation();

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
    if (isMinimized) return "w-96 h-16";
    if (isExpanded) return "w-[600px] h-[800px] md:w-[700px] md:h-[85vh]";
    return "w-[420px] h-[650px]";
  };

  const getMessagesHeight = () => {
    if (isExpanded) return "h-[calc(800px-160px)] md:h-[calc(85vh-160px)]";
    return "h-[calc(650px-160px)]";
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group animate-pulse"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl hover:scale-110 transition-transform">
              <img
                src="/travel-expert.jpg"
                alt="Travel Expert"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
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
            "fixed z-50 bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300",
            isExpanded 
              ? "bottom-4 right-4 md:bottom-8 md:right-8" 
              : "bottom-6 right-6",
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
                  src="/travel-expert.jpg"
                  alt="Travel Expert"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className={cn("font-semibold", isExpanded ? "text-xl" : "text-lg")}>Travel Expert</p>
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
                className="hover:bg-primary-foreground/20 p-2 rounded"
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
                className="hover:bg-primary-foreground/20 p-2 rounded"
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
