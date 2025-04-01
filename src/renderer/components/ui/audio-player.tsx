import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  PlayCircleIcon,
  PauseCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAppState,
  setShowAudioPlayer,
} from '@/store/Slices/appStateSlice';
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
export function AudioPlayer() {
  const { playing, togglePlayPause, duration, seek, stop } =
    useGlobalAudioPlayer();
  const pos = useAudioTime();
  const [sliderPos, setSliderPos] = useState(pos);
  const [showTitle, setShowTitle] = useState(false);
  const dispatch = useDispatch();
  const appState = useSelector(selectAppState);

  const handleSliderChange = ([newValue]: number[]) => {
    seek(newValue);
    setSliderPos(newValue);
  };

  useEffect(() => {
    setSliderPos(pos);
  }, [pos]);

  return (
    <>
      <div
        className="fixed bottom-4 left-0 right-0 z-50 mx-auto w-96 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        data-state={appState.showAudioPlayer ? 'open' : 'closed'}
      >
        <Card className="w-96">
          <CardContent
            className={`flex p-4 flex-col duration-700 ${showTitle && 'pt-2'}`}
            onMouseEnter={() => setShowTitle(true)}
            onMouseLeave={() => setShowTitle(false)}
          >
            <p
              className="text-sm m-auto pb-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              data-state={showTitle ? 'open' : 'closed'}
              hidden={!showTitle}
            >
              <span className="text-muted-foreground">now playing: </span>
              {appState.nowPlaying || 'No track playing'}
            </p>
            <div className="flex space-x-2">
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        stop();
                        dispatch(setShowAudioPlayer(false));
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
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="h-28" />
    </>
  );
}
