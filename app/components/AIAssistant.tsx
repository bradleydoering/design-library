/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Loader, SendHorizontal, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

// Define message type
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const AIAssistant = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Scroll to bottom of messages when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Send request to API
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: data.id || Date.now().toString(),
          role: "assistant",
          content: data.content,
        },
      ]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err : new Error("Something went wrong"));
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8 max-w-4xl mx-auto pt-24">
      {/* Header */}
      <div className="w-full mt-2 mb-12 text-center">
        <div className="flex items-center justify-center mb-2">
          <Sparkles className="w-6 h-6 text-[#2D332C] mr-2" />
          <h1 className="text-3xl font-bold text-[#2D332C]">AI Assistant</h1>
        </div>
        <p className="text-gray-600 max-w-prose mx-auto">
          Get instant help with your bathroom renovation questions and ideas.
          Our AI assistant is here to guide you through the process.
        </p>
      </div>

      {/* Chat interface */}
      <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-[500px]">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                Start a conversation about your bathroom renovation ideas
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-[#2D332C] text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul {...props} className="list-disc pl-5 my-2" />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol {...props} className="list-decimal pl-5 my-2" />
                          ),
                          li: ({ node, ...props }) => (
                            <li {...props} className="my-1" />
                          ),
                          p: ({ node, ...props }) => (
                            <p {...props} className="my-2" />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong {...props} className="font-semibold" />
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
                <Loader className="w-5 h-5 animate-spin text-[#2D332C]" />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-100 text-red-800 rounded-2xl px-4 py-3 max-w-[80%]">
                <p>Error: {error.message || "Something went wrong"}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:border-blue-500 outline-none"
              value={input}
              placeholder="Type your message..."
              onChange={handleInputChange}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!input.trim().length || isLoading}
              className={`p-3 rounded-full ${
                input.trim() && !isLoading
                  ? "bg-[#2D332C] text-white hover:bg-black"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <SendHorizontal className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
