/* eslint-disable jsx-a11y/control-has-associated-label */
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { selectAppState } from '@/store/Slices/appStateSlice';
import { selectSettings, updateSettings } from '@/store/Slices/settingsSlice';
import { Cog6ToothIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Settings } from '../../interfaces/Settings';
import DebounceInput from '../Components/DebounceInput';

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      className="relative h-10 w-10 justify-start px-3 py-2 sm:w-fit"
      onClick={onClick}
    >
      <Cog6ToothIcon className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline-flex">Settings</span>
    </Button>
  );
}

export function SettingsView({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings) as Settings;
  const appState = useSelector(selectAppState);

  const handleFastScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'fast');
  };

  const handleFullScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'full');
  };

  const handleInport = () => {
    window.electron.ipcRenderer.sendMessage('import-projects');
  };

  const handleExport = () => {
    window.electron.ipcRenderer.sendMessage('export-projects');
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
        onClose();
      }
    };

    window.electron.ipcRenderer.on('open-path-dialog', (arg) => {
      if (arg) dispatch(updateSettings({ projectsPath: arg }));
    });

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, dispatch]);

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
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Inport/Export Projects</Label>
            <span className="col-span-3 space-x-2">
              <Button onClick={handleInport}>Import</Button>
              <Button onClick={handleExport} variant="secondary">
                Export
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
