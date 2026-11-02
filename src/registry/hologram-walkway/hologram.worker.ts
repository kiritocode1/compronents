// Bakes one frame of the hologram per message, off the main thread.
import { bakeHologram, type HoloPose } from "./hologram";

self.onmessage = (e: MessageEvent<{ name: string; pose: HoloPose }>) => {
  const frame = bakeHologram(e.data.pose);
  self.postMessage(
    { name: e.data.name, frame },
    {
      transfer: [
        frame.c.buffer,
        frame.z.buffer,
        frame.a.buffer,
        frame.kind.buffer,
        frame.warm.buffer,
        frame.cool.buffer,
      ],
    },
  );
};
