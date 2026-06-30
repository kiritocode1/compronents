"use client";

import * as React from "react";

type ColorSpace = "hsb" | "hsl" | "rgb";
type ColorChannel =
  | "hue"
  | "saturation"
  | "brightness"
  | "lightness"
  | "red"
  | "green"
  | "blue"
  | "alpha";
type ColorValue = {
  h: number;
  s: number;
  b: number;
  a: number;
  toString: (format?: "hex" | "css" | "hsl" | "hsb" | "rgb") => string;
  toFormat: (format: string) => ColorValue;
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hsbToRgb(h: number, s: number, b: number) {
  s /= 100;
  b /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) =>
    b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return {
    r: Math.round(255 * f(5)),
    g: Math.round(255 * f(3)),
    b: Math.round(255 * f(1)),
  };
}

function rgbToHsb(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  return {
    h: (h + 360) % 360,
    s: max === 0 ? 0 : (delta / max) * 100,
    b: max * 100,
  };
}

function hslToHsb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const bright = l + s * Math.min(l, 1 - l);
  const sat = bright === 0 ? 0 : 2 * (1 - l / bright);
  return { h, s: sat * 100, b: bright * 100 };
}

function hsbToHsl(color: Pick<ColorValue, "h" | "s" | "b">) {
  const s = color.s / 100;
  const b = color.b / 100;
  const l = b * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l);
  return { h: color.h, s: sl * 100, l: l * 100 };
}

function makeColor(raw: {
  h: number;
  s: number;
  b: number;
  a?: number;
}): ColorValue {
  const color = {
    h: ((raw.h % 360) + 360) % 360,
    s: clamp(raw.s, 0, 100),
    b: clamp(raw.b, 0, 100),
    a: clamp(raw.a ?? 1, 0, 1),
  };
  return {
    ...color,
    toFormat: () => makeColor(color),
    toString: (format = "hex") => {
      const rgb = hsbToRgb(color.h, color.s, color.b);
      if (format === "rgb") return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      if (format === "hsl") {
        const hsl = hsbToHsl(color);
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      }
      if (format === "hsb")
        return `hsb(${Math.round(color.h)}, ${Math.round(color.s)}%, ${Math.round(color.b)}%)`;
      if (format === "css")
        return color.a < 1
          ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${color.a.toFixed(2)})`
          : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      return `#${[rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
    },
  };
}

export function parseColor(input: string | ColorValue): ColorValue {
  if (typeof input !== "string") return makeColor(input);
  const value = input.trim();
  const hex = value.match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i);
  if (hex) {
    const full =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((x) => x + x)
            .join("")
        : hex[1];
    return makeColor(
      rgbToHsb(
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
      ),
    );
  }
  const hsl = value.match(
    /^hsla?\(([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?(?:,\s*([\d.]+))?\)$/i,
  );
  if (hsl)
    return makeColor({
      ...hslToHsb(Number(hsl[1]), Number(hsl[2]), Number(hsl[3])),
      a: hsl[4] ? Number(hsl[4]) : 1,
    });
  const rgb = value.match(
    /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/i,
  );
  if (rgb)
    return makeColor({
      ...rgbToHsb(Number(rgb[1]), Number(rgb[2]), Number(rgb[3])),
      a: rgb[4] ? Number(rgb[4]) : 1,
    });
  return makeColor({ h: 208, s: 98, b: 97 });
}

type PickerContextValue = {
  color: ColorValue;
  setColor: (color: ColorValue) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PickerContext = React.createContext<PickerContextValue | null>(null);

function usePicker() {
  const context = React.useContext(PickerContext);
  if (!context)
    throw new Error(
      "ColorPicker subcomponents must be used inside ColorPicker",
    );
  return context;
}

function ColorPickerStyles() {
  return (
    <style>{`
      .color-picker{position:relative;display:inline-flex}
      .color-picker__trigger{display:inline-flex;align-items:center;gap:.75rem;border-radius:.5rem;color:hsl(var(--foreground,240 10% 3.9%));font-size:.875rem;line-height:1.25rem;outline:none;transition:background-color 150ms cubic-bezier(.4,0,.2,1),box-shadow 150ms ease-out;cursor:pointer}
      .color-picker__trigger[data-focus-visible=true]{box-shadow:0 0 0 2px hsl(var(--ring,240 5% 65%) / .55)}
      .color-picker__popover{position:absolute;left:50%;top:calc(100% + .5rem);z-index:50;display:flex;min-width:15.5rem;max-width:15.5rem;flex-direction:column;gap:.75rem;overflow:hidden;border-radius:min(32px,1.25rem);background:hsl(var(--popover,0 0% 100%));padding:.5rem .5rem .75rem;box-shadow:0 18px 55px rgba(0,0,0,.18),0 4px 18px rgba(0,0,0,.08);transform:translateX(-50%);transform-origin:top center;animation:color-picker-in 150ms cubic-bezier(.16,1,.3,1)}
      @keyframes color-picker-in{from{opacity:0;transform:translate(-50%,-4px) scale(.95)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
      .dark .color-picker__popover{background:hsl(var(--popover,240 10% 3.9%));box-shadow:0 18px 55px rgba(0,0,0,.48),0 4px 18px rgba(0,0,0,.22)}
      .color-swatch{display:inline-block;flex:none;border:1px solid rgba(0,0,0,.12);background:var(--swatch-color);box-shadow:inset 0 0 0 1px rgba(255,255,255,.26)}
      .color-swatch--xs{width:1rem;height:1rem}.color-swatch--sm{width:1.5rem;height:1.5rem}.color-swatch--lg{width:2rem;height:2rem}
      .color-area{position:relative;width:100%;aspect-ratio:1/1;border-radius:1rem;background:var(--area-bg);box-shadow:inset 0 0 0 1px rgba(0,0,0,.10);touch-action:none;outline:none}
      .color-area__thumb{position:absolute;left:calc(var(--x)*1%);top:calc(var(--top)*1%);width:1rem;height:1rem;transform:translate(-50%,-50%);border:3px solid white;border-radius:.75rem;background:var(--thumb-color);box-shadow:0 0 0 1px rgba(0,0,0,.14),inset 0 0 0 1px rgba(0,0,0,.12);transition:width 150ms ease-out,height 150ms ease-out}
      .color-area__thumb[data-dragging=true]{width:1.25rem;height:1.25rem}
      .color-area__thumb[data-focus-visible=true],.color-slider__thumb[data-focus-visible=true]{outline:2px solid hsl(var(--ring,240 5% 65%));outline-offset:2px}
      .color-slider{display:grid;grid-template-columns:1fr auto;gap:.25rem .5rem;align-items:center;color:hsl(var(--foreground,240 10% 3.9%));font-size:.875rem}
      .color-slider__output{color:hsl(var(--muted-foreground,240 3.8% 46.1%));font-size:.875rem}
      .color-slider__track{grid-column:1/-1;position:relative;height:.75rem;border-radius:9999px;background:var(--track-bg);box-shadow:inset 0 0 0 1px rgba(0,0,0,.1);touch-action:none}
      .color-slider__thumb{position:absolute;left:calc(var(--percent)*1%);top:50%;width:1rem;height:1rem;transform:translate(-50%,-50%);border:3px solid white;border-radius:9999px;background:var(--thumb-color);box-shadow:0 0 0 1px rgba(0,0,0,.14),inset 0 0 0 1px rgba(0,0,0,.12);outline:none;transition:width 150ms ease-out,height 150ms ease-out}
      .color-slider__thumb[data-dragging=true]{width:1.25rem;height:1.25rem}
      .label{font-size:.875rem;line-height:1.25rem;font-weight:500;color:hsl(var(--foreground,240 10% 3.9%))}
      .text-muted{color:hsl(var(--muted-foreground,240 3.8% 46.1%))}
      .color-field__group{display:flex;height:2.5rem;align-items:center;overflow:hidden;border:1px solid hsl(var(--border,240 5.9% 90%));border-radius:.75rem;background:hsl(var(--background,0 0% 100%));box-shadow:0 1px 2px rgba(0,0,0,.04)}
      .color-field__prefix{display:flex;align-items:center;padding-left:.75rem}.color-field__input{min-width:0;width:100%;height:100%;border:0;background:transparent;padding:0 .75rem;color:hsl(var(--foreground,240 10% 3.9%));font-size:.875rem;outline:none}
      .swatch-picker{display:flex;flex-wrap:wrap;gap:.375rem}.swatch-picker__item{display:inline-flex;border:0;background:transparent;padding:.125rem;border-radius:.5rem;cursor:pointer;outline:none}.swatch-picker__item[data-selected=true]{box-shadow:0 0 0 2px hsl(var(--ring,240 5% 65%) / .55)}
      .select{position:relative}.select__trigger{display:flex;width:100%;height:2.5rem;align-items:center;justify-content:space-between;border:1px solid hsl(var(--border,240 5.9% 90%));border-radius:.75rem;background:hsl(var(--background,0 0% 100%));padding:0 .75rem;color:hsl(var(--foreground,240 10% 3.9%));font-size:.875rem;box-shadow:0 1px 2px rgba(0,0,0,.04);cursor:pointer}.select__popover{position:absolute;left:0;right:0;top:calc(100% + .25rem);z-index:80;border-radius:.75rem;background:hsl(var(--popover,0 0% 100%));padding:.25rem;box-shadow:0 14px 35px rgba(0,0,0,.16)}.listbox__item{display:flex;align-items:center;justify-content:space-between;border-radius:.5rem;padding:.45rem .6rem;font-size:.875rem;cursor:pointer}.listbox__item:hover{background:hsl(var(--muted,240 4.8% 95.9%))}
      .icon-button{display:inline-flex;width:2rem;height:2rem;align-items:center;justify-content:center;border:0;border-radius:.65rem;background:hsl(var(--muted,240 4.8% 95.9%));color:hsl(var(--foreground,240 10% 3.9%));cursor:pointer;transition:transform 120ms ease,background-color 150ms ease}.icon-button:active{transform:scale(.96)}
      .dark .label,.dark .color-picker__trigger,.dark .color-slider,.dark .color-field__input,.dark .select__trigger,.dark .icon-button{color:hsl(var(--foreground,0 0% 98%))}
      .dark .text-muted,.dark .color-slider__output{color:hsl(var(--muted-foreground,240 5% 64.9%))}
      .dark .color-field__group,.dark .select__trigger{border-color:hsl(var(--border,240 3.7% 15.9%));background:hsl(var(--background,240 10% 3.9%))}
      .dark .select__popover{background:hsl(var(--popover,240 10% 3.9%))}.dark .listbox__item:hover,.dark .icon-button{background:hsl(var(--muted,240 3.7% 15.9%))}
    `}</style>
  );
}

function ColorPickerRoot({
  children,
  className,
  defaultValue = "#0485F7",
  value,
  onChange,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string | ColorValue;
  value?: string | ColorValue;
  onChange?: (color: ColorValue) => void;
  defaultOpen?: boolean;
}) {
  const [internalColor, setInternalColor] = React.useState(() =>
    parseColor(defaultValue),
  );
  const [open, setOpen] = React.useState(defaultOpen);
  const color = value === undefined ? internalColor : parseColor(value);
  const setColor = React.useCallback(
    (next: ColorValue) => {
      setInternalColor(next);
      onChange?.(next);
    },
    [onChange],
  );
  return (
    <PickerContext.Provider value={{ color, setColor, open, setOpen }}>
      <ColorPickerStyles />
      <div className={cn("color-picker", className)} data-slot="color-picker">
        {children}
      </div>
    </PickerContext.Provider>
  );
}

function ColorPickerTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = usePicker();
  const [focusVisible, setFocusVisible] = React.useState(false);
  return (
    <button
      type="button"
      className={cn("color-picker__trigger", className)}
      aria-expanded={open}
      data-focus-visible={focusVisible || undefined}
      data-slot="color-picker-trigger"
      onClick={(event) => {
        props.onClick?.(event);
        setOpen(!open);
      }}
      onBlur={() => setFocusVisible(false)}
      onKeyDown={(event) => {
        if (event.key === "Tab") setFocusVisible(true);
        props.onKeyDown?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function ColorPickerPopover({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = usePicker();
  if (!open) return null;
  return (
    <div
      className={cn("color-picker__popover", className)}
      data-slot="color-picker-popover"
      {...props}
    >
      {children}
    </div>
  );
}

function channelValue(color: ColorValue, channel: ColorChannel) {
  const hsl = hsbToHsl(color);
  const rgb = hsbToRgb(color.h, color.s, color.b);
  if (channel === "hue") return color.h;
  if (channel === "saturation") return color.s;
  if (channel === "brightness") return color.b;
  if (channel === "lightness") return hsl.l;
  if (channel === "red") return rgb.r;
  if (channel === "green") return rgb.g;
  if (channel === "blue") return rgb.b;
  return color.a;
}

function updateChannel(
  color: ColorValue,
  channel: ColorChannel,
  value: number,
  colorSpace: ColorSpace = "hsb",
) {
  if (channel === "hue") return makeColor({ ...color, h: value });
  if (channel === "saturation" && colorSpace === "hsl") {
    const hsl = hsbToHsl(color);
    return makeColor({ ...hslToHsb(hsl.h, value, hsl.l), a: color.a });
  }
  if (channel === "lightness") {
    const hsl = hsbToHsl(color);
    return makeColor({ ...hslToHsb(hsl.h, hsl.s, value), a: color.a });
  }
  if (channel === "brightness") return makeColor({ ...color, b: value });
  if (channel === "saturation") return makeColor({ ...color, s: value });
  if (channel === "alpha") return makeColor({ ...color, a: value });
  const rgb = hsbToRgb(color.h, color.s, color.b);
  const next = { ...rgb, [channel[0]]: value } as {
    r: number;
    g: number;
    b: number;
  };
  return makeColor({ ...rgbToHsb(next.r, next.g, next.b), a: color.a });
}

function areaBackground(color: ColorValue) {
  const hue = `hsl(${color.h} 100% 50%)`;
  return `linear-gradient(to top, black, transparent), linear-gradient(to right, white, ${hue})`;
}

function ColorAreaRoot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  colorSpace?: ColorSpace;
  xChannel?: ColorChannel;
  yChannel?: ColorChannel;
}) {
  const { color, setColor } = usePicker();
  const [dragging, setDragging] = React.useState(false);
  const [focusVisible, setFocusVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const updateFromPoint = React.useCallback(
    (clientX: number, clientY: number) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const s = clamp(((clientX - box.left) / box.width) * 100, 0, 100);
      const b = clamp(100 - ((clientY - box.top) / box.height) * 100, 0, 100);
      setColor(makeColor({ ...color, s, b }));
    },
    [color, setColor],
  );
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={props["aria-label"] || "Color area"}
      aria-valuenow={Math.round(color.s)}
      className={cn("color-area", className)}
      data-slot="color-area"
      style={
        {
          "--area-bg": areaBackground(color),
          "--x": color.s,
          "--top": 100 - color.b,
        } as React.CSSProperties
      }
      onPointerDown={(event) => {
        setDragging(true);
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        updateFromPoint(event.clientX, event.clientY);
      }}
      onPointerMove={(event) =>
        dragging && updateFromPoint(event.clientX, event.clientY)
      }
      onPointerUp={() => setDragging(false)}
      onFocus={() => setFocusVisible(true)}
      onBlur={() => setFocusVisible(false)}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 10 : 1;
        if (event.key === "ArrowRight")
          setColor(makeColor({ ...color, s: color.s + step }));
        if (event.key === "ArrowLeft")
          setColor(makeColor({ ...color, s: color.s - step }));
        if (event.key === "ArrowUp")
          setColor(makeColor({ ...color, b: color.b + step }));
        if (event.key === "ArrowDown")
          setColor(makeColor({ ...color, b: color.b - step }));
      }}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              dragging,
              focusVisible,
            })
          : child,
      )}
    </div>
  );
}

function ColorAreaThumb({
  dragging,
  focusVisible,
}: {
  dragging?: boolean;
  focusVisible?: boolean;
}) {
  const { color } = usePicker();
  return (
    <div
      className="color-area__thumb"
      data-dragging={dragging || undefined}
      data-focus-visible={focusVisible || undefined}
      data-slot="color-area-thumb"
      style={{ "--thumb-color": color.toString("css") } as React.CSSProperties}
    />
  );
}

function rangeFor(channel: ColorChannel) {
  if (channel === "hue") return 360;
  if (channel === "alpha") return 1;
  if (["red", "green", "blue"].includes(channel)) return 255;
  return 100;
}

function trackBackground(color: ColorValue, channel: ColorChannel) {
  const h = color.h;
  if (channel === "hue")
    return "linear-gradient(to right, rgb(255,0,0), rgb(255,255,0), rgb(0,255,0), rgb(0,255,255), rgb(0,0,255), rgb(255,0,255), rgb(255,0,0))";
  if (channel === "alpha")
    return `linear-gradient(to right, transparent, ${color.toString("css")})`;
  if (channel === "saturation")
    return `linear-gradient(to right, hsl(${h} 0% 50%), hsl(${h} 100% 50%))`;
  if (channel === "lightness")
    return `linear-gradient(to right, black, hsl(${h} ${Math.round(color.s)}% 50%), white)`;
  if (channel === "brightness")
    return `linear-gradient(to right, black, hsl(${h} ${Math.round(color.s)}% 50%))`;
  return `linear-gradient(to right, rgb(${channel === "red" ? 0 : hsbToRgb(h, color.s, color.b).r}, ${channel === "green" ? 0 : hsbToRgb(h, color.s, color.b).g}, ${channel === "blue" ? 0 : hsbToRgb(h, color.s, color.b).b}), rgb(${channel === "red" ? 255 : hsbToRgb(h, color.s, color.b).r}, ${channel === "green" ? 255 : hsbToRgb(h, color.s, color.b).g}, ${channel === "blue" ? 255 : hsbToRgb(h, color.s, color.b).b}))`;
}

const SliderContext = React.createContext<{
  channel: ColorChannel;
  colorSpace: ColorSpace;
  dragging: boolean;
  setDragging: (value: boolean) => void;
} | null>(null);

function ColorSliderRoot({
  children,
  channel,
  colorSpace = "hsb",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  channel: ColorChannel;
  colorSpace?: ColorSpace;
}) {
  const [dragging, setDragging] = React.useState(false);
  return (
    <SliderContext.Provider
      value={{ channel, colorSpace, dragging, setDragging }}
    >
      <div
        className={cn("color-slider", className)}
        data-slot="color-slider"
        {...props}
      >
        {children}
      </div>
    </SliderContext.Provider>
  );
}

function ColorSliderOutput({ className }: { className?: string }) {
  const { color } = usePicker();
  const ctx = React.useContext(SliderContext)!;
  const value = channelValue(color, ctx.channel);
  const suffix =
    ctx.channel === "hue" ? "°" : ctx.channel === "alpha" ? "%" : "%";
  const shown =
    ctx.channel === "alpha" ? Math.round(value * 100) : Math.round(value);
  return (
    <span className={cn("color-slider__output", className)}>
      {shown}
      {suffix}
    </span>
  );
}

function ColorSliderTrack({ children }: { children: React.ReactNode }) {
  const { color, setColor } = usePicker();
  const ctx = React.useContext(SliderContext)!;
  const ref = React.useRef<HTMLDivElement>(null);
  const max = rangeFor(ctx.channel);
  const value = channelValue(color, ctx.channel);
  const update = React.useCallback(
    (clientX: number) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const next = clamp(((clientX - box.left) / box.width) * max, 0, max);
      setColor(updateChannel(color, ctx.channel, next, ctx.colorSpace));
    },
    [color, ctx.channel, ctx.colorSpace, max, setColor],
  );
  return (
    <div
      ref={ref}
      className="color-slider__track"
      data-slot="color-slider-track"
      style={
        {
          "--track-bg": trackBackground(color, ctx.channel),
          "--percent": (value / max) * 100,
        } as React.CSSProperties
      }
      onPointerDown={(event) => {
        ctx.setDragging(true);
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        update(event.clientX);
      }}
      onPointerMove={(event) => ctx.dragging && update(event.clientX)}
      onPointerUp={() => ctx.setDragging(false)}
    >
      {children}
    </div>
  );
}

function ColorSliderThumb() {
  const { color, setColor } = usePicker();
  const ctx = React.useContext(SliderContext)!;
  const max = rangeFor(ctx.channel);
  const value = channelValue(color, ctx.channel);
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={ctx.channel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className="color-slider__thumb"
      data-dragging={ctx.dragging || undefined}
      data-slot="color-slider-thumb"
      style={
        {
          "--percent": (value / max) * 100,
          "--thumb-color": color.toString("css"),
        } as React.CSSProperties
      }
      onKeyDown={(event) => {
        const step = event.shiftKey ? 10 : ctx.channel === "alpha" ? 0.05 : 1;
        if (event.key === "ArrowRight" || event.key === "ArrowUp")
          setColor(
            updateChannel(color, ctx.channel, value + step, ctx.colorSpace),
          );
        if (event.key === "ArrowLeft" || event.key === "ArrowDown")
          setColor(
            updateChannel(color, ctx.channel, value - step, ctx.colorSpace),
          );
      }}
    />
  );
}

function ColorSwatch({
  color,
  size = "sm",
  className,
}: {
  color?: string | ColorValue;
  size?: "xs" | "sm" | "lg";
  className?: string;
}) {
  const picker = React.useContext(PickerContext);
  const value = color
    ? parseColor(color)
    : (picker?.color ?? parseColor("#0485F7"));
  return (
    <span
      className={cn("color-swatch", `color-swatch--${size}`, className)}
      data-slot="color-swatch"
      style={
        {
          "--swatch-color": value.toString("css"),
          borderRadius: size === "xs" ? ".375rem" : ".6rem",
        } as React.CSSProperties
      }
    />
  );
}

function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("label", className)} data-slot="label" {...props} />
  );
}

function ColorFieldRoot({
  children,
  channel,
  colorSpace = "hsl",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  channel?: ColorChannel;
  colorSpace?: ColorSpace;
}) {
  return (
    <div
      data-channel={channel}
      data-color-space={colorSpace}
      data-slot="color-field"
      {...props}
    >
      {children}
    </div>
  );
}

function ColorFieldGroup({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement> & { variant?: string }) {
  return <div className={cn("color-field__group", className)}>{children}</div>;
}

function ColorFieldInput({
  "aria-label": ariaLabel,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const { color, setColor } = usePicker();
  const parent = React.useRef<HTMLInputElement>(null);
  const [text, setText] = React.useState(color.toString("hex"));
  React.useEffect(
    () => setText(color.toString("hex")),
    [color.h, color.s, color.b, color.a],
  );
  return (
    <input
      ref={parent}
      className="color-field__input"
      aria-label={ariaLabel || "Color field"}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        if (/^#?[a-f\d]{6}$/i.test(event.target.value.trim()))
          setColor(parseColor(event.target.value));
      }}
      {...props}
    />
  );
}

function ColorFieldPrefix(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="color-field__prefix" {...props} />;
}

function ColorSwatchPickerRoot({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement> & { size?: string }) {
  return (
    <div
      className={cn("swatch-picker", className)}
      data-slot="color-swatch-picker"
    >
      {children}
    </div>
  );
}

function ColorSwatchPickerItem({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  const { color: selected, setColor } = usePicker();
  const parsed = parseColor(color);
  const isSelected = selected.toString("hex") === parsed.toString("hex");
  return (
    <button
      type="button"
      className="swatch-picker__item"
      data-selected={isSelected || undefined}
      onClick={() => setColor(parsed)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { color })
          : child,
      )}
    </button>
  );
}

function ColorSwatchPickerSwatch({ color }: { color?: string }) {
  return <ColorSwatch color={color} size="xs" />;
}

const SelectContext = React.createContext<{
  value: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
} | null>(null);

function SelectRoot({
  children,
  value = "hsl",
  onChange,
  className,
}: {
  children: React.ReactNode;
  value?: string;
  variant?: string;
  onChange?: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const setValue = (next: string) => {
    onChange?.(next);
    setOpen(false);
  };
  return (
    <SelectContext.Provider value={{ value, setValue, open, setOpen }}>
      <div className={cn("select", className)}>{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext)!;
  return (
    <button
      type="button"
      className="select__trigger"
      onClick={() => ctx.setOpen(!ctx.open)}
    >
      {children}
    </button>
  );
}

function SelectValue({ className }: { className?: string }) {
  const ctx = React.useContext(SelectContext)!;
  return <span className={className}>{ctx.value}</span>;
}

function SelectIndicator() {
  return <span aria-hidden>⌄</span>;
}

function SelectPopover({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext)!;
  return ctx.open ? <div className="select__popover">{children}</div> : null;
}

function ListBoxRoot({ children }: { children: React.ReactNode }) {
  return <div role="listbox">{children}</div>;
}

function ListBoxItem({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id: string;
  textValue?: string;
  className?: string;
}) {
  const ctx = React.useContext(SelectContext)!;
  return (
    <div
      role="option"
      className={cn("listbox__item", className)}
      onClick={() => ctx.setValue(id)}
    >
      {children}
    </div>
  );
}

function ListBoxItemIndicator() {
  return <span aria-hidden>✓</span>;
}

function Button({
  children,
  onPress,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isIconOnly?: boolean;
  size?: string;
  variant?: string;
  onPress?: () => void;
}) {
  return (
    <button type="button" className="icon-button" onClick={onPress} {...props}>
      {children}
    </button>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 4h2.2c1.2 0 2 .7 2.8 2l2 4c.7 1.3 1.6 2 2.8 2H14" />
      <path d="M12 10l2 2-2 2" />
      <path d="M2 12h2.2c1.2 0 2-.7 2.8-2l.4-.8" />
      <path d="M12 2l2 2-2 2" />
      <path d="M9.4 5.2c.7-.8 1.4-1.2 2.4-1.2H14" />
    </svg>
  );
}

export const ColorPicker = Object.assign(ColorPickerRoot, {
  Trigger: ColorPickerTrigger,
  Popover: ColorPickerPopover,
});
export const ColorArea = Object.assign(ColorAreaRoot, {
  Thumb: ColorAreaThumb,
});
export const ColorSlider = Object.assign(ColorSliderRoot, {
  Output: ColorSliderOutput,
  Track: ColorSliderTrack,
  Thumb: ColorSliderThumb,
});
export const ColorField = Object.assign(ColorFieldRoot, {
  Group: ColorFieldGroup,
  Prefix: ColorFieldPrefix,
  Input: ColorFieldInput,
});
export const ColorSwatchPicker = Object.assign(ColorSwatchPickerRoot, {
  Item: ColorSwatchPickerItem,
  Swatch: ColorSwatchPickerSwatch,
});
export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Value: SelectValue,
  Indicator: SelectIndicator,
  Popover: SelectPopover,
});
export const ListBox = Object.assign(ListBoxRoot, {
  Item: Object.assign(ListBoxItem, { Indicator: ListBoxItemIndicator }),
  ItemIndicator: ListBoxItemIndicator,
});
export { Button, ColorSwatch, Label, ShuffleIcon };
export type { ColorChannel, ColorSpace, ColorValue };
