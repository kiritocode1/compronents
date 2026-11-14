"use client";

import { useRef, useState } from "react";
import { SliderComfortable } from "@/components/site/studio-controls";
import ImagePixelation, {
  type ImagePixelationHandle,
} from "@/registry/image-pixelation";
import { SceneStudioShell } from "./scene-studio-shell";

/** The source's control panel values. */
const DEFAULTS = { steps: 4, stepsDuration: 1 };

export default function ImagePixelationStudio() {
  const pixelation = useRef<ImagePixelationHandle>(null);
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [stepsDuration, setStepsDuration] = useState(DEFAULTS.stepsDuration);

  return (
    <SceneStudioShell
      name="image-pixelation"
      onReplay={() => pixelation.current?.play()}
      replayLabel="Play"
      onReset={() => {
        setSteps(DEFAULTS.steps);
        setStepsDuration(DEFAULTS.stepsDuration);
      }}
      stage={
        <div className="w-full max-w-[880px] px-4">
          <ImagePixelation
            ref={pixelation}
            alt="BLANK beanie"
            steps={steps}
            stepsDuration={stepsDuration}
          />
        </div>
      }
      groups={[
        {
          label: "Pixelation",
          content: (
            <>
              <SliderComfortable
                variant="scrubber"
                label="Steps"
                value={steps}
                onChange={setSteps}
                min={1}
                max={11}
                step={1}
              />
              <SliderComfortable
                variant="scrubber"
                label="Steps duration factor"
                value={stepsDuration}
                onChange={setStepsDuration}
                min={0.1}
                max={3}
                step={0.1}
              />
            </>
          ),
        },
      ]}
    />
  );
}
