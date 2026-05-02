import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { LogOutButton } from "./logout-button";
import { SetupsClient } from "./setups-client";

export default async function SetupsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token || !(await verifySession(token))) {
    redirect("/");
  }

  const twitchChannel = process.env.TWITCH_CHANNEL || "";
  const streamerWeight = Number(process.env.STREAMER) || 50;

  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h1 className="text-lg font-semibold text-foreground">
          Setups del Chat
        </h1>
        <LogOutButton />
      </div>
      <SetupsClient twitchChannel={twitchChannel} streamerWeight={streamerWeight} />
    </div>
  );
}
