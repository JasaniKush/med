'use client';
import { useEffect, useRef } from 'react';

interface VoiceOutputPlayerProps {
  audioDataUri: string;
}

export function VoiceOutputPlayer({ audioDataUri }: VoiceOutputPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioDataUri]);

  if (!audioDataUri) {
    return <p className="text-muted-foreground">No voice summary available.</p>;
  }

  return (
    <div className="w-full">
      <audio ref={audioRef} controls className="w-full">
        <source src={audioDataUri} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
