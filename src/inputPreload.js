const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electronInputAPI', // Use a different name to avoid conflicts with dashboard API
  {
    // Function to send the log entry to the main process
    addLog: (activity) => ipcRenderer.invoke('log:add', activity),
    
    // Function to tell the main process to close this window
    closeInputWindow: () => ipcRenderer.send('input:close') // Use ipcRenderer.send for one-way messages
  }
); 