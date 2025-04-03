/* eslint-disable jsx-a11y/control-has-associated-label */
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { selectAppState, setShowSettings } from '@/store/Slices/appStateSlice';
import {
  selectSettings,
  updateSettings,
  Settings,
} from '@/store/Slices/settingsSlice';
import { SettingsIcon, FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch } from '@/components/ui/switch';
import cronstrue from 'cronstrue';
import DebounceInput from '../components/DebounceInput';

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      className="relative h-10 w-10 justify-start px-3 py-2 sm:w-fit"
      onClick={onClick}
    >
      <SettingsIcon className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline-flex">Settings</span>
    </Button>
  );
}

export function SettingsView() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings) as Settings;
  const appState = useSelector(selectAppState);
  const [cronInput, setCronInput] = useState(settings.scanSchedule || '');
  const [humanReadable, setHumanReadable] = useState('');
  const [cronError, setCronError] = useState('');

  const handleFastScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'fast');
  };

  const handleFullScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'full');
  };

  const handleThemeChange = (newTheme: string) => {
    if (
      newTheme === 'dark' ||
      (newTheme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    dispatch(updateSettings({ theme: newTheme }));
  };

  const handleScanScheduleChange = (value: string) => {
    setCronInput(value);
    try {
      if (value) {
        const readable = cronstrue.toString(value);
        setHumanReadable(readable);
        setCronError('');
      } else {
        setHumanReadable('');
      }
      dispatch(updateSettings({ scanSchedule: value }));
    } catch (error) {
      setCronError('Invalid cron expression');
      setHumanReadable('');
    }
  };

  // Common cron presets
  const cronPresets = [
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every 3 hours', value: '0 */3 * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Every 12 hours', value: '0 */12 * * *' },
    { label: 'Once a day (midnight)', value: '0 0 * * *' },
  ];

  // Initialize human readable text when component mounts
  useEffect(() => {
    if (settings.scanSchedule) {
      try {
        const readable = cronstrue.toString(settings.scanSchedule);
        setHumanReadable(readable);
        setCronInput(settings.scanSchedule);
      } catch (error) {
        // Handle invalid cron expression in settings
        setCronError('Invalid cron expression in settings');
      }
    }
  }, [settings.scanSchedule]);

  useEffect(() => {
    const handleKeyDown = (e: { key: string }) => {
      if (e.key === 'Escape') {
        dispatch(setShowSettings(false));
      }
    };

    window.electron.ipcRenderer.on('open-path-dialog', (arg) => {
      if (arg) dispatch(updateSettings({ projectsPath: arg as string }));
    });

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);

  const handleOpen = (b: boolean): void => {
    if (b) {
      return;
    }
    dispatch(setShowSettings(false));
  };
  return (
    <Dialog open={appState.showSettings} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="path">Projects path</Label>
            <div className="col-span-3 flex">
              <Button
                variant="outline"
                onClick={() => {
                  window.electron.ipcRenderer.sendMessage('open-path-dialog');
                }}
                className="rounded-r-none border-r-0 p-3"
              >
                <FolderIcon className="h-4 w-4" />
              </Button>

              <DebounceInput
                id="path"
                value={settings.projectsPath}
                onChange={(value) => {
                  if (value !== settings.projectsPath)
                    dispatch(updateSettings({ projectsPath: value }));
                }}
                placeholder="Projects path..."
                className="rounded-l-none"
              />
            </div>
          </div>
          <div className="grid w-32 max-w-sm items-center gap-1.5">
            <Label>Theme</Label>
            <Select value={settings.theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={settings.theme} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Background Scan</Label>
            <div className="flex items-center space-x-4">
              <Switch
                id="auto-scan"
                checked={!!settings.scanSchedule}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    const defaultCron = '0 * * * *';
                    handleScanScheduleChange(defaultCron);
                  } else {
                    handleScanScheduleChange('');
                  }
                }}
              />
              <Label htmlFor="auto-scan" className="cursor-pointer">
                Enable automatic scanning
              </Label>
            </div>

            {settings.scanSchedule && (
              <div className="mt-2 space-y-2">
                <Label htmlFor="cron-input">Schedule (cron format)</Label>
                <DebounceInput
                  id="cron-input"
                  value={cronInput}
                  onChange={(e) => handleScanScheduleChange(e)}
                  placeholder="0 * * * *"
                  className={cronError ? 'border-destructive' : ''}
                />

                {cronError ? (
                  <p className="text-sm text-destructive">{cronError}</p>
                ) : humanReadable ? (
                  <p className="text-sm text-muted-foreground">
                    {humanReadable}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2 mt-2">
                  {cronPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleScanScheduleChange(preset.value)}
                      className={`text-xs ${
                        cronInput.trim() === preset.value ? 'bg-primary/10' : ''
                      }`}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Scan Projects</Label>
            <span className="col-span-3 space-x-2">
              <Button
                onClick={handleFastScan}
                disabled={appState.scanInProgress}
              >
                Fast Scan
              </Button>
              <Button
                onClick={handleFullScan}
                variant="secondary"
                disabled={appState.scanInProgress}
              >
                Full Scan
              </Button>
            </span>
          </div>
        </div>
        <DialogFooter>
          <p className="text-muted-foreground/60 text-xs">
            Copyright © 2024 Pablo Ruiz
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
