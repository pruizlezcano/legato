/* eslint-disable jsx-a11y/control-has-associated-label */
import { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { FolderIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { handleList } from '@/hooks/handlers';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import DebounceInput from '../Components/DebounceInput';
import { Settings } from '../../interfaces/Settings';

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      className="relative h-10 w-10 sm:w-fit justify-start px-3 py-2"
      onClick={onClick}
    >
      <Cog6ToothIcon className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline-flex">Settings</span>
    </Button>
  );
}

export function SettingsView({
  onClose,
  settings: initialSettings,
  open,
  scanDisabled = false,
}: {
  onClose: () => void;
  settings: Settings;
  open: boolean;
  // eslint-disable-next-line react/require-default-props
  scanDisabled?: boolean;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [oldSettings, setOldSettings] = useState(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
    setOldSettings(initialSettings);
  }, [initialSettings]);

  const handleFastScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'fast');
  };

  const handleFullScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'full');
  };

  const saveSettings = (newSettings: Settings) => {
    window.electron.ipcRenderer.sendMessage('save-settings', newSettings);
  };

  useEffect(() => {
    if (JSON.stringify(settings) !== JSON.stringify(oldSettings)) {
      saveSettings(settings);
      setOldSettings(settings);
    }
  }, [settings, oldSettings]);

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
    setSettings((old) => ({ ...old, theme: newTheme }));
  };

  useEffect(() => {
    const handleKeyDown = (e: { key: string }) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.electron.ipcRenderer.on('open-path-dialog', (arg) => {
      if (arg)
        setSettings(
          (old: Settings) => ({ ...old, projectsPath: arg }) as Settings,
        );
    });

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    window.electron.ipcRenderer.on('open-settings', () => {
      handleList();
    });
  }, []);

  const handleOpen = (b: boolean): void => {
    if (b) {
      return;
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
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
                className="border-r-0 rounded-r-none p-3"
              >
                <FolderIcon className="h-4 w-4" />
              </Button>

              <DebounceInput
                id="path"
                value={settings.projectsPath}
                onChange={(value) => {
                  if (value !== settings.projectsPath)
                    setSettings((old) => ({ ...old, projectsPath: value }));
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
            <Label>Scan Projects</Label>
            <span className="space-x-2 col-span-3">
              <Button onClick={handleFastScan} disabled={scanDisabled}>
                Fast Scan
              </Button>
              <Button
                onClick={handleFullScan}
                variant="secondary"
                disabled={scanDisabled}
              >
                Full Scan
              </Button>
            </span>
          </div>
        </div>
        <DialogFooter>
          <p className="text-xs text-muted-foreground/60">
            Copyright © 2024 Pablo Ruiz
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
