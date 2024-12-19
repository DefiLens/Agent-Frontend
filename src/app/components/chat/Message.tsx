"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { DataState } from "@/app/context/dataProvider";
import AutoResizableTextarea from "./AutoResizableTextarea";
import axios from "axios";
import { API_URL } from "@/utils/keys";
import toast from "react-hot-toast";
import Loader from "@/shared/Loader";

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

const Message = () => {
  const {
    selectedChat,
    setSelectedChat,
    messageContainerRef,
    bottomRef,
    messages,
    setMessages,
    fetchChats,
  } = DataState();
  const { isConnected } = useAccount();
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentStreamMessage, setCurrentStreamMessage] = useState("");
  const [topCoins, setTopCoins] = useState<Coin[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<string>("");
  const { address } = useAccount();
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStreamMessage]);

  const getOrCreateChat = async (prompt: string) => {
    let newChatId: string;
    if (selectedChat === null) {
      setMessages([]);

      const response = await axios.post(`${API_URL}/chat`, {
        chatName: prompt.slice(0, 50),
        userAddress: address,
      });
      const newChat = response.data;
      newChatId = newChat._id;
      setSelectedChat(newChat?._id);

      setMessages([]);
    } else {
      newChatId = selectedChat;
    }
    return newChatId;
  };

  const handleSaveMessage = async (
    prompt: string,
    text: string,
    chatId: string
  ) => {
    try {
      if (chatId && prompt && text) {
        const response = await axios.post(`${API_URL}/message`, {
          prompt: prompt,
          text: text,
          chatId: chatId,
        });

        const newMessage = response.data;
      } else {
        console.log("no data");
      }
    } catch (error) {
      console.error("Error creating message:", error);
      toast.error("Something went wrong");
    }
  };

  const sendMessage = async (inputMessage: string) => {
    if (inputMessage.trim() === "") return;
    // Add user message
    const chatId = await getOrCreateChat(inputMessage);
    setSelectedChat(chatId);
    fetchChats();
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
    };
    setMessages((prev: any) => [...prev, userMessage]);

    // Reset input
    const messageToSend = inputMessage;
    setInputMessage("");
    setIsThinking(true);
    setIsStreaming(true);

    // Start streaming response
    setCurrentStreamMessage("");
    resultRef.current = "";

    try {
      const response = await fetch(`${API_URL}/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          history: messages,
          address,
        }),
      });

      // Create EventSource
      const eventSource: any = await createEventSource(
        response,
        inputMessage,
        chatId
      );

      return () => {
        if (eventSource) eventSource.close();
      };
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Something went wrong");
      setIsStreaming(false);
    }
  };

  const createEventSource = (
    response: Response,
    inputMessage: string,
    chatId: string
  ) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    setIsThinking(false);

    const processStream: any = async () => {
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
                handleStreamEvent(event, inputMessage, chatId);
              } catch (parseError) {
                console.error("Error parsing event:", parseError);
              }
            }
          });
        }
      } catch (error) {
        console.error("Stream reading error:", error);
        toast.error("Something went wrong");
        setIsStreaming(false);
      }
    };

    processStream();
  };

  const handleStreamEvent = (
    event: any,
    inputMessage: string,
    chatId: string
  ) => {
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
        setMessages((prev: any) => [
          ...prev,
          {
            role: "tool",
            name: event.functionName,
            content: JSON.stringify(event.result),
          },
        ]);
        break;
      case "complete":
        finalizeStreaming(inputMessage, chatId);
        break;
      case "error":
        console.error(event.message);
        setIsStreaming(false);
        break;
    }
  };

  const finalizeStreaming = (inputMessage: string, chatId: string) => {
    if (resultRef.current) {
      setMessages((prev: any) => [
        ...prev,
        {
          role: "assistant",
          content: resultRef.current,
        },
      ]);
      handleSaveMessage(inputMessage, resultRef.current, chatId);
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
          {/* <div className="flex flex-col items-center mx-2">
            {isUser ? (
              <FaUser className="text-2xl text-blue-400 mb-1" />
            ) : (
              <FaRobot className="text-2xl text-green-400 mb-1" />
            )}
          </div> */}
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
        code({ node, inline, className, children, ...props }: any) {
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
            className="text-blue-600 underline hover:text-blue-500 transition-colors duration-200"
          >
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <img
            src={src || ""}
            alt={alt || ""}
            // className="max-w-full h-auto my-4 rounded-lg border border-zinc-700"
            className="max-w-full h-1 my-4 rounded-lg border border-zinc-700"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-900/50 h-full">
      <div className="flex-1 overflow-y-auto space-y-4">
        <div
          className={`relative h-full flex-1 overflow-hidden bg-1 p-4 flex flex-col gap-5 rounded-2xl max-w-4xl mx-auto`}
        >
          {selectedChat != null && (
            <div
              className="relative overflow-auto scroll_hide flex-1"
              ref={messageContainerRef}
            >
              <div className="flex-1 overflow-y-auto space-y-4">
                {messages.map(renderMessage)}

                {/* Streaming Message */}
                {isStreaming && (
                  <div className="flex w-full justify-start">
                    <div className="flex items-start max-w-[80%]">
                      <div className="p-3 rounded-lg bg-zinc-800 text-zinc-200">
                        <span>
                          {isThinking && (
                            <span className="flex items-center gap-2 animate-pulse">
                              <Loader />
                              <span className="text-cyan-500 font-medium flex gap-1">
                                <span>Thinking</span>
                                <span className="dot-animate">.</span>
                                <span className="dot-animate">.</span>
                                <span className="dot-animate">.</span>
                              </span>
                            </span>
                          )}
                        </span>

                        {renderMarkdown(currentStreamMessage)}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef}></div>
              </div>
              <div ref={bottomRef} />
            </div>
          )}

          {selectedChat === null && (
            <div className="w-full mx-auto h-full relative px-3">
              <div className="flex flex-col items-center justify-center gap-4 h-full">
                <div className="w-full flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center justify-center py-2">
                    <img
                      height={50}
                      width={50}
                      src="/assets/snapbam.svg"
                      alt="DefiLens"
                      className="w-8 h-9 md:h-9 md:w-9 mr-3 block"
                    />
                    <img
                      height={50}
                      width={50}
                      src="/assets/snapbam_text.svg"
                      alt="DefiLens"
                      className="w-28 md:w-36 mr-2"
                    />
                  </div>
                  <span className="p-text text-lg md:text-2xl flex items-center font-semibold">
                    Your{" "}
                    <span>
                      <img src="/assets/base.svg" className="h-5 w-5 mx-2" />
                    </span>
                    Base AI Agent for trading
                  </span>
                </div>
                <div className="flex flex-col gap-3 md:gap-4 w-full">
                  <div className="md:p-0">
                    <AutoResizableTextarea
                      input={inputMessage}
                      setInput={setInputMessage}
                      loading={isStreaming}
                      handleSend={sendMessage}
                    />
                  </div>
                  <ul className="flex flex-col md:flex-row gap-2 md:gap-4 flex-wrap items-center justify-center">
                    {suggestionsList?.map((suggestion: any, index: any) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isConnected) {
                            toast.error("Connect you wallet first");
                            return;
                          }
                          sendMessage(suggestion);
                        }}
                        disabled={isStreaming}
                        className="flex items-center gap-3 bg-zinc-800 rounded-lg s-text cursor-pointer text-xs md:text-sm font-medium text-nowrap px-2 md:px-5 py-1 md:py-1.5"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {selectedChat != null && (
            <AutoResizableTextarea
              input={inputMessage}
              setInput={setInputMessage}
              loading={isStreaming}
              handleSend={sendMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
const suggestionsList: any = [
  "Check my wallet balance",
  "Show me the current market cap of Bitcoin",
  "List the top 20 trending memecoins",
  "What’s the current price of Ethereum?",
  "Compare the performance of Ethereum and Cardano over the past week",
  "What’s the gas fee for a transaction on the Ethereum network right now?",
  "Buy 2 Brett tokens for me",
  "Get details of my last 5 transactions",
  "Show the historical price chart of Polkadot for the last month",
];
