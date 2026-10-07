# Typing research (soft-type)
Sources (raw, read in full or targeted):
- https://raw.githubusercontent.com/swamimalode07/rare-ui/HEAD/components/ui/otp-input.tsx (rareui.com source; repo homepage = https://rareui.com)
- https://raw.githubusercontent.com/swamimalode07/rare-ui/HEAD/components/ui/gravity-letters.tsx
- https://raw.githubusercontent.com/JaceThings/Scritto/HEAD/packages/core/src/helpers.ts (diff, splitGraphemes)
- https://raw.githubusercontent.com/JaceThings/Scritto/HEAD/packages/core/src/index.ts (plan/commit, lines ~640-750)
- https://raw.githubusercontent.com/cristicretu/penflow/HEAD/packages/penflow/src/react/Penflow.tsx
Key facts: Scritto diff = grapheme prefix + best suffix run (RUN_BAND=2, MIN_FLOAT_RUN=2), reuses DOM nodes for prefix/suffix, createChar for the middle. Rare OTP = one real <input> per slot, not a single hidden input; caret is a spring-animated span. Gravity letters = not text-driven; monotonic idRef + leaving flag + 350ms removal. Penflow = Typr glyphToPath outlines, not a centreline.
