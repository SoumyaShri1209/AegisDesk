import ChatPanel from "@/components/chat/ChatPanel";

export default async function DashboardPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Ask me about company policies</h1>
        <p className="text-sm text-white/50 mt-1">
          I answer using your company&apos;s policies, or route your request to the right team.
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}