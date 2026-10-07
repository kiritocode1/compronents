// Lab-only: exposes skeletonise for console probing.
import { skeletonise } from "./skeleton";

Object.assign(window, { SoftTypeDebug: { skeletonise } });
