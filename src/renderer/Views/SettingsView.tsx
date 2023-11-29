import { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import Dialog from '../Components/Dialog';

function SettingsView({
  onClose,
  onSave,
  settings: initialSettings,
}: {
  onClose: () => void;
  onSave: () => void;
  settings: any;
}) {
  const [settings, setSettings] = useState(initialSettings);

  const handleFastScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'fast');
  };

  const handleFullScan = () => {
    window.electron.ipcRenderer.sendMessage('scan-projects', 'full');
  };

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

  const handleSave = () => {
    window.electron.ipcRenderer.sendMessage('save-settings', settings);
    onSave();
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
    <Dialog>
      <div className="relative flex flex-col w-screen bg-white dark:bg-dark outline-none focus:outline-none mx-auto my-4 max-w-3xl">
        {/* header */}
        <div className="flex items-start justify-between pl-5 border-b pb-4">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        {/* body */}
        <div className="flex flex-col relative p-6">
          <div className="flex flox-row pb-6 align-middle">
            <p className="w-fit pr-2">Projects folder:</p>
            <input
              type="text"
              className="flex-grow bg-transparent border-b outline-none text-slate-700 dark:text-text-dark"
              placeholder="Search"
              value={settings.projectsPath}
              onChange={(e) =>
                setSettings((old) => ({ ...old, projectsPath: e.target.value }))
              }
              style={{ transition: 'all .15s ease' }}
            />
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
            <Tooltip id="select-folder" content="Open folder" place="bottom" />
            <hr />
          </div>
          <div className="flex flex-row">
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
            <p className="mt-4 mb-2">Scan projects:</p>
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
              Performs a comprehensive scan of all projects. This may take
              longer than the Fast Scan, but it will be more thorough.
            </p>
          </div>
        </div>
        {/* footer */}
        <div className="flex items-center justify-end pt-4 pr-4 border-t border-solid border-blueGray-200 rounded-b">
          <button
            className="text-red-600 background-transparent font-semibold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold uppercase text-sm px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default SettingsView;
