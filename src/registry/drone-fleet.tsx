"use client";

/**
 * Drone Fleet - a flock of crosshair drones steering by the classic boids
 * rules (separation, alignment, cohesion) plus a wander term. The pointer is an
 * attractor the flock chases; clicking queues waypoints the flock flies to in
 * order before returning to free roam. Neighbours within mesh range are linked
 * with dashed lines, and a HUD reads out live flock telemetry.
 *
 * Scoped to its own container (works inside a bounded stage, not just full
 * window). Fills its container.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef, useState } from "react";

interface Drone {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotor: number;
  speed: number;
  wanderAngle: number;
  wanderJitter: number;
  agility: number;
}

interface Waypoint {
  x: number;
  y: number;
}

interface FrameState {
  drones: { d: string; opacity: number }[];
  mesh: string;
  centroid: { cx: number; cy: number; r: number };
  cursor: { x: number; y: number; on: boolean };
  waypoints: Waypoint[];
  activeWaypoint: number;
  hud: { drn: number; spr: number; spd: string; lnk: number; wpt: string };
}

const EMPTY: FrameState = {
  drones: [],
  mesh: "",
  centroid: { cx: 0, cy: 0, r: 0 },
  cursor: { x: 0, y: 0, on: false },
  waypoints: [],
  activeWaypoint: 0,
  hud: { drn: 0, spr: 0, spd: "0.00", lnk: 0, wpt: "---" },
};

const OFF = -9999;
const MESH_R2 = 260 * 260;

// oriented crosshair glyph: a longer arm along heading + wings across it
function droneGlyph(d: Drone): string {
  const a = Math.atan2(d.vy, d.vx);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const p = (fwd: number, side: number) =>
    `${(d.x + c * fwd - s * side).toFixed(1)},${(d.y + s * fwd + c * side).toFixed(1)}`;
  return `M${p(-6.4, 0)}L${p(11.2, 0)}M${p(-0.8, 9.6)}L${p(-0.8, -9.6)}`;
}

export interface DroneFleetProps {
  /** Override the drone count (defaults to 12, or 6 on narrow screens). */
  count?: number;
}

export default function DroneFleet({ count }: DroneFleetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [frame, setFrame] = useState<FrameState>(EMPTY);

  const raw = useRef({ x: OFF, y: OFF });
  const smooth = useRef({ x: OFF, y: OFF });
  const target = useRef({ x: 0, y: 0, attract: 0.003 });
  const drones = useRef<Drone[]>([]);
  const waypoints = useRef<Waypoint[]>([]);
  const wpIndex = useRef(0);
  const mode = useRef<"mouse" | "waypoints">("mouse");
  const time = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () =>
      setSize({ w: root.clientWidth, h: root.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // pointer + click (root-relative)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rel = (cx: number, cy: number) => {
      const rect = root.getBoundingClientRect();
      return { x: cx - rect.left, y: cy - rect.top };
    };
    const onMove = (e: MouseEvent) => {
      raw.current = rel(e.clientX, e.clientY);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) raw.current = rel(t.clientX, t.clientY);
    };
    const onLeave = () => {
      raw.current = { x: OFF, y: OFF };
    };
    const onClick = (e: MouseEvent) => {
      waypoints.current = [...waypoints.current, rel(e.clientX, e.clientY)];
      if (mode.current === "mouse") {
        mode.current = "waypoints";
        wpIndex.current = 0;
      }
    };
    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("touchmove", onTouch, { passive: true });
    root.addEventListener("touchend", onLeave);
    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("touchmove", onTouch);
      root.removeEventListener("touchend", onLeave);
      root.removeEventListener("click", onClick);
    };
  }, []);

  // (re)seed the flock whenever the stage resizes
  useEffect(() => {
    const { w, h } = size;
    if (!w || !h) return;
    const n = count ?? (w < 768 ? 6 : 12);
    drones.current = Array.from({ length: n }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.7 + 0.9 * Math.random();
      return {
        x: 0.1 * w + Math.random() * w * 0.8,
        y: 0.1 * h + Math.random() * h * 0.8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotor: (i / n) * Math.PI * 2,
        speed,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderJitter: 0.12 * (0.5 + Math.random()),
        agility: 0.12 * (0.6 + 0.8 * Math.random()),
      };
    });
    waypoints.current = [];
    wpIndex.current = 0;
    mode.current = "mouse";
    smooth.current = { x: w / 2, y: h / 2 };
    target.current = { x: w / 2, y: h / 2, attract: 0.003 };
  }, [size, count]);

  useEffect(() => {
    const { w, h } = size;
    if (!w || !h) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      time.current += 1 / 60;
      const t = time.current;

      // smoothed cursor, then choose a target: waypoint > cursor > center
      const cursorOn = raw.current.x > OFF + 1000;
      smooth.current = {
        x: smooth.current.x + (raw.current.x - smooth.current.x) * 0.05,
        y: smooth.current.y + (raw.current.y - smooth.current.y) * 0.05,
      };
      const wps = waypoints.current;
      const wi = wpIndex.current;
      let tx: number;
      let ty: number;
      let attract: number;
      if (mode.current === "waypoints" && wps.length > 0 && wi < wps.length) {
        tx = wps[wi].x;
        ty = wps[wi].y;
        attract = 0.006;
      } else if (cursorOn) {
        tx = smooth.current.x;
        ty = smooth.current.y;
        attract = 0.003;
      } else {
        tx = w / 2;
        ty = h / 2;
        attract = 0.0009;
      }
      const q = target.current;
      q.x += (tx - q.x) * 0.035;
      q.y += (ty - q.y) * 0.035;
      q.attract += (attract - q.attract) * 0.035;

      const flock = drones.current;
      drones.current = flock.map((o) => {
        let sx = 0;
        let sy = 0;
        let cohX = 0;
        let cohY = 0;
        let aliX = 0;
        let aliY = 0;
        let sepX = 0;
        let sepY = 0;
        let neighbors = 0;
        for (const other of flock) {
          if (other === o) continue;
          const dx = other.x - o.x;
          const dy = other.y - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 512) {
            cohX += other.x;
            cohY += other.y;
            aliX += other.vx;
            aliY += other.vy;
            neighbors++;
            if (dist < 24) {
              sepX -= dx / (dist + 0.1);
              sepY -= dy / (dist + 0.1);
            }
          }
        }
        if (neighbors > 0) {
          sx += (cohX / neighbors - o.x) * 0.001;
          sy += (cohY / neighbors - o.y) * 0.001;
          sx += (aliX / neighbors - o.vx) * 0.035;
          sy += (aliY / neighbors - o.vy) * 0.035;
        }
        sx += 0.08 * sepX;
        sy += 0.08 * sepY;
        const wander =
          o.wanderAngle + (Math.random() - 0.5) * 2 * o.wanderJitter;
        sx += 0.16 * Math.cos(wander);
        sy += 0.16 * Math.sin(wander);
        sx += (q.x - o.x) * q.attract;
        sy += (q.y - o.y) * q.attract;
        if (o.x < 190) sx += 0.01;
        if (o.x > w - 190) sx -= 0.01;
        if (o.y < 190) sy += 0.01;
        if (o.y > h - 190) sy -= 0.01;

        // damped acceleration, then turn-rate-limited steering
        const gx = (o.vx + sx) * 0.97;
        const gy = (o.vy + sy) * 0.97;
        const desired = Math.atan2(gy, gx);
        const mag = Math.sqrt(gx * gx + gy * gy);
        const heading = Math.atan2(o.vy, o.vx);
        const spd = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
        let delta = desired - heading;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;
        const nextHeading =
          heading + Math.max(-o.agility, Math.min(o.agility, delta));
        const maxSpeed = 1.7 * o.speed;
        const nextSpeed =
          spd + (Math.max(0.4 * o.speed, Math.min(maxSpeed, mag)) - spd) * 0.08;
        const vx = Math.cos(nextHeading) * nextSpeed;
        const vy = Math.sin(nextHeading) * nextSpeed;
        return {
          ...o,
          x: o.x + vx,
          y: o.y + vy,
          vx,
          vy,
          wanderAngle: wander,
        };
      });

      const next = drones.current;
      const cx = next.reduce((a, d) => a + d.x, 0) / next.length;
      const cy = next.reduce((a, d) => a + d.y, 0) / next.length;
      const spread = Math.sqrt(
        next.reduce((a, d) => a + (d.x - cx) ** 2 + (d.y - cy) ** 2, 0) /
          next.length,
      );
      const avgSpd =
        next.reduce((a, d) => a + Math.sqrt(d.vx * d.vx + d.vy * d.vy), 0) /
        next.length;

      // mesh links between drones within range
      let mesh = "";
      let links = 0;
      for (let i = 0; i < next.length; i++) {
        for (let j = i + 1; j < next.length; j++) {
          const dx = next[j].x - next[i].x;
          const dy = next[j].y - next[i].y;
          if (dx * dx + dy * dy < MESH_R2) {
            mesh += `M${next[i].x.toFixed(0)},${next[i].y.toFixed(0)}L${next[j].x.toFixed(0)},${next[j].y.toFixed(0)}`;
            links++;
          }
        }
      }

      // advance waypoints once the flock centroid arrives
      if (mode.current === "waypoints" && wps.length > 0 && wi < wps.length) {
        if (Math.hypot(cx - wps[wi].x, cy - wps[wi].y) < 80) {
          wpIndex.current++;
          if (wpIndex.current >= wps.length) {
            mode.current = "mouse";
            waypoints.current = [];
            wpIndex.current = 0;
          }
        }
      }

      setFrame({
        drones: next.map((d) => ({
          d: droneGlyph(d),
          opacity: 0.7 + 0.3 * Math.sin(2 * t + d.rotor),
        })),
        mesh,
        centroid: { cx, cy, r: 0.55 * spread },
        cursor: { x: raw.current.x, y: raw.current.y, on: cursorOn },
        waypoints: waypoints.current,
        activeWaypoint: wpIndex.current,
        hud: {
          drn: next.length,
          spr: Math.round(spread),
          spd: avgSpd.toFixed(2),
          lnk: links,
          wpt:
            waypoints.current.length > 0
              ? `${Math.min(wpIndex.current + 1, waypoints.current.length)}/${waypoints.current.length}`
              : "---",
        },
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  const { w, h } = size;
  const inset = Math.min(190, w / 4, h / 4);

  return (
    <div className="df-root" ref={rootRef}>
      <style>{styles}</style>
      <svg
        aria-hidden="true"
        className="df-svg"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        width={w}
      >
        {/* frame decoration */}
        <g opacity={0.12} stroke="currentColor">
          <rect
            fill="none"
            height={h - inset * 2}
            strokeDasharray="6 10"
            strokeWidth={0.5}
            width={w - inset * 2}
            x={inset}
            y={inset}
          />
          {(
            [
              [inset, inset, 1, 1],
              [w - inset, inset, -1, 1],
              [inset, h - inset, 1, -1],
              [w - inset, h - inset, -1, -1],
            ] as const
          ).map(([lx, ly, dx, dy], i) => (
            <g key={`corner-${i}`} strokeWidth={0.6}>
              <line x1={lx} x2={lx + 20 * dx} y1={ly} y2={ly} />
              <line x1={lx} x2={lx} y1={ly} y2={ly + 20 * dy} />
            </g>
          ))}
        </g>

        {/* mesh links */}
        <path
          d={frame.mesh}
          fill="none"
          opacity={0.2}
          stroke="currentColor"
          strokeDasharray="2 6"
          strokeWidth={0.3}
        />

        {/* waypoint markers */}
        <g>
          {frame.waypoints.map((wp, i) => (
            <g
              key={`wp-${i}`}
              opacity={
                i < frame.activeWaypoint
                  ? 0.12
                  : i === frame.activeWaypoint
                    ? 0.7
                    : 0.35
              }
              stroke="currentColor"
            >
              <line
                strokeWidth={0.5}
                x1={wp.x - 6}
                x2={wp.x + 6}
                y1={wp.y}
                y2={wp.y}
              />
              <line
                strokeWidth={0.5}
                x1={wp.x}
                x2={wp.x}
                y1={wp.y - 6}
                y2={wp.y + 6}
              />
              <circle cx={wp.x} cy={wp.y} fill="none" r={3} strokeWidth={0.4} />
            </g>
          ))}
        </g>

        {/* drones */}
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={1}
        >
          {frame.drones.map((d, i) => (
            <path d={d.d} key={`drone-${i}`} opacity={d.opacity} />
          ))}
        </g>

        {/* flock bounding circle + pointer crosshair */}
        <g opacity={0.48} stroke="currentColor">
          <circle
            cx={frame.centroid.cx}
            cy={frame.centroid.cy}
            fill="none"
            r={frame.centroid.r}
            strokeDasharray="3 5"
            strokeWidth={0}
          />
          {frame.cursor.on && (
            <g strokeWidth={0.8}>
              <line
                x1={frame.cursor.x - 10}
                x2={frame.cursor.x + 10}
                y1={frame.cursor.y}
                y2={frame.cursor.y}
              />
              <line
                x1={frame.cursor.x}
                x2={frame.cursor.x}
                y1={frame.cursor.y - 10}
                y2={frame.cursor.y + 10}
              />
            </g>
          )}
        </g>
      </svg>

      {/* HUD telemetry */}
      <div className="df-hud">
        <span className="df-tl">{`LNK ....... ${frame.hud.lnk}`}</span>
        <span className="df-tl2">{`SPR ....... ${frame.hud.spr}`}</span>
        <span className="df-ml">COHESION 0.001</span>
        <span className="df-bl">MESH_R 260px</span>
        <span className="df-mr">ALIGN 0.035</span>
        <span className="df-br">SEP_R 24px</span>
        <span className="df-bc1">{`WPT ....... ${frame.hud.wpt}`}</span>
        <span className="df-bc2">{`DRN ....... ${frame.hud.drn}`}</span>
      </div>
    </div>
  );
}

const styles = `
.df-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: #080809;
  color: #d0d0d0;
  cursor: crosshair;
}

.df-svg {
  position: absolute;
  inset: 0;
  display: block;
}

.df-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: ui-monospace, "SFMono-Regular", "Menlo", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6f6f6f;
}

.df-hud span {
  position: absolute;
  white-space: nowrap;
}

.df-tl { top: 8%; left: 2rem; }
.df-tl2 { top: 18%; left: 2rem; }
.df-ml { top: 48%; left: 2rem; }
.df-bl { bottom: 6%; left: 2rem; }
.df-mr { top: 48%; right: 2rem; }
.df-br { bottom: 6%; right: 2rem; }
.df-bc1 { bottom: 6%; left: 30%; }
.df-bc2 { bottom: 6%; left: 48%; }

@media (max-width: 640px) {
  .df-ml, .df-mr, .df-br { display: none; }
}
`;
