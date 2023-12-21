import { Project } from '../../db/entity';

export const handleOpenInAbleton = (projectId: number) =>
  window.electron.ipcRenderer.sendMessage('open-project', projectId);

export const handleOpenInFinder = (projectId: number) =>
  window.electron.ipcRenderer.sendMessage('open-project-folder', projectId);

export const handleProjectUpdate = (project: Project) => {
  window.electron.ipcRenderer.sendMessage('update-project', project);
};

export const handleList = () =>
  window.electron.ipcRenderer.sendMessage('list-projects');
