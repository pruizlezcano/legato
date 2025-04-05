/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  SettingsIcon,
  FolderIcon,
  ScanIcon,
  LayoutIcon,
  MonitorIcon,
  InfoIcon,
  CoffeeIcon,
  BugIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { Switch } from '@/components/ui/switch';
import { selectAppState, setShowSettings } from '@/store/Slices/appStateSlice';
import {
  selectSettings,
  updateSettings,
  Settings,
} from '@/store/Slices/settingsSlice';
import cronstrue from 'cronstrue';
import { cn } from '@/utils';
import DebounceInput from '../components/DebounceInput';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

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

type SettingsCategory = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const categories: SettingsCategory[] = [
  {
    id: 'scanning',
    name: 'Scanning',
    icon: <ScanIcon className="h-4 w-4" />,
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: <LayoutIcon className="h-4 w-4" />,
  },
  {
    id: 'behavior',
    name: 'Behavior',
    icon: <MonitorIcon className="h-4 w-4" />,
  },
  {
    id: 'about',
    name: 'About',
    icon: <InfoIcon className="h-4 w-4" />,
  },
];

export function SettingsView() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings) as Settings;
  const appState = useSelector(selectAppState);
  const [cronInput, setCronInput] = useState(settings.scanSchedule || '');
  const [humanReadable, setHumanReadable] = useState('');
  const [cronError, setCronError] = useState('');
  const [activeCategory, setActiveCategory] = useState('scanning');

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

  const openExternal = (url: string) => {
    window.electron.ipcRenderer.sendMessage('open-external', url);
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

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'appearance':
        return (
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
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
          </div>
        );
      case 'scanning':
        return (
          <div className="space-y-4">
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
              <p className="text-sm text-muted-foreground">
                The directory where your music projects are stored. You can run
                a manual scan at any time using the buttons below.
              </p>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>Manual Scan</Label>
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
              <p className="text-sm text-muted-foreground">
                Fast scan only checks for new or modified projects. Full scan
                reanalyzes all projects.
              </p>
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
              <p className="text-sm text-muted-foreground">
                When enabled, Legato will automatically scan for new or modified
                projects according to the schedule below.
              </p>

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
                          cronInput.trim() === preset.value
                            ? 'bg-primary/10'
                            : ''
                        }`}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'behavior':
        return (
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>Application Behavior</Label>
              <div className="flex items-center space-x-4">
                <Switch
                  id="minimize-to-tray"
                  checked={settings.minimizeToTray}
                  onCheckedChange={(checked: boolean) => {
                    dispatch(
                      updateSettings({
                        minimizeToTray: checked,
                      }),
                    );
                  }}
                />
                <Label htmlFor="minimize-to-tray" className="cursor-pointer">
                  Minimize to tray when closing
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, closing the app will minimize it to the system
                tray instead of quitting. This allows background scans to
                continue running.
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Switch
                  id="start-minimized"
                  checked={settings.startMinimized}
                  disabled={!settings.minimizeToTray}
                  onCheckedChange={(checked: boolean) => {
                    dispatch(
                      updateSettings({
                        startMinimized: checked,
                      }),
                    );
                  }}
                />
                <Label
                  htmlFor="start-minimized"
                  className={`cursor-pointer ${
                    !settings.minimizeToTray ? 'text-muted-foreground' : ''
                  }`}
                >
                  Start minimized
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, the app will start minimized to the system tray.
                {!settings.minimizeToTray && (
                  <span className="block mt-1 text-yellow-600 dark:text-yellow-400">
                    Enable &quot;Minimize to tray when closing&quot; to use this
                    feature.
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <img
                src="local://icon"
                alt="Legato"
                className="h-24 w-24 rounded-lg"
              />
              <div className="text-center">
                <h2 className="text-2xl font-bold">Legato</h2>
                <p className="text-muted-foreground">
                  Version {appState.appVersion}
                </p>
              </div>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>Links</Label>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    openExternal('https://github.com/pruizlezcano/legato');
                  }}
                >
                  <GithubIcon className="h-4 w-4 mr-2" />
                  GitHub Repository
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    openExternal(
                      'https://pruizlezcano.github.io/legato/getting-started',
                    );
                  }}
                >
                  <InfoIcon className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    openExternal(
                      'https://github.com/pruizlezcano/legato/issues',
                    );
                  }}
                >
                  <BugIcon className="h-4 w-4 mr-2" />
                  Report an Issue
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#13a3dc] hover:bg-[#13a3dc] hover:text-white"
                  onClick={() => {
                    openExternal('https://ko-fi.com/pruizlezcano');
                  }}
                >
                  <CoffeeIcon className="h-4 w-4 mr-2" />
                  Support development on Ko-fi
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={appState.showSettings} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] block">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex gap-6 h-full overflow-hidden pt-4 pb-2">
          <div className="w-48 space-y-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  activeCategory === category.id && 'bg-accent',
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </Button>
            ))}
          </div>
          <div className="flex-1 pr-4 pl-0.5 overflow-y-auto">
            {renderCategoryContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
