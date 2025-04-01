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
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
