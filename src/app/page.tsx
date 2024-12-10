import Header from "./components/base/Header";
import Sidebar from "./components/base/Sidebar";
import Message from "./components/chat/Message";

export default function CryptoAIChat() {
  return (
    <div className="flex flex-col !max-h-[100svh] h-full bg-zinc-950 text-white">
      <div className="fixed bottom-2 right-2 text-sm bg-zinc-950 px-3 py-0.5 rounded-full border border-amber-500 text-amber-500 tracking-wide">
        Beta
      </div>
      <div className="flex">
        <div
          className={`w-72 max-h-[100svh] relative overflow-hidden transform transition-all duration-150`}
        >
          <Sidebar />
        </div>
        <div className="max-h-[100svh] h-full w-full">
          <Header />
          <div className="h-[calc(100svh-60px)]">
            <Message />
          </div>
        </div>
      </div>
    </div>
  );
}
