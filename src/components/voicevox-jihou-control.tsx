"use client";

import { useEffect, useRef, useState } from "react";

type AlertState = {
  title: string;
  body: string;
  detail: string;
} | null;

function getAnnouncementFilePath(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `/jihou/${hours}-${minutes}.wav`;
}

function getNextBoundary(from = new Date()) {
  const next = new Date(from);
  next.setSeconds(0, 0);

  const remainder = next.getMinutes() % 5;
  const minutesToAdd = remainder === 0 ? 5 : 5 - remainder;
  next.setMinutes(next.getMinutes() + minutesToAdd);

  return next;
}

async function warmupAudioPlayback() {
  const probe = new Audio(getAnnouncementFilePath(new Date(2000, 0, 1, 0, 0, 0)));
  probe.muted = true;
  await probe.play();
  probe.pause();
  probe.currentTime = 0;
}

export function VoicevoxJihouControl() {
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [alertState, setAlertState] = useState<AlertState>(null);

  useEffect(() => {
    const clearScheduled = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      audioRef.current?.pause();
      audioRef.current = null;
    };

    const showPlaybackAlert = () => {
      setAlertState({
        title: "通知音を再生できません",
        body: "通知音を再生できません。ブラウザが音声再生を制限している可能性があります。画面を一度クリックしてください。",
        detail:
          "クリック後にブラウザの再生制限が解除されると、このダイアログは自動で閉じます。",
      });
    };

    const playScheduledAudio = async (targetTime: Date) => {
      const audio = new Audio(getAnnouncementFilePath(targetTime));
      audioRef.current = audio;
      await audio.play();
    };

    const scheduleNext = () => {
      const now = new Date();
      const next = getNextBoundary(now);
      const waitMs = Math.max(next.getTime() - now.getTime(), 0);

      timerRef.current = window.setTimeout(async () => {
        try {
          await playScheduledAudio(next);
          setAlertState(null);
          scheduleNext();
        } catch {
          showPlaybackAlert();
        }
      }, waitMs);
    };

    const boot = async () => {
      try {
        await warmupAudioPlayback();
        setAlertState(null);
        scheduleNext();
      } catch {
        showPlaybackAlert();
      }
    };

    const unlockOnPointerDown = () => {
      void (async () => {
        try {
          await warmupAudioPlayback();
          setAlertState(null);
          clearScheduled();
          scheduleNext();
        } catch {
          showPlaybackAlert();
        }
      })();
    };

    void boot();
    window.addEventListener("pointerdown", unlockOnPointerDown);

    return () => {
      window.removeEventListener("pointerdown", unlockOnPointerDown);
      clearScheduled();
    };
  }, []);

  if (!alertState) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(10,12,16,0.48)] px-4 py-6 backdrop-blur-[3px]">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[22px] border border-[rgba(255,120,120,0.34)] bg-[linear-gradient(180deg,rgba(46,16,20,0.98)_0%,rgba(35,14,18,0.98)_100%)] shadow-[0_36px_110px_-44px_rgba(0,0,0,0.95)] ring-1 ring-[rgba(255,255,255,0.04)]">
        <div className="border-b border-[rgba(255,120,120,0.2)] px-5 py-4 sm:px-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#ff9aa0]">
            Audio Alert
          </p>
          <h2 className="mt-2 text-[1.15rem] font-semibold text-[#fff1f2]">
            {alertState.title}
          </h2>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <p className="text-sm leading-6 text-[#ffd7d9]">{alertState.body}</p>
          <p className="mt-3 text-[0.78rem] leading-5 text-[rgba(255,215,217,0.72)]">
            {alertState.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
