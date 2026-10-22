"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowUp, LoaderCircle, Trash2 } from "lucide-react";
import { clearChat } from "@/app/(app)/(shell)/chat/actions";
import { ChatCitations } from "@/components/chat/chat-citations";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import type { ChatMessage, Citation } from "@/components/chat/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTIONS = [
  "Give me a tour of how this project is structured.",
  "How does authentication work?",
  "Where is the main entry point, and what does it do?",
  "Which external services or APIs does it use?",
];

type Props = {
  repositoryId: string;
  repoName: string;
  // e.g. https://github.com/owner/repo/blob/main, for links to cited files.
  repoUrl: string;
  initialMessages: ChatMessage[];
};

// The conversation with one repository. Answers stream from /api/chat.
export function ChatView({ repositoryId, repoName, repoUrl, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearing, startClearing] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Follow the answer as it streams in.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  function updateReply(update: Partial<ChatMessage>) {
    setMessages((previous) => [...previous.slice(0, -1), { ...previous[previous.length - 1], ...update }]);
  }

  async function sendMessage(text: string) {
    text = text.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setMessages((previous) => [
      ...previous,
      { id: crypto.randomUUID(), role: "user", content: text, citations: [] },
      { id: crypto.randomUUID(), role: "assistant", content: "", citations: [] },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId, message: text }),
      });
      if (!response.ok || !response.body) {
        updateReply({ content: `Couldn't answer: ${(await response.text()) || "something went wrong"}.` });
        return;
      }

      const citations: Citation[] = JSON.parse(decodeURIComponent(response.headers.get("X-Citations") ?? "[]"));
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        updateReply({ content: reply });
      }
      updateReply({ content: reply || "No answer came back. Please try again.", citations });
    } catch {
      updateReply({ content: "Couldn't reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    startClearing(async () => {
      await clearChat(repositoryId);
      setMessages([]);
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <h2 className="font-medium">Ask anything about {repoName}</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Answers come from the indexed code and list the files they used.
              </p>
              <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-lg border bg-card px-3 py-2 text-left text-sm text-muted-foreground transition-colors outline-none hover:border-foreground/20 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, i) => {
              const streaming = loading && i === messages.length - 1;
              return message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm whitespace-pre-wrap text-primary-foreground">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div key={message.id} className="rounded-2xl rounded-bl-md border bg-card px-4 py-2">
                  {message.content ? (
                    <ChatMarkdown content={message.content} isAnimating={streaming} />
                  ) : (
                    <p className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                      <LoaderCircle className="size-4 animate-spin" />
                      Reading the code…
                    </p>
                  )}
                  {!streaming && <ChatCitations citations={message.citations} repoUrl={repoUrl} />}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="border-t bg-background">
        <form
          className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(input);
          }}
        >
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={loading || clearing}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              {clearing ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
            </Button>
          )}
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Ask about ${repoName}…`}
            aria-label="Message"
            rows={1}
            maxLength={4000}
            className="max-h-40 min-h-9 resize-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
            {loading ? <LoaderCircle className="animate-spin" /> : <ArrowUp />}
          </Button>
        </form>
      </div>
    </div>
  );
}
