import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../../../db/entity';

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [] as Project[],
    selectedProject: null as Project | null,
  },
  reducers: {
    loadProjects(state, action) {
      state.projects = action.payload;
    },
    loadProject(state, action: PayloadAction<Project>) {
      const existingProject = state.projects.find(
        (project: Project) => project.id === action.payload.id,
      );
      if (!existingProject) {
        state.projects.push(action.payload);
      } else {
        Object.keys(action.payload).forEach((key) => {
          if (
            key !== 'id' &&
            Object.prototype.hasOwnProperty.call(action.payload, key) &&
            action.payload[key as keyof Project] !==
              existingProject[key as keyof Project]
          ) {
            existingProject[key as keyof Project] = action.payload[
              key as keyof Project
            ] as never;
          }
        });
      }
    },
    updateProject(state, action: PayloadAction<Project>) {
      const existingProject = state.projects.find(
        (project: Project) => project.id === action.payload.id,
      );
      if (existingProject) {
        Object.keys(action.payload).forEach((key) => {
          if (
            key !== 'id' &&
            Object.prototype.hasOwnProperty.call(action.payload, key) &&
            action.payload[key as keyof Project] !==
              existingProject[key as keyof Project]
          ) {
            existingProject[key as keyof Project] = action.payload[
              key as keyof Project
            ] as never;
          }
        });
        state.selectedProject = existingProject;
      }
    },
    saveProject(state, action: PayloadAction<Project>) {
      updateProject(action.payload);
      window.electron.ipcRenderer.sendMessage(
        'update-project',
        JSON.parse(JSON.stringify(action.payload)),
      );
    },
    selectProjectById(state, action: PayloadAction<number>) {
      const id = action.payload;
      state.selectedProject =
        state.projects.find((project: Project) => project.id === id) || null;
    },
  },
});

export const {
  loadProjects,
  loadProject,
  updateProject,
  selectProjectById,
  saveProject,
} = projectSlice.actions;

export default projectSlice.reducer;

export const selectProjects = (state: any) => state.projects.projects;
export const selectSelectedProject = (state: any) =>
  state.projects.selectedProject;
