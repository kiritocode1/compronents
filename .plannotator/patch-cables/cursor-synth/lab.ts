// Headless lab: the synth on an empty page. ?voice=pluck|bloop|acid, ?ripples=0
import { createCursorSynth, type CursorSynthVoice } from "./cursor-synth";
const q = new URLSearchParams(location.search);
const voice = (q.get("voice") ?? "mist") as CursorSynthVoice;
(window as unknown as { __synth: unknown }).__synth = createCursorSynth({ voice, ripples: q.get("ripples") !== "0" });
