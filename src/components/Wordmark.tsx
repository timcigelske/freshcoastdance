/** Studio wordmark lockup — teal "Fresh Coast" script over tracked "CONNECT",
 *  mirroring the "Fresh Coast / DANCE" logo on the studio website. */
export function Wordmark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  const script = size === "lg" ? "text-5xl" : "text-3xl";
  const sub = size === "lg" ? "text-xs tracking-[0.5em]" : "text-[0.6rem] tracking-[0.4em]";
  return (
    <div className={`leading-none ${className}`}>
      <div className={`font-script text-brand ${script} leading-[0.85]`}>Fresh Coast</div>
      <div className={`font-display ${sub} pl-1 font-medium uppercase text-fg/70`}>Connect</div>
    </div>
  );
}
