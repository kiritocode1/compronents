/**
 * The BLANK mark beside the brand name: the aryank.space favicon with its
 * colours inverted (white tile, black AK monogram).
 */
export function BlankIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect width="120" height="120" fill="white" />
      <path
        d="M49.6591 101H45.2273L58.0455 66.0909H62.4091L75.2273 101H70.7955L60.3636 71.6136H60.0909L49.6591 101ZM51.2955 87.3636H69.1591V91.1136H51.2955V87.3636ZM80.6648 101V66.0909H84.892V83.4091H85.3011L100.983 66.0909H106.506L91.8466 81.8409L106.506 101H101.392L89.2557 84.7727L84.892 89.6818V101H80.6648Z"
        fill="black"
      />
    </svg>
  );
}
