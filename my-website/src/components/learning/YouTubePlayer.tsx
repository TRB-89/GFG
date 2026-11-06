"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { Play, Volume2, ShieldCheck, ExternalLink, AlertCircle } from "lucide-react";

interface YTPlayerInstance {
  destroy: () => void;
  playVideo?: () => void;
  pauseVideo?: () => void;
  stopVideo?: () => void;
}

interface YTPlayerEvent {
  target: YTPlayerInstance;
  data: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          events: {
            onReady?: (event: YTPlayerEvent) => void;
            onStateChange?: (event: YTPlayerEvent) => void;
            onError?: (event: YTPlayerEvent) => void;
          };
        }
      ) => YTPlayerInstance;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoUrlOrId: string;
  title?: string;
  autoplay?: boolean;
  height?: string | number;
  width?: string | number;
  onPlayerReady?: (event: YTPlayerEvent) => void;
  onPlayerStateChange?: (event: YTPlayerEvent) => void;
  onEnded?: () => void;
}

/**
 * Parses YouTube video IDs from various URL formats or returns the ID directly.
 * Handles:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - VIDEO_ID
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex patterns for standard YouTube URLs
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function YouTubePlayer({
  videoUrlOrId,
  title = "Course Video Lesson",
  autoplay = false,
  height = "100%",
  width = "100%",
  onPlayerReady,
  onPlayerStateChange,
  onEnded,
}: YouTubePlayerProps) {
  const generatedId = useId();
  const containerId = `yt-player-${generatedId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(false);
  const videoId = extractYouTubeId(videoUrlOrId);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;

    const bindPlayerEvents = () => {
      if (!window.YT || !window.YT.Player) return;

      try {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {}
        }

        // Attach YT.Player to the existing iframe element
        playerRef.current = new window.YT.Player(containerId, {
          events: {
            onReady: (event: YTPlayerEvent) => {
              if (isMounted) setIsReady(true);
              if (onPlayerReady) onPlayerReady(event);
            },
            onStateChange: (event: YTPlayerEvent) => {
              if (onPlayerStateChange) onPlayerStateChange(event);
              // YT.PlayerState.ENDED is 0
              if (event.data === 0 && onEnded) {
                onEnded();
              }
            },
            onError: () => {
              if (isMounted) setHasPlaybackError(true);
            },
          },
        });
      } catch (e) {
        console.warn("YouTube player binding:", e);
      }
    };

    // Load IFrame API asynchronously if not yet in window
    if (!window.YT || !window.YT.Player) {
      const existingScript = document.getElementById("youtube-iframe-api");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        bindPlayerEvents();
      };
    } else {
      bindPlayerEvents();
    }

    return () => {
      isMounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, [videoId, containerId, onPlayerReady, onPlayerStateChange, onEnded]);

  if (!videoId) {
    return null;
  }

  const iframeSrc = `https://www.youtube.com/embed/${videoId}?enablejsapi=1${
    origin ? `&origin=${encodeURIComponent(origin)}` : ""
  }&playsinline=1&modestbranding=1&rel=0${autoplay ? "&autoplay=1" : ""}`;

  return (
    <div className="w-full space-y-2">
      {/* Editorial Player Frame */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0d0d0d] border border-[#D8C2A6]/25 shadow-2xl group">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A56F7C] to-transparent opacity-60 z-10 pointer-events-none" />

        {/* Direct HTML IFrame Player with enablejsapi=1 */}
        <iframe
          id={containerId}
          title={title}
          width={width || "640"}
          height={height || "390"}
          src={iframeSrc}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />

        {/* Fallback if embedded playback is restricted by network/CSP */}
        {hasPlaybackError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#141414] text-center p-6 space-y-3 z-20">
            <AlertCircle className="w-8 h-8 text-[#A56F7C]" />
            <div className="text-sm font-serif text-[#F1E7DB]">
              Embedded Player Restricted
            </div>
            <p className="text-xs text-[#888888] max-w-sm">
              You can open this instructional video directly in YouTube in a secure new tab.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D8C2A6] text-[#111111] text-xs font-semibold hover:bg-[#F1E7DB] transition-colors"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Trust & Playback Indicator */}
      <div className="flex items-center justify-between px-2 text-[11px] text-[#888888] font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Official GFG Educational Stream (YouTube IFrame API)</span>
        </div>
        <div className="flex items-center gap-3">
          {isReady && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Play className="w-3 h-3 fill-current" /> Ready
            </span>
          )}
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#D8C2A6] transition-colors"
          >
            <span>Open in YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
