import { useRef, useEffect, useCallback, useState } from "react";
import Hls from "hls.js";
import SkipButton from "./SkipButton";
import QualitySelector from "./QualitySelector";

export default function VideoPlayer({
  streams = [],
  subtitles = [],
  intro = null,
  outro = null,
  onTimeUpdate,
  initialTime = 0,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [isReady, setIsReady] = useState(false);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streams.length) return;

    destroyHls();
    setIsReady(false);
    setQualities([]);

    const hlsStreams = streams.filter(
      (s) => s.type === "hls" || s.url?.includes(".m3u8")
    );

    if (Hls.isSupported() && hlsStreams.length > 0) {
      // Build master playlist for ABR
      let masterM3u8 = "#EXTM3U\n";
      hlsStreams.forEach((s) => {
        let bandwidth = 5000000;
        let res = "1920x1080";
        if (s.quality === "720p") { bandwidth = 2500000; res = "1280x720"; }
        if (s.quality === "480p") { bandwidth = 1500000; res = "854x480"; }
        if (s.quality === "360p") { bandwidth = 800000; res = "640x360"; }

        let pUrl = window.location.origin + "/proxy?url=" + encodeURIComponent(s.url);
        if (s.referer) pUrl += "&referer=" + encodeURIComponent(s.referer);

        masterM3u8 += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${res}\n${pUrl}\n`;
      });

      const blob = new Blob([masterM3u8], { type: "application/vnd.apple.mpegurl" });
      const masterUrl = URL.createObjectURL(blob);

      const streamReferer = hlsStreams[0]?.referer || "";

      const hls = new Hls({
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        fragLoadingTimeOut: 120000,
        manifestLoadingTimeOut: 120000,
        levelLoadingTimeOut: 120000,
        fragLoadingMaxRetry: 10,
        levelLoadingMaxRetry: 10,
        xhrSetup: function (xhr, url) {
          if (!url.startsWith("blob:") && !url.includes("/proxy?")) {
            let proxyUrl = "/proxy?url=" + encodeURIComponent(url);
            if (streamReferer) proxyUrl += "&referer=" + encodeURIComponent(streamReferer);
            xhr.open("GET", proxyUrl, true);
          }
        },
      });

      hls.loadSource(masterUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const q = data.levels.map((level, index) => ({
          label: `${level.height}p`,
          value: index,
        }));
        setQualities([{ label: "Auto", value: -1 }, ...q]);
        setCurrentQuality(-1);
        setIsReady(true);

        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, errData) => {
        if (errData.fatal) {
          switch (errData.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl") && hlsStreams.length > 0) {
      // Safari native HLS
      let proxyUrl = "/proxy?url=" + encodeURIComponent(hlsStreams[0].url);
      if (hlsStreams[0].referer) proxyUrl += "&referer=" + encodeURIComponent(hlsStreams[0].referer);
      video.src = proxyUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsReady(true);
        if (initialTime > 0) video.currentTime = initialTime;
        video.play().catch(() => {});
      });
    } else {
      // Direct MP4 streams
      const directStreams = streams.filter((s) => s.type !== "hls" && !s.url?.includes(".m3u8"));
      if (directStreams.length > 0) {
        const q = directStreams.map((s) => ({ label: s.quality, value: s.quality }));
        setQualities(q);
        setCurrentQuality(directStreams[0].quality);

        let proxyUrl = "/proxy?url=" + encodeURIComponent(directStreams[0].url);
        if (directStreams[0].referer) proxyUrl += "&referer=" + encodeURIComponent(directStreams[0].referer);
        video.src = proxyUrl;
        setIsReady(true);
      }
    }

    return () => destroyHls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streams, destroyHls]);

  // Add subtitle tracks
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !subtitles?.length) return;

    // Remove existing tracks
    while (video.firstChild) video.removeChild(video.firstChild);

    subtitles.forEach((sub, idx) => {
      const track = document.createElement("track");
      track.kind = sub.kind || "captions";
      track.label = sub.label || `Subtitle ${idx + 1}`;
      track.src = sub.file;
      if (idx === 0) track.default = true;
      video.appendChild(track);
    });
  }, [subtitles, isReady]);

  // Time update handler
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.({
        currentTime: video.currentTime,
        duration: video.duration,
      });
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [onTimeUpdate]);

  const handleQualityChange = (quality) => {
    setCurrentQuality(quality);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = parseInt(quality);
    } else {
      // Direct stream quality switch
      const video = videoRef.current;
      const selectedStream = streams.find((s) => s.quality === quality);
      if (selectedStream && video) {
        const ct = video.currentTime;
        let proxyUrl = "/proxy?url=" + encodeURIComponent(selectedStream.url);
        if (selectedStream.referer) proxyUrl += "&referer=" + encodeURIComponent(selectedStream.referer);
        video.src = proxyUrl;
        video.currentTime = ct;
        video.play().catch(() => {});
      }
    }
  };

  const handleSkipIntro = () => {
    if (videoRef.current && intro) {
      videoRef.current.currentTime = intro.end;
    }
  };

  const handleSkipOutro = () => {
    if (videoRef.current && outro) {
      videoRef.current.currentTime = outro.end;
    }
  };

  const showSkipIntro =
    intro && intro.end > 0 && currentTime >= intro.start && currentTime < intro.end;
  const showSkipOutro =
    outro && outro.end > 0 && currentTime >= outro.start && currentTime < outro.end;

  return (
    <div className="relative w-full">
      {/* Video container with 16:9 aspect ratio */}
      <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-2xl shadow-black/60 border border-surface-border">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          controls
          playsInline
          crossOrigin="anonymous"
        />

        {/* Skip buttons */}
        {showSkipIntro && <SkipButton label="Skip Intro" onClick={handleSkipIntro} />}
        {showSkipOutro && <SkipButton label="Skip Outro" onClick={handleSkipOutro} />}
      </div>

      {/* Quality selector */}
      {qualities.length > 0 && (
        <div className="mt-4 flex justify-end">
          <QualitySelector
            qualities={qualities}
            current={currentQuality}
            onChange={handleQualityChange}
          />
        </div>
      )}
    </div>
  );
}
