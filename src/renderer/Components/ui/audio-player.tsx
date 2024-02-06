import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/Components/ui/tooltip';
import {
  PlayCircleIcon,
  PauseCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Slider } from './slider';

function useAudioTime() {
  const frameRef = useRef<number>();
  const [pos, setPos] = useState(0);
  const { getPosition } = useGlobalAudioPlayer();

  useEffect(() => {
    const animate = () => {
      setPos(getPosition());
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [getPosition]);

  return pos;
}

function posToString(pos: number) {
  const minutes = Math.floor(pos / 60);
  const seconds = Math.floor(pos % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// eslint-disable-next-line import/prefer-default-export
export function AudioPlayer({ onClose }: { onClose?: () => void }) {
  const { playing, togglePlayPause, duration, seek, stop } =
    useGlobalAudioPlayer();
  const pos = useAudioTime();
  const [sliderPos, setSliderPos] = useState(pos);

  const handleSliderChange = ([newValue]: number[]) => {
    seek(newValue);
    setSliderPos(newValue);
  };

  useEffect(() => {
    setSliderPos(pos);
  }, [pos]);

  return (
    <>
      <div className="fixed bottom-4 left-0 right-0 z-50 mx-auto w-96">
        <Card className="w-96">
          <CardContent className="flex space-x-2 p-4">
            <button type="button" onClick={togglePlayPause}>
              {playing ? (
                <PauseCircleIcon className="h-5 w-5" />
              ) : (
                <PlayCircleIcon className="h-5 w-5" />
              )}
            </button>
            <span>{posToString(pos)}</span>
            <Slider
              value={[sliderPos]}
              min={0}
              max={duration}
              onValueChange={handleSliderChange}
              step={0.1}
            />
            <span>{posToString(duration)}</span>
            {onClose && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        stop();
                        onClose();
                      }}
                      aria-label="Close"
                    >
                      <XMarkIcon className="h-5 w-5 text-muted-foreground/60 hover:text-inherit" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="h-28" />
    </>
  );
}
