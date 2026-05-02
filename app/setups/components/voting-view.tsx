"use client";

import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "./chat-panel";
import { VoteControls } from "./vote-controls";
import { StreamerVoteInput } from "./streamer-vote-input";
import { ScoreBar } from "./score-bar";
import { ResetButton } from "./reset-button";
import { MediaCarousel } from "./media-carousel";
import { AudioSection } from "./audio-section";
import type { Setup } from "@/lib/types";

const ChatPanelDynamic = dynamic(() => Promise.resolve(ChatPanel), {
  ssr: false,
});

interface VotingViewProps {
  setup: Setup;
  streamerVote: number;
  isVotingActive: boolean;
  chatAvg: number | null;
  chatVoteCount: number;
  isFlipped: boolean;
  savedChatAvg: number | null;
  savedStreamerAvg: number | null;
  streamerWeight: number;
  chatWeight: number;
  startTime: number | null;
  onStartVoting: () => void;
  onStopVoting: () => void;
  onStreamerVote: (value: number) => void;
  onVote: (user: string, value: number) => void;
  onBack: () => void;
  twitchChannel: string;
}

export function VotingView({
  setup,
  streamerVote,
  isVotingActive,
  chatAvg,
  chatVoteCount,
  isFlipped,
  savedChatAvg,
  savedStreamerAvg,
  streamerWeight,
  chatWeight,
  startTime,
  onStartVoting,
  onStopVoting,
  onStreamerVote,
  onVote,
  onBack,
  twitchChannel,
}: VotingViewProps) {
  const hasContent = !!setup.content;
  const hasAudio = setup.attachments.some((a) => a.type === "audio");

  const showSaved = isFlipped && !isVotingActive;

  const displayChatAvg = showSaved ? savedChatAvg : chatAvg;
  const displayChatVoteCount = showSaved ? null : chatVoteCount;
  const displayStreamerVote = showSaved
    ? (savedStreamerAvg ?? 0)
    : streamerVote;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft />
          Volver
        </Button>
        <h2 className="text-lg font-semibold text-foreground truncate max-w-[60%]">
          {setup.nickname}
        </h2>
        <ResetButton onReset={onBack} />
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <MediaCarousel
            attachments={setup.attachments}
            className="flex-1 min-h-0"
          />
        </div>

        <div className="flex w-96 shrink-0 flex-col border-l border-border">
          <ChatPanelDynamic
            channel={twitchChannel}
            isVotingActive={isVotingActive}
            onVote={onVote}
          />
        </div>
      </div>

      <div className="flex shrink-0 gap-6 border-t border-border px-6 py-4">
        <div className="flex w-72 shrink-0 flex-col gap-3">
          {hasContent && (
            <div className="flex items-start gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setup.avatar}
                alt={setup.nickname}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-foreground/10 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xl font-semibold text-foreground">
                  {setup.nickname}
                </span>
                <p className="text-xl text-muted-foreground line-clamp-3">
                  {setup.content}
                </p>
              </div>
            </div>
          )}

          {!hasContent && (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setup.avatar}
                alt={setup.nickname}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-foreground/10 shrink-0"
              />
              <span className="text-sm font-semibold text-foreground">
                {setup.nickname}
              </span>
            </div>
          )}

          {hasAudio && <AudioSection attachments={setup.attachments} />}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <StreamerVoteInput
            value={displayStreamerVote}
            onChange={onStreamerVote}
            disabled={!isVotingActive}
          />

          <ScoreBar
            chatAvg={displayChatAvg}
            chatVoteCount={displayChatVoteCount}
            streamerVote={displayStreamerVote}
            streamerWeight={streamerWeight}
            chatWeight={chatWeight}
            isVotingActive={isVotingActive}
          />

          <VoteControls
            isVotingActive={isVotingActive}
            startTime={startTime}
            isRevoting={isFlipped}
            onStart={onStartVoting}
            onStop={onStopVoting}
          />
        </div>
      </div>
    </div>
  );
}
