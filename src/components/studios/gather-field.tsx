"use client";

import { Maximize2 } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import {
  TabsSubtle,
  TabsSubtleItem,
  TabsSubtlePanel,
} from "@/components/ui/tabs-subtle";
import GatherField, {
  isPlateId,
  LIGHTS,
  PLATE_LABELS,
} from "@/registry/gather-field";

/** 0 lets the field pick for the device, and halve itself if it runs slow. */
const COUNTS = [0, 131072, 262144, 524288] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
        active
          ? "border-border-strong bg-muted text-foreground"
          : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-xs transition-colors hover:border-border-strong"
    >
      <span className={checked ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span
        className={`h-3.5 w-6 shrink-0 rounded-full transition-colors ${
          checked ? "bg-foreground" : "bg-muted"
        }`}
      >
        <span
          className={`block size-3 translate-y-[1px] rounded-full bg-background transition-transform ${
            checked ? "translate-x-[11px]" : "translate-x-[1px]"
          }`}
        />
      </span>
    </button>
  );
}

export default function GatherFieldStudio() {
  const [drift, setDrift] = useState(80);
  const [splash, setSplash] = useState(70);
  const [gather, setGather] = useState(33);
  const [depth, setDepth] = useState(80);
  const [travel, setTravel] = useState<"swarm" | "melt">("swarm");
  const [track, setTrack] = useState(true);
  const [links, setLinks] = useState(true);
  const [scan, setScan] = useState(false);
  const [trails, setTrails] = useState(false);
  const [marks, setMarks] = useState(true);
  const [trackers, setTrackers] = useState<"sparse" | "dense">("sparse");
  const [lineAngle, setLineAngle] = useState(100);
  const [lineOffset, setLineOffset] = useState(0);
  const [fadeSide, setFadeSide] = useState(-1);
  const [lightColor, setLightColor] = useState<string>(LIGHTS[0].hex);
  const [paper, setPaper] = useState<"dark" | "light">("dark");
  const [tone, setTone] = useState<"negative" | "true">("negative");
  const [pointCount, setPointCount] = useState(0);
  const [plates, setPlates] = useState<string[]>([
    "sphere",
    "ripple",
    "taiji",
    "ring",
  ]);
  const [index, setIndex] = useState(0);
  const [lightNonce, setLightNonce] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [tab, setTab] = useState(0);
  const idPrefix = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  function touch() {
    setAutoplay(false);
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...list]
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));
    if (next.length === 0) return;
    setPlates((current) => {
      const base = current.every((id) => isPlateId(id)) ? [] : current;
      const merged = [...base, ...next].slice(0, 4);
      for (const url of urls.current) {
        if (!merged.includes(url)) URL.revokeObjectURL(url);
      }
      urls.current = merged.filter((id) => !isPlateId(id));
      return merged;
    });
    setIndex(0);
    touch();
  }

  function removePlate(at: number) {
    setPlates((current) => {
      const gone = current[at];
      if (gone && !isPlateId(gone)) URL.revokeObjectURL(gone);
      const next = current.filter((_, i) => i !== at);
      urls.current = next.filter((id) => !isPlateId(id));
      if (next.length === 0) return ["sphere", "ripple", "taiji", "ring"];
      return next;
    });
    setIndex(0);
    touch();
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[620px] w-full overflow-hidden rounded-t-lg xl:h-[720px]">
        <Link
          href="/components/gather-field/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <GatherField
          drift={drift}
          splash={splash}
          gather={gather}
          depth={depth}
          travel={travel}
          track={track}
          links={links}
          scan={scan}
          trails={trails}
          marks={marks}
          trackers={trackers}
          lineAngle={lineAngle}
          lineOffset={lineOffset}
          fadeSide={fadeSide}
          lightColor={lightColor}
          paper={paper}
          tone={tone}
          pointCount={pointCount}
          autoplay={autoplay}
          plates={plates}
          index={index}
          lightNonce={lightNonce}
          onIndexChange={(n) => {
            setIndex(n);
            touch();
          }}
          onLight={() => {
            setLightNonce((n) => n + 1);
            touch();
          }}
          onTogglePaper={() => {
            setPaper((value) => (value === "dark" ? "light" : "dark"));
            touch();
          }}
          onToggleTravel={() => {
            setTravel((value) => (value === "swarm" ? "melt" : "swarm"));
            touch();
          }}
          onFiles={(dropped) => {
            setPlates(dropped.slice(0, 4));
            for (const url of urls.current) {
              if (!dropped.includes(url)) URL.revokeObjectURL(url);
            }
            urls.current = dropped;
            setIndex(0);
            touch();
          }}
          onInteract={touch}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="label">Studio</p>
            <h2 className="mt-1 text-sm text-foreground uppercase">
              Gather Field
            </h2>
          </div>
        </div>

        <div className="border-t px-4 pt-2 sm:px-5">
          <TabsSubtle selectedIndex={tab} onSelect={setTab} idPrefix={idPrefix}>
            {["Motion", "Line", "Draw", "Light", "Paper", "Pictures"].map(
              (label, i) => (
                <TabsSubtleItem key={label} index={i} label={label} />
              ),
            )}
          </TabsSubtle>
        </div>

        <div className="p-4 sm:p-5">
          <TabsSubtlePanel selectedIndex={tab} index={0} idPrefix={idPrefix}>
            <div className="grid gap-x-5 gap-y-6 lg:grid-cols-2">
              <section className="grid content-start gap-4">
                <SliderComfortable
                  variant="scrubber"
                  label="Drift"
                  value={drift}
                  onChange={(v) => {
                    setDrift(v);
                    touch();
                  }}
                  min={0}
                  max={100}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}`}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Splash"
                  value={splash}
                  onChange={(v) => {
                    setSplash(v);
                    touch();
                  }}
                  min={0}
                  max={100}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}`}
                />
              </section>
              <section className="grid content-start gap-4">
                <SliderComfortable
                  variant="scrubber"
                  label="Gather"
                  value={gather}
                  onChange={(v) => {
                    setGather(v);
                    touch();
                  }}
                  min={0}
                  max={100}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}`}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Depth"
                  value={depth}
                  onChange={(v) => {
                    setDepth(v);
                    touch();
                  }}
                  min={0}
                  max={100}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}`}
                />
                <div className="flex flex-wrap gap-1">
                  <Chip
                    active={travel === "swarm"}
                    onClick={() => {
                      setTravel("swarm");
                      touch();
                    }}
                  >
                    Swarm
                  </Chip>
                  <Chip
                    active={travel === "melt"}
                    onClick={() => {
                      setTravel("melt");
                      touch();
                    }}
                  >
                    Melt
                  </Chip>
                </div>
              </section>
            </div>
          </TabsSubtlePanel>

          <TabsSubtlePanel selectedIndex={tab} index={1} idPrefix={idPrefix}>
            <div className="grid gap-x-5 gap-y-6 lg:grid-cols-2">
              <SliderComfortable
                variant="scrubber"
                label="Angle"
                value={lineAngle}
                onChange={(v) => {
                  setLineAngle(v);
                  touch();
                }}
                min={-180}
                max={180}
                step={0.05}
                formatValue={(v) => `${v.toFixed(2)}°`}
              />
              <SliderComfortable
                variant="scrubber"
                label="Offset"
                value={lineOffset}
                onChange={(v) => {
                  setLineOffset(v);
                  touch();
                }}
                min={-1.3}
                max={1.3}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <div className="flex flex-wrap gap-1">
                <Chip
                  active={fadeSide === 1}
                  onClick={() => {
                    setFadeSide(1);
                    touch();
                  }}
                >
                  Positive
                </Chip>
                <Chip
                  active={fadeSide === -1}
                  onClick={() => {
                    setFadeSide(-1);
                    touch();
                  }}
                >
                  Negative
                </Chip>
              </div>
            </div>
          </TabsSubtlePanel>

          <TabsSubtlePanel selectedIndex={tab} index={2} idPrefix={idPrefix}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Toggle
                label="Track"
                checked={track}
                onChange={(v) => {
                  setTrack(v);
                  touch();
                }}
              />
              <Toggle
                label="Links"
                checked={links}
                onChange={(v) => {
                  setLinks(v);
                  touch();
                }}
              />
              <Toggle
                label="Scan"
                checked={scan}
                onChange={(v) => {
                  setScan(v);
                  touch();
                }}
              />
              <Toggle
                label="Trails"
                checked={trails}
                onChange={(v) => {
                  setTrails(v);
                  touch();
                }}
              />
              <Toggle
                label="Marks"
                checked={marks}
                onChange={(v) => {
                  setMarks(v);
                  touch();
                }}
              />
              <div className="flex flex-wrap items-center gap-1">
                <Chip
                  active={trackers === "sparse"}
                  onClick={() => {
                    setTrackers("sparse");
                    touch();
                  }}
                >
                  Sparse
                </Chip>
                <Chip
                  active={trackers === "dense"}
                  onClick={() => {
                    setTrackers("dense");
                    touch();
                  }}
                >
                  Dense
                </Chip>
              </div>
            </div>
          </TabsSubtlePanel>

          <TabsSubtlePanel selectedIndex={tab} index={3} idPrefix={idPrefix}>
            <div className="grid gap-x-5 gap-y-4 lg:grid-cols-2">
              <div className="flex flex-wrap gap-2">
                {LIGHTS.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    title={swatch.name}
                    onClick={() => {
                      setLightColor(swatch.hex);
                      setLightNonce((n) => n + 1);
                      touch();
                    }}
                    style={{ background: swatch.hex }}
                    className={`size-8 rounded-full ring-1 ring-black/20 ${
                      lightColor.toLowerCase() === swatch.hex
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                  />
                ))}
              </div>
              <div className="grid content-start gap-3">
                <StudioColor
                  label="Light"
                  value={lightColor}
                  onChange={(hex) => {
                    setLightColor(hex);
                    touch();
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setLightNonce((n) => n + 1);
                    touch();
                  }}
                  className="h-10 rounded-md border text-xs tracking-[0.16em] uppercase"
                >
                  Fire
                </button>
              </div>
            </div>
          </TabsSubtlePanel>

          <TabsSubtlePanel selectedIndex={tab} index={4} idPrefix={idPrefix}>
            <div className="flex flex-wrap gap-2">
              <Chip
                active={paper === "dark"}
                onClick={() => {
                  setPaper("dark");
                  touch();
                }}
              >
                Dark
              </Chip>
              <Chip
                active={paper === "light"}
                onClick={() => {
                  setPaper("light");
                  touch();
                }}
              >
                Light
              </Chip>
              <Chip
                active={tone === "negative"}
                onClick={() => {
                  setTone("negative");
                  touch();
                }}
              >
                Negative
              </Chip>
              <Chip
                active={tone === "true"}
                onClick={() => {
                  setTone("true");
                  touch();
                }}
              >
                True
              </Chip>
            </div>
          </TabsSubtlePanel>

          <TabsSubtlePanel selectedIndex={tab} index={5} idPrefix={idPrefix}>
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIndex((index + 1) % plates.length);
                    touch();
                  }}
                  className="h-9 rounded-md border px-3 text-xs"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="h-9 rounded-md border px-3 text-xs"
                >
                  Add picture
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {COUNTS.map((count) => (
                  <Chip
                    key={count}
                    active={pointCount === count}
                    onClick={() => {
                      setPointCount(count);
                      touch();
                    }}
                  >
                    {count === 0 ? "Auto" : count.toLocaleString("en-US")}
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {plates.map((id, i) => {
                  const name = isPlateId(id)
                    ? PLATE_LABELS[id]
                    : `Picture ${i + 1}`;
                  return (
                    <div key={id} className="flex items-center gap-1">
                      <Chip
                        active={index === i}
                        onClick={() => {
                          setIndex(i);
                          touch();
                        }}
                      >
                        {name}
                      </Chip>
                      <button
                        type="button"
                        aria-label={`Remove ${name}`}
                        onClick={() => removePlate(i)}
                        className="px-1 text-xs text-muted-foreground"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsSubtlePanel>
        </div>
      </aside>
    </div>
  );
}
