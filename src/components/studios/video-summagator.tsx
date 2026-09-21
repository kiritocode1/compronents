"use client";

import { Maximize2, RefreshCw, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SliderComfortable } from "@/components/site/studio-controls";
import VideoSummagator, {
  type QualityTier,
  type VideoSummagatorHandle,
  type VolumeInfo,
} from "@/registry/video-summagator";

const PRESETS = [
  {
    id: "volume",
    label: "Volume",
    depth: 3,
    density: 0.1,
    brightness: 1,
    showFrame: true,
    autoRotate: false,
    speed: 1,
  },
  {
    id: "smear",
    label: "Smear",
    depth: 4,
    density: 0.02,
    brightness: 1.35,
    showFrame: false,
    autoRotate: true,
    speed: 0.6,
  },
  {
    id: "slab",
    label: "Slab",
    depth: 1.1,
    density: 1.4,
    brightness: 0.85,
    showFrame: true,
    autoRotate: false,
    speed: 1.4,
  },
] as const;

type Preset = (typeof PRESETS)[number];

const QUALITIES: { value: QualityTier; label: string }[] = [
  { value: 96, label: "96 · fast" },
  { value: 160, label: "160 · balanced" },
  { value: 240, label: "240 · detailed" },
];

const SAMPLE_SRC = "https://ui.aryank.space/assets/video-summagator/sample.mp4";
const SAMPLE_LABEL = "Flowers · CC0 sample";

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${String(minutes).padStart(2, "0")}:${seconds.toFixed(2).padStart(5, "0")}`;
}

export default function VideoSummagatorStudio() {
  const volume = useRef<VideoSummagatorHandle>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  /** Object URL of the viewer's own clip, revoked when it is replaced. */
  const objectUrl = useRef<string | null>(null);

  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [depth, setDepth] = useState<number>(preset.depth);
  const [density, setDensity] = useState<number>(preset.density);
  const [brightness, setBrightness] = useState<number>(preset.brightness);
  const [speed, setSpeed] = useState<number>(preset.speed);
  const [showFrame, setShowFrame] = useState<boolean>(preset.showFrame);
  const [autoRotate, setAutoRotate] = useState<boolean>(preset.autoRotate);
  const [quality, setQuality] = useState<QualityTier>(160);

  const [src, setSrc] = useState(SAMPLE_SRC);
  const [label, setLabel] = useState(SAMPLE_LABEL);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [info, setInfo] = useState<VolumeInfo | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  const onTimeChange = useCallback((next: number, total: number) => {
    setTime(next);
    setDuration(total);
  }, []);

  const onReady = useCallback((next: VolumeInfo) => {
    setInfo(next);
    setDuration(next.duration);
  }, []);

  function applyPreset(next: Preset) {
    setPreset(next);
    setDepth(next.depth);
    setDensity(next.density);
    setBrightness(next.brightness);
    setSpeed(next.speed);
    setShowFrame(next.showFrame);
    setAutoRotate(next.autoRotate);
  }

  function chooseFile(file: File) {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setPlaying(false);
    setSrc(objectUrl.current);
    setLabel(file.name);
  }

  function backToSample() {
    setPlaying(false);
    setSrc(SAMPLE_SRC);
    setLabel(SAMPLE_LABEL);
  }

  const isLocal = src !== SAMPLE_SRC;

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-black xl:h-[760px]">
        <Link
          href="/components/video-summagator/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <VideoSummagator
          autoRotate={autoRotate}
          brightness={brightness}
          density={density}
          depth={depth}
          onBusyChange={setBusy}
          onMessage={setMessage}
          onPlayingChange={setPlaying}
          onReady={onReady}
          onTimeChange={onTimeChange}
          playing={playing}
          quality={quality}
          ref={volume}
          sampleLabel={label}
          showFrame={showFrame}
          speed={speed}
          src={src}
        />
        {message ? (
          <p className="absolute right-4 bottom-4 z-20 max-w-sm rounded-md border border-white/15 bg-black/80 px-4 py-3 text-xs leading-relaxed text-white/80 backdrop-blur">
            {message}
          </p>
        ) : null}
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Video Summagator
              </h2>
            </div>
            <button
              aria-label="Reset studio"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => applyPreset(PRESETS[0])}
              title="Reset studio"
              type="button"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>

          <div className="grid w-full grid-cols-3 gap-1 rounded-md border bg-card p-1 xl:max-w-xl">
            {PRESETS.map((item) => (
              <button
                className={`flex min-h-10 items-center justify-center rounded px-3 text-center text-[0.68rem] uppercase leading-tight transition-colors ${
                  preset.id === item.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                key={item.id}
                onClick={() => applyPreset(item)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(260px,1fr)_minmax(260px,1fr)_minmax(260px,1fr)]">
          <section className="grid content-start gap-3">
            <div className="flex flex-col gap-2">
              <span className="label">Clip</span>
              <div className="flex gap-2">
                <button
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md border bg-card px-3 text-xs transition-colors hover:border-border-strong disabled:opacity-50"
                  disabled={busy}
                  onClick={() => fileInput.current?.click()}
                  type="button"
                >
                  <Upload className="size-3.5" />
                  Choose video
                </button>
                {isLocal ? (
                  <button
                    className="h-10 rounded-md border bg-card px-3 text-xs transition-colors hover:border-border-strong disabled:opacity-50"
                    disabled={busy}
                    onClick={backToSample}
                    type="button"
                  >
                    Sample
                  </button>
                ) : null}
              </div>
              <input
                accept="video/*,.mp4,.mov,.webm,.m4v"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) chooseFile(file);
                }}
                ref={fileInput}
                type="file"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="label">Samples</span>
              <div className="grid grid-cols-3 gap-1 rounded-md border bg-card p-1">
                {QUALITIES.map((item) => (
                  <button
                    className={`flex min-h-8 items-center justify-center rounded px-2 text-[0.68rem] transition-colors disabled:opacity-50 ${
                      quality === item.value
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    disabled={busy}
                    key={item.value}
                    onClick={() => setQuality(item.value)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="h-10 flex-1 rounded-md border bg-card px-3 text-xs transition-colors hover:border-border-strong disabled:opacity-50"
                disabled={busy}
                onClick={() => setPlaying((value) => !value)}
                type="button"
              >
                {playing ? "Pause" : "Play"}
              </button>
              <button
                className="h-10 rounded-md border bg-card px-3 text-xs transition-colors hover:border-border-strong"
                onClick={() => volume.current?.stepFrame(-1)}
                title="Previous frame"
                type="button"
              >
                ←
              </button>
              <button
                className="h-10 rounded-md border bg-card px-3 text-xs transition-colors hover:border-border-strong"
                onClick={() => volume.current?.stepFrame(1)}
                title="Next frame"
                type="button"
              >
                →
              </button>
            </div>

            <SliderComfortable
              formatValue={(v) => formatTime(v)}
              label="Time"
              max={duration}
              min={0}
              onChange={(value) => {
                setPlaying(false);
                setTime(value);
                volume.current?.seek(value);
              }}
              step={0.01}
              value={Math.min(time, duration)}
              variant="scrubber"
            />
          </section>

          <section className="grid content-start gap-3">
            <SliderComfortable
              formatValue={(v) => `${v.toFixed(2)}`}
              label="Time depth"
              max={4}
              min={0.5}
              onChange={setDepth}
              step={0.05}
              value={depth}
              variant="scrubber"
            />
            <SliderComfortable
              formatValue={(v) => `${v.toFixed(2)}`}
              label="Density"
              max={2}
              min={0.02}
              onChange={setDensity}
              step={0.02}
              value={density}
              variant="scrubber"
            />
            <SliderComfortable
              formatValue={(v) => `${v.toFixed(2)}`}
              label="Brightness"
              max={1.7}
              min={0.5}
              onChange={setBrightness}
              step={0.05}
              value={brightness}
              variant="scrubber"
            />
            <SliderComfortable
              formatValue={(v) => `${v.toFixed(1)}x`}
              label="Speed"
              max={2}
              min={0.1}
              onChange={setSpeed}
              step={0.1}
              value={speed}
              variant="scrubber"
            />
          </section>

          <section className="grid content-start gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                checked={showFrame}
                className="size-4 accent-foreground"
                onChange={(event) => setShowFrame(event.target.checked)}
                type="checkbox"
              />
              Frame plane outline
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                checked={autoRotate}
                className="size-4 accent-foreground"
                onChange={(event) => setAutoRotate(event.target.checked)}
                type="checkbox"
              />
              Auto rotate
            </label>
            <div className="flex gap-2">
              <button
                className="h-10 flex-1 rounded-md border bg-card px-3 text-xs transition-colors hover:border-border-strong"
                onClick={() => volume.current?.resetCamera()}
                type="button"
              >
                Reset camera
              </button>
              <button
                className="h-10 flex-1 rounded-md border bg-card px-3 text-xs transition-colors hover:border-border-strong"
                onClick={() => volume.current?.frontView()}
                type="button"
              >
                Front view
              </button>
            </div>

            {info ? (
              <p className="whitespace-pre-line border-t pt-3 font-mono text-[0.65rem] leading-relaxed text-muted-foreground">
                {`${info.label}\n${info.duration.toFixed(2)}s · ${info.sourceWidth} × ${info.sourceHeight}\n${info.count} samples · ${info.width} × ${info.height} per frame · ${(info.bytes / 1048576).toFixed(1)} MiB`}
              </p>
            ) : null}

            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Load your own mp4 and it never leaves the browser: frames are
                seeked, drawn to a canvas and read back on your device. Raising
                the sample count re-decodes the clip, which is 240 serial seeks
                at the top tier.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
