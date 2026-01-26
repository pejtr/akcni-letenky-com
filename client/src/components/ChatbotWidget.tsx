import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Minimize2, Maximize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Ahoj! 👋 Jsem tvoje průvodkyně světem zájezdů. Kam se chystáš? Moře, hory, nebo městská dobrodružství? 🌴🏔️🏙️",
    },
  ]);
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Parse message content for links and CTAs
  const renderMessage = (content: string) => {
    // Check for FB group mention
    if (content.toLowerCase().includes("fb skupina") || content.toLowerCase().includes("facebook")) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{content}</p>
          <div className="flex flex-col gap-2 mt-2">
            <a
              href="https://www.facebook.com/groups/akcniletenky/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
              onClick={() => {
                if (conversationId) {
                  trackCommunityJoinMutation.mutate({
                    conversationId,
                    communityType: "facebook",
                  });
                }
              }}
            >
              <ExternalLink className="w-3 h-3" />
              Připojit se k FB skupině (33 500 členů)
            </a>
            <a
              href="https://www.facebook.com/groups/TourDeSvetLacneCestovani/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
              onClick={() => {
                if (conversationId) {
                  trackCommunityJoinMutation.mutate({
                    conversationId,
                    communityType: "facebook",
                  });
                }
              }}
            >
              <ExternalLink className="w-3 h-3" />
              TOUR de SVĚT (29 200 členů)
            </a>
          </div>
        </div>
      );
    }

    // Check for flight offer (contains price in Kč)
    if (content.includes("Kč") && content.includes("→")) {
      return (
        <div className="space-y-2">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          <Button
            size="sm"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2"
            onClick={() => {
              // Redirect to flights page
              window.location.href = "/";
            }}
          >
            ✈️ Zobrazit všechny nabídky
          </Button>
        </div>
      );
    }

    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group animate-pulse"
        >
          <div className="relative">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl hover:scale-110 transition-transform">
              <img
                src="/travel-expert.jpg"
                alt="Travel Expert"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-card text-card-foreground px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
              <p className="font-semibold">Travel Expert</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-2xl transition-all",
            isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                <img
                  src="/travel-expert.jpg"
                  alt="Travel Expert"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold">Travel Expert</p>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-primary-foreground/20 p-1 rounded"
              >
                {isMinimized ? (
                  <Maximize2 className="w-5 h-5" />
                ) : (
                  <Minimize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-foreground/20 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(600px-140px)]">
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
                        "max-w-[80%] px-4 py-2 rounded-2xl",
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
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-muted text-foreground">
                      <p className="text-sm">Píše... ✍️</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Napište zprávu..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
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
