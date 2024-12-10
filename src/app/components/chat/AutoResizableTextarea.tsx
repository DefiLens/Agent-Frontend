import React, { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { IoSend } from "react-icons/io5";
import Loader from "@/shared/Loader";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

const AutoResizableTextarea = ({
  input,
  setInput,
  loading,
  handleSend,
}: any) => {
  const { isConnected } = useAccount();
  const handleKeyDown = (e: any) => {
    if (
      !loading &&
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      if (!isConnected) {
        toast.error("Connect you wallet first");
        return;
      }
      e.preventDefault(); // Prevent the default newline insert
      handleSend(input);
      setInput("");
    }
  };

  return (
    <div className="w-full flex items-center justify-center bg-white bg-opacity-10 rounded-lg p-2 gap-3">
      <div className="flex-1 flex items-center">
        <TextareaAutosize
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={"Ask any question..."}
          minRows={1}
          maxRows={8}
          className="flex-1 min-h-full resize-none bg-transparent outline-none text-p-text text-base p-2 w-full"
        />
      </div>
      <div className="h-full flex gap-2 items-center justify-end">
        {!loading ? (
          <button
            disabled={loading}
            onClick={() => {
              if (!isConnected) {
                toast.error("Connect you wallet first");
                return;
              }
              handleSend(input);
              setInput("");
            }}
            className={`rounded-lg h-8 w-8 flex justify-center items-center text-5xl transition-all duration-300 bg-primary-gradient text-white ${
              loading ? "bg-opacity-40" : ""
            }`}
          >
            <IoSend className="text-lg" />
          </button>
        ) : (
          <div className="h-8 w-8 flex justify-center items-center">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoResizableTextarea;
