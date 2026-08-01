"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDeviceId } from "@/lib/deviceId";
import { AnnouncementPoll } from "@/types";
import { Check } from "lucide-react";
import clsx from "clsx";

export default function PollWidget({ postId, poll }: { postId: string; poll: AnnouncementPoll }) {
  const [tally, setTally] = useState<Record<string, number>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const deviceId = getDeviceId();
    const unsub = onSnapshot(collection(db, "announcements", postId, "votes"), (snap) => {
      const counts: Record<string, number> = {};
      let mine: string | null = null;
      snap.forEach((d) => {
        const data = d.data() as { optionId: string };
        counts[data.optionId] = (counts[data.optionId] ?? 0) + 1;
        if (d.id === deviceId) mine = data.optionId;
      });
      setTally(counts);
      setMyVote(mine);
    });
    return () => unsub();
  }, [postId]);

  const totalVotes = Object.values(tally).reduce((a, b) => a + b, 0);
  const showResults = myVote !== null;

  const castVote = async (optionId: string) => {
    if (voting) return;
    setVoting(true);
    try {
      const deviceId = getDeviceId();
      await setDoc(doc(db, "announcements", postId, "votes", deviceId), {
        optionId,
        votedAt: Date.now(),
      });
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
      <p className="mb-3 font-semibold text-ink">{poll.question}</p>
      <div className="space-y-2">
        {poll.options.map((opt) => {
          const votes = tally[opt.id] ?? 0;
          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isMine = myVote === opt.id;

          if (!showResults) {
            return (
              <button
                key={opt.id}
                onClick={() => castVote(opt.id)}
                disabled={voting}
                className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2.5 text-left text-sm font-medium text-ink transition hover:border-primary hover:bg-primary/5 hover:pl-5 disabled:opacity-60"
              >
                {opt.text}
              </button>
            );
          }

          return (
            <button
              key={opt.id}
              onClick={() => castVote(opt.id)}
              disabled={voting}
              className={clsx(
                "relative block w-full overflow-hidden rounded-lg border px-4 py-2.5 text-left text-sm transition",
                isMine ? "border-primary" : "border-primary/15"
              )}
            >
              <span
                className="poll-bar-fill absolute inset-y-0 left-0 bg-primary/15"
                style={{ width: `${pct}%` }}
              />
              <span className="relative flex items-center justify-between gap-2">
                <span className={clsx("flex items-center gap-1.5 font-medium", isMine ? "text-primary" : "text-ink")}>
                  {isMine && <Check size={14} />}
                  {opt.text}
                </span>
                <span className="shrink-0 text-xs font-semibold text-ink/60">{pct}%</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-ink/50">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        {!showResults && " · Tap an option to vote"}
      </p>
    </div>
  );
}