import React from 'react';

export function TraceVoiceCard() {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Prefer Writing or Journaling?</h3>
      <p className="mt-2 text-sm text-foreground/80">If you find writing helps, try our partner community for journaling and healing.</p>
      <div className="mt-4">
        <a
          href="https://www.thetracevoice.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Go to TraceVoice
        </a>
      </div>
    </div>
  );
}

export default TraceVoiceCard;
