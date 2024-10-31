export interface Track {
  name: string;
  pluginNames: string[];
  type: 'midi' | 'audio' | 'return';
}
