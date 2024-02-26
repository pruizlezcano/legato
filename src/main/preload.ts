// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'list-projects'
  | 'open-settings'
  | 'scan-projects'
  | 'scan-started'
  | 'open-project'
  | 'open-project-folder'
  | 'update-project'
  | 'open-path-dialog'
  | 'save-settings'
  | 'load-settings'
  | 'log-info'
  | 'log-warn'
  | 'log-error'
  | 'error'
  | 'get-version'
  | 'project-updated'
  | 'import-projects'
  | 'export-projects'
  | 'succes';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
