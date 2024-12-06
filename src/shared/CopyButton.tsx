import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiCheck } from "react-icons/fi";
import { PiCopySimple } from "react-icons/pi";
interface CopyButtonProps {
  copy: string | undefined;
  className?: string;
  showToast?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  copy,
  className,
  showToast = true,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (showToast) toast.success("Copied to clipboard");
    setTimeout(() => {
      setCopied(false);
    }, 2000); // Hide tick icon after 3 seconds
  };

  return (
    <div
      onClick={(e) => copyToClipboard(copy ?? "", e)}
      className={`text-zinc-400 rounded-md cursor-pointer ${className}`}
    >
      {copied ? (
        <FiCheck className="text-green-500" />
      ) : (
        <PiCopySimple className="" />
      )}
    </div>
  );
};

export default CopyButton;
