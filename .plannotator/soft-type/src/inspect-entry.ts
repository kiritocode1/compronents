// Lab-only bundle entry: exposes the inspector to the static HTML page.
import { runInspector } from "./inspect";

Object.assign(window, { SoftTypeInspect: { runInspector } });
