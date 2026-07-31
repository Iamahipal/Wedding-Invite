/**
 * A soft radial darkening behind text that sits directly over the 3D.
 *
 * This is the unglamorous component that makes the whole thing legible. A
 * polished gold object throws bright specular highlights in unpredictable
 * places, and light-on-light type over a moving highlight is unreadable —
 * which on a wedding invitation is a total failure, however good it looks in
 * a screenshot.
 *
 * The gradient has no hard edge, so it never reads as a box: the 3D still
 * shows through everywhere, just a stop or two darker where the words are.
 */
export function Scrim({
  className = '',
  intensity = 0.82,
}: {
  className?: string
  intensity?: number
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background:
          `radial-gradient(ellipse 72% 46% at 50% 50%, ` +
          `rgba(10,14,26,${intensity}) 0%, ` +
          `rgba(10,14,26,${intensity * 0.55}) 42%, ` +
          `rgba(10,14,26,0) 74%)`,
      }}
    />
  )
}
