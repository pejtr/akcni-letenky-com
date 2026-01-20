import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Vítejte! Jsem Vaše průvodkyně světem zájezdů na akcni-letenky.com. Jak Vám mohu pomoci?",
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    setMessages([...messages, { role: "user", content: message }]);
    setMessage("");

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Děkuji za Vaši zprávu! Momentálně zpracovávám Váš dotaz...",
        },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="relative">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl hover:scale-110 transition-transform">
              <img
                src="/travel-expert.jpg"
                alt="Travel Expert"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-secondary rounded-full border-2 border-white animate-pulse" />
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
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
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
