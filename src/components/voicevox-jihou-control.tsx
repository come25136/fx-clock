"use client";

import { useEffect, useRef, useState } from "react";

type AlertState = {
  title: string;
  body: string;
  detail: string;
} | null;
type JihouToast = {
  id: number;
  message: string;
};

const JIHOU_TOAST_VISIBLE_MS = 5000;

function getAnnouncementFilePath(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `/jihou/${hours}-${minutes}.wav`;
}

function formatAnnouncementText(date: Date) {
  return `${date.getHours()}時${date.getMinutes()}分なのだ`;
}

function getNextBoundary(from = new Date()) {
  const next = new Date(from);
  next.setSeconds(0, 0);
  next.setMinutes(next.getMinutes() + 1);
  return next;
}

async function warmupAudioPlayback() {
  const probe = new Audio(getAnnouncementFilePath(new Date(2000, 0, 1, 0, 0, 0)));
  probe.preload = "auto";
  probe.muted = false;
  probe.volume = 0.01;
  await probe.play();
  probe.pause();
  probe.currentTime = 0;
  probe.src = "";
}

export function VoicevoxJihouControl() {
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastIdRef = useRef(0);
  const toastTimeoutIdsRef = useRef<Set<number>>(new Set());
  const [alertState, setAlertState] = useState<AlertState>(null);
  const [toasts, setToasts] = useState<JihouToast[]>([]);

  useEffect(() => {
    const clearScheduled = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      audioRef.current?.pause();
      audioRef.current = null;

      for (const timeoutId of toastTimeoutIdsRef.current) {
        window.clearTimeout(timeoutId);
      }
      toastTimeoutIdsRef.current.clear();
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

    const showJihouToast = (targetTime: Date) => {
      toastIdRef.current += 1;
      const toastId = toastIdRef.current;
      setToasts([
        {
          id: toastId,
          message: formatAnnouncementText(targetTime),
        },
      ]);

      const removeTimeoutId = window.setTimeout(() => {
        toastTimeoutIdsRef.current.delete(removeTimeoutId);
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      }, JIHOU_TOAST_VISIBLE_MS + 320);

      toastTimeoutIdsRef.current.add(removeTimeoutId);
    };

    const scheduleNext = () => {
      const now = new Date();
      const next = getNextBoundary(now);
      const waitMs = Math.max(next.getTime() - now.getTime(), 0);

      timerRef.current = window.setTimeout(async () => {
        try {
          await playScheduledAudio(next);
          setAlertState(null);
          showJihouToast(next);
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

  return (
    <>
      {toasts.length > 0 ? (
        <div className="pointer-events-none fixed left-4 bottom-4 z-30 flex max-w-[min(28rem,calc(100vw-2rem))] flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="notification-toast rounded-2xl border border-[rgba(94,163,255,0.34)] bg-[linear-gradient(135deg,rgba(17,31,48,0.96)_0%,rgba(17,21,28,0.92)_50%,rgba(14,203,129,0.20)_100%)] px-4 py-3 text-left shadow-[0_18px_40px_-22px_rgba(0,0,0,0.85)] backdrop-blur-md"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7db8ff]">
                JIHOU
              </p>
              <p className="mt-1 text-sm font-medium leading-5 text-[var(--ink)]">
                {toast.message}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {alertState ? (
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
      ) : null}
    </>
  );
}
