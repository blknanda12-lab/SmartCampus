import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: { label: string; value: string }[];
  suggestions?: string[];
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm the Smart Campus AI. I can help you find rooms, check availability, or analyze usage data. How can I help today?",
      suggestions: ["Find a study room", "Check lab availability", "Report an issue"]
    }
  ]);
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const chatMutation = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    chatMutation.mutate({ data: { message: text, userId: user?.id } }, {
      onSuccess: (data) => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          actions: data.actions,
          suggestions: data.suggestions
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    });
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Smart Campus AI</h3>
                  <p className="text-xs text-muted-foreground">Always online</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                    <div className={cn("shrink-0 h-8 w-8 rounded-full flex items-center justify-center", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      {msg.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className={cn("p-3 rounded-2xl text-sm", msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm")}>
                        {msg.content}
                      </div>
                      
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {msg.actions.map((action, i) => (
                            <Button key={i} size="sm" variant="secondary" className="h-8 text-xs rounded-full">
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {msg.suggestions && msg.suggestions.length > 0 && msg.role === "assistant" && msg.id === messages[messages.length - 1].id && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.suggestions.map((suggestion, i) => (
                            <Button 
                              key={i} 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs rounded-full bg-background border-primary/20 text-primary hover:bg-primary/10"
                              onClick={() => handleSend(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="shrink-0 h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-muted rounded-tl-sm flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-border bg-background">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="rounded-full bg-muted/50 border-transparent focus-visible:ring-primary/50"
                  disabled={chatMutation.isPending}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || chatMutation.isPending}
                  className="shrink-0 rounded-full h-10 w-10 bg-primary text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
