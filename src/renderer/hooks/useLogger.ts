/* eslint-disable class-methods-use-this */
class Logger {
  public info(message: string): void {
    window.electron.ipcRenderer.sendMessage('log-info', message);
  }

  public warn(message: string): void {
    window.electron.ipcRenderer.sendMessage('log-warn', message);
  }

  public error(message: string): void {
    window.electron.ipcRenderer.sendMessage('log-error', message);
  }
}

const logger = new Logger();

export default logger;
