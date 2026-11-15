/**
 * Every text field in the app. At rest: a 2px cocoa-soft outline on card
 * paper. On focus, instead of a generic ring, the field rises onto the same
 * cocoa base edge buttons sit on (box-shadow, so nothing around it shifts)
 * and its outline inks to full cocoa — a 3px solid edge is the visible
 * focus indicator. 16px text, because iOS zooms the page into anything
 * smaller. Invalid fields keep the edge and thicken the outline; the error
 * text under them carries the message.
 */
export const INPUT_CLASSES =
  "h-13 w-full rounded-[length:var(--radius-md)] border-2 border-cocoa-soft bg-card px-4 font-body text-[16px] text-cocoa caret-tangerine-deep shadow-[0_0_0_var(--color-cocoa)] transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] placeholder:text-cocoa-soft hover:border-cocoa focus:border-cocoa focus:shadow-[0_3px_0_var(--color-cocoa)] focus:outline-none aria-[invalid=true]:border-[2.5px] aria-[invalid=true]:border-cocoa aria-[invalid=true]:shadow-[0_3px_0_var(--color-cocoa)] motion-reduce:transition-none";
