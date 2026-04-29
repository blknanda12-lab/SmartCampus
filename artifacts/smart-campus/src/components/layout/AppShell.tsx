import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Chatbot } from "../Chatbot";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="container mx-auto p-4 md:p-6 max-w-7xl animate-in fade-in duration-500 pb-24">
            {children}
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
