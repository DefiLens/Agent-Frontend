"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaUser, FaPaperPlane, FaChartBar } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Header from "./components/base/Header";
import { useAccount } from "wagmi";

interface Message {
  role: "user" | "assistant" | "tool";
  content: string;
  name?: string;
}

interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChangePercentage24h: number;
}

export default function CryptoAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("top 3 coins");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamMessage, setCurrentStreamMessage] = useState("");
  const [topCoins, setTopCoins] = useState<Coin[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<string>("");
  const { address } = useAccount();
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStreamMessage]);

  const sendMessage = async () => {
    if (inputMessage.trim() === "") return;
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Reset input
    const messageToSend = inputMessage;
    setInputMessage("");

    // Start streaming response
    setIsStreaming(true);
    setCurrentStreamMessage("");
    resultRef.current = "";

    try {
      const response = await fetch("http://localhost:4500/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend, history: messages, address }),
      });

      // Create EventSource
      const eventSource: any = await createEventSource(response);

      return () => {
        if (eventSource) eventSource.close();
      };
    } catch (error) {
      console.error("Error sending message:", error);
      setIsStreaming(false);
    }
  };

  const createEventSource = (response: Response) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader?.read()!;

          if (done) {
            // Stream completed
            // finalizeStreaming();
            break;
          }

          const chunk = decoder.decode(value);
          const events = chunk.split("\n\n");

          events.forEach((eventString) => {
            if (eventString.startsWith("data: ")) {
              try {
                const event = JSON.parse(eventString.replace("data: ", ""));
                handleStreamEvent(event);
              } catch (parseError) {
                console.error("Error parsing event:", parseError);
              }
            }
          });
        }
      } catch (error) {
        console.error("Stream reading error:", error);
        setIsStreaming(false);
      }
    };

    processStream();
  };

  const handleStreamEvent = (event: any) => {
    switch (event.type) {
      case "text":
        resultRef.current += event.content;
        // Optionally update UI for streaming text
        setCurrentStreamMessage((prev) => prev + event.content);
        break;
      case "function":
        // Add function result to messages
        if (event.functionName === "fetch_top_coins") {
          setTopCoins(event.result);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "tool",
            name: event.functionName,
            content: JSON.stringify(event.result),
          },
        ]);
        break;
      case "complete":
        finalizeStreaming();
        break;
      case "error":
        console.error(event.message);
        setIsStreaming(false);
        break;
    }
  };

  const finalizeStreaming = () => {
    if (resultRef.current) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: resultRef.current,
        },
      ]);
      setCurrentStreamMessage("");
      setIsStreaming(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    const isTool = message.role === "tool";

    if (isTool) {
      return (
        <div
          key={index}
          className="bg-zinc-800 p-3 rounded-lg my-2 max-w-[80%] mx-auto"
        >
          <div className="text-sm text-zinc-400 mb-2">
            Function Result: {message.name}
          </div>
          <ReactMarkdown
            className="prose prose-invert"
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`
            flex items-start max-w-[80%] mb-4 
            ${isUser ? "flex-row-reverse" : "flex-row"}
          `}
        >
          <div className="flex flex-col items-center mx-2">
            {isUser ? (
              <FaUser className="text-2xl text-blue-400 mb-1" />
            ) : (
              <FaRobot className="text-2xl text-green-400 mb-1" />
            )}
          </div>
          <div
            className={`
              p-3 rounded-lg 
              ${isUser ? "bg-zinc-800 text-white" : "bg-zinc-800 text-zinc-200"}
            `}
          >
            {renderMarkdown(message.content)}
          </div>
        </div>
      </div>
    );
  };

  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="rounded-lg overflow-hidden my-4"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className="bg-zinc-900 text-zinc-200 rounded px-1.5 py-0.5 font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          );
        },
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mb-4 text-zinc-100 border-b border-zinc-700 pb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-semibold mb-3 text-zinc-100 border-b border-zinc-700 pb-1.5">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-medium mb-2 text-zinc-200">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-medium mb-2 text-zinc-300">{children}</h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-base font-medium mb-1.5 text-zinc-400">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-sm font-medium mb-1 text-zinc-500">{children}</h6>
        ),
        p: ({ children }) => (
          <p className="mb-3 text-zinc-300 leading-relaxed">{children}</p>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-zinc-600 pl-4 italic text-zinc-400 mb-4 bg-zinc-800/50 py-2">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-3 text-zinc-300">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-3 text-zinc-300">{children}</ol>
        ),
        li: ({ children }) => <li className="mb-1.5 pl-1">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-bold text-zinc-100">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-zinc-400">{children}</em>
        ),
        del: ({ children }) => (
          <del className="line-through text-zinc-500">{children}</del>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4 rounded-lg">
            <table className="w-full border-collapse border border-zinc-700 bg-zinc-900">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-zinc-700 bg-zinc-800 text-left px-3 py-2 text-zinc-200 font-semibold ">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-zinc-700 px-3 py-2 text-zinc-300">
            {children}
          </td>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-400 transition-colors duration-200"
          >
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <img
            src={src || ""}
            alt={alt || ""}
            className="max-w-full h-auto my-4 rounded-lg border border-zinc-700"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="flex flex-col !max-h-[100svh] h-full bg-zinc-950 text-white">
      <Header />
      <div className="flex h-[calc(100svh-60px)]">
        {/* Left Sidebar - Top Coins */}
        <div className="w-2/12 bg-zinc-900 p-4 border-r border-zinc-800 overflow-y-auto"></div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col bg-zinc-950">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(renderMessage)}

            {/* Streaming Message */}
            {isStreaming && (
              <div className="flex w-full justify-start">
                <div className="flex items-start max-w-[80%]">
                  <div className="flex flex-col items-center mx-2">
                    <FaRobot className="text-2xl text-green-400 mb-1" />
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800 text-zinc-200">
                    {renderMarkdown(currentStreamMessage)}
                    <span className="animate-pulse">|</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-transparent">
            <div className="flex items-center max-w-3xl w-full mx-auto">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about cryptocurrencies..."
                className="
              flex-1 p-3 rounded-lg 
              bg-zinc-800 text-white 
              focus:outline-none focus:ring-2 focus:ring-blue-500
              mr-2
            "
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming}
                className="
              bg-blue-600 hover:bg-blue-700 
              p-3 rounded-lg 
              transition-colors 
              disabled:opacity-50 disabled:cursor-not-allowed
            "
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
