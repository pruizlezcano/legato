import { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import Dialog from '../Components/Dialog';
import DebounceInput from '../Components/DebounceInput';
import { Settings } from '../../interfaces/Settings';

function SettingsView({
  onClose,
  settings: initialSettings,
}: {
  onClose: () => void;
  settings: Settings;
}) {
  const [settings, setSettings] = useState(initialSettings);

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
    saveSettings(settings);
  }, [settings]);

  const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
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
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.electron.ipcRenderer.on('open-path-dialog', (arg) => {
      setSettings((old) => ({ ...old, projectsPath: arg }));
    });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <Dialog onClose={onClose}>
      <div className="relative flex flex-col w-screen bg-white dark:bg-dark outline-none focus:outline-none mx-auto my-4 max-w-3xl">
        {/* header */}
        <div className="flex pl-5 pb-4">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        {/* body */}
        <div className="flex flex-col relative px-6 py-4 space-y-6">
          <div className="flex flex-col align-middle">
            {/* Path selector */}
            <label htmlFor="projectsPath" className="">
              Projects Path:
            </label>
            <div className="flex flow-row space-x-4">
              <button
                type="button"
                onClick={() =>
                  window.electron.ipcRenderer.sendMessage('open-path-dialog')
                }
                data-tooltip-id="select-folder"
              >
                <FontAwesomeIcon
                  icon={faFolderOpen}
                  className="text-gray-500 dark:text-text-dark"
                />
              </button>
              <Tooltip
                id="select-folder"
                content="Open folder"
                place="bottom"
              />
              <DebounceInput
                value={settings.projectsPath}
                onChange={(value) =>
                  setSettings((old) => ({ ...old, projectsPath: value }))
                }
                placeholder="..."
                className="flex-grow m-2 bg-inherit text-gray-700 focus:outline-0 dark:text-text-dark"
              />
            </div>
          </div>
          <div>
            {/* // Theme selector */}
            <p>Theme</p>
            <select
              className="p-1 rounded bg-inherit capitalize hover:bg-gray-200 dark:hover:bg-dark-700 focus:outline-none"
              value={settings.theme}
              onChange={handleThemeChange}
            >
              {['system', 'light', 'dark'].map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            {/* Scan section */}
            <p className="mb-2">Scan projects:</p>
            <p className="text-slate-700 dark:text-text-dark">
              <button
                type="button"
                className="font-medium py-1 px-2 bg-blue-100 dark:bg-blue-200 rounded-full text-xs text-blue-800 dark:text-blue-900 mr-2 focus:outline-none"
                onClick={handleFastScan}
              >
                <FontAwesomeIcon icon={faArrowRight} className="pr-1" />
                Fast Scan
              </button>
              Search for new projects.
            </p>
            <p className="text-slate-700 dark:text-text-dark">
              <button
                type="button"
                className="cursor-pointer font-medium py-1 px-2 bg-red-100 dark:bg-red-200 rounded-full text-xs text-red-800 dark:text-red-900 mr-2 focus:outline-none"
                onClick={handleFullScan}
              >
                <FontAwesomeIcon icon={faArrowRight} className="pr-1" />
                Full Scan
              </button>
              Performs a comprehensive scan of all projects.
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default SettingsView;
