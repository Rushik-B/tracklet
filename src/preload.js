// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    getSettings: () => ipcRenderer.invoke('settings:get'), // Channel to request settings
    saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings), // Channel to send settings
    // Add function to send a new log entry
    addLog: (activity) => ipcRenderer.invoke('log:add', activity),
    // Add function to get logs
    getLogs: () => ipcRenderer.invoke('logs:get'),
    // Add listener for real-time updates
    onLogUpdate: (callback) => ipcRenderer.on('logs:updated', (_event, newLog) => callback(newLog))
  }
);
