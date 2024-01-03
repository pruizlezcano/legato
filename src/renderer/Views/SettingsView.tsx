/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect, ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { Tooltip } from 'react-tooltip';
import Dialog from '../Components/Dialog';
import DebounceInput from '../Components/DebounceInput';
import { Settings } from '../../interfaces/Settings';

function SettingsView({
  onClose,
  settings: initialSettings,
  appVersion,
}: {
  onClose: () => void;
  settings: Settings;
  appVersion: string;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [oldSettings, setOldSettings] = useState(initialSettings);

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
    const handleKeyDown = (e: { key: string }) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.electron.ipcRenderer.on('open-path-dialog', (arg) => {
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
    window.electron.ipcRenderer.sendMessage('get-version');
  });

  return (
    <Dialog onClose={onClose}>
      <div className="relative flex flex-col w-screen bg-white dark:bg-dark outline-none focus:outline-none mx-auto my-4 max-w-xl">
        {/* header */}
        <h1 className="w-11/12 ml-6 my-1 flex-grow text-xl font-bold">
          Settings
        </h1>
        {/* body */}
        <table className="table-auto mx-2 mb-4">
          <tbody>
            <tr>
              <td className="px-4 py-2 text-gray-500 dark:text-gray-400 font-bold">
                Projects path
              </td>
              <td className="px-4 py-2 flex flex-row space-x-4">
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
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-500 dark:text-gray-400 font-bold">
                Theme
              </td>
              <td className="px-4 py-2">
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
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-500 dark:text-gray-400 font-bold">
                Scan Projects
              </td>
              <td className="px-4 py-2">
                <span className="space-x-2">
                  <button
                    type="button"
                    onClick={handleFastScan}
                    className="bg-green-400 text-white dark:text-dark rounded-md text-sm px-2"
                  >
                    Fast Scan
                  </button>
                  <button
                    type="button"
                    onClick={handleFullScan}
                    className="bg-red-400 text-white rounded-md text-sm px-2"
                  >
                    Full Scan
                  </button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-5 mx-6 flex flex-row place-content-between text-sm text-gray-400 dark:text-gray-500">
          <p>Legato v{appVersion}</p>
          <p>Copyright © 2024 Pablo Ruiz</p>
        </div>
      </div>
    </Dialog>
  );
}

export default SettingsView;
