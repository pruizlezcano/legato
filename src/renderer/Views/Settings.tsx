import { useState, useEffect } from 'react';
import Dialog from '../Components/Dialog';

const Settings = ({ onClose, onSave }) => {
  const [path, setPath] = useState('');
  useEffect(() => {
    window.electron.ipcRenderer.on('open-path-dialog', (arg) => {
      setPath(arg);
    });
  }, []);
  return (
    <>
      <Dialog>
        {/*content*/}
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/*header*/}
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-3xl font-semibold">Settings</h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          {/*body*/}
          <div className="relative p-6 flex-auto">
            <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
              Projects folder:
            </p>
            <input
              type="text"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
              placeholder="Search"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              style={{ transition: 'all .15s ease' }}
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() =>
                window.electron.ipcRenderer.sendMessage('open-path-dialog')
              }
            >
              Open dialog
            </button>
            <hr />
            <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
              Scan projects:
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() =>
                window.electron.ipcRenderer.sendMessage('scan-projects', 'fast')
              }
            >
              Fast Scan
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() =>
                window.electron.ipcRenderer.sendMessage('scan-projects', 'full')
              }
            >
              Full Scan
            </button>
          </div>
          {/*footer*/}
          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
            <button
              className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
              onClick={onSave}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Settings;
