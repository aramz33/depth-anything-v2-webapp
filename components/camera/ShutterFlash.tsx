interface ShutterFlashProps {
  active: boolean;
}

export function ShutterFlash({ active }: ShutterFlashProps) {
  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="animate-shutter-flash pointer-events-none fixed inset-0 z-50 border-8 border-white"
    />
  );
}
