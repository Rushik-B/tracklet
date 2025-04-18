// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off and `contextIsolation` is turned on.
// Use the contextBridge API in `preload.js` to expose Node.js functionality
// to the renderer process.

console.log('Renderer Process Loaded');

document.addEventListener('DOMContentLoaded', async () => {
    const intervalInput = document.getElementById('interval');
    const soundToggle = document.getElementById('sound');
    const saveButton = document.getElementById('save-settings');
    const logList = document.getElementById('log-list'); // Get log list element

    // --- Settings --- 
    // Load initial settings when the window loads
    try {
        console.log('Requesting initial settings...');
        const currentSettings = await window.electronAPI.getSettings();
        console.log('Received settings:', currentSettings);
        if (currentSettings) {
            intervalInput.value = currentSettings.intervalMinutes || 30;
            soundToggle.checked = currentSettings.soundEnabled !== undefined ? currentSettings.soundEnabled : true;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        // Keep default values if loading fails
        intervalInput.value = 30;
        soundToggle.checked = true;
    }

    // Add listener for the save button
    saveButton.addEventListener('click', async () => {
        const newSettings = {
            intervalMinutes: parseFloat(intervalInput.value) || 30,
            soundEnabled: soundToggle.checked,
        };
        
        // Ensure the interval is not below the minimum allowed (e.g., 0.5)
        if (newSettings.intervalMinutes < 0.5) {
            console.warn(`Interval ${newSettings.intervalMinutes} is too low, setting to 0.5.`);
            newSettings.intervalMinutes = 0.5; 
            intervalInput.value = 0.5; // Update the input field visually
        }

        try {
            console.log('Saving settings:', newSettings);
            const result = await window.electronAPI.saveSettings(newSettings);
            console.log('Settings save result:', result);
            // Optionally show a success message to the user
            alert('Settings saved!'); // Simple feedback
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings.'); // Simple feedback
        }
    });

    // --- Load Initial Logs ---
    logList.innerHTML = ''; 
    try {
       console.log('Renderer: Requesting logs...');
       const logs = await window.electronAPI.getLogs();
       console.log('Renderer: Received logs:', logs);
       renderLogs(logs);
    } catch (error) {
       console.error('Error loading logs:', error);
       const errorLi = document.createElement('li');
       errorLi.textContent = 'Error loading logs.';
       logList.appendChild(errorLi);
    }

    // --- Listen for Real-time Log Updates ---
    console.log('Renderer: Setting up log update listener...');
    window.electronAPI.onLogUpdate((newLog) => {
        console.log('Renderer: Received logs:updated event with:', newLog);
        // Prepend the new log to the list (since we display newest first)
        const logList = document.getElementById('log-list');
        
        // Remove the "No logs" message if it exists
        const emptyMsg = logList.querySelector('li:only-child');
        if (emptyMsg && emptyMsg.textContent.includes('No logs recorded')) {
            logList.innerHTML = ''; // Clear the message
        }

        // Create the new list item
        const li = document.createElement('li');
        li.className = 'bg-dark-surface/50 p-3 rounded-lg border border-dark-border/50 hover:border-primary/30 transition-colors';
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'font-medium text-primary mr-2';
        
        try {
          const date = new Date(newLog.timestamp + 'Z');
          timeSpan.textContent = date.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute:'2-digit', 
              hour12: true 
          }) + ':'; 
        } catch(e) {
          timeSpan.textContent = 'Invalid Date:';
        }
        
        li.appendChild(timeSpan);
        li.appendChild(document.createTextNode(` ${newLog.activity || ''}`));
        
        // Add to the top of the list
        logList.insertBefore(li, logList.firstChild);
    });
});

// Function to render logs into the list
function renderLogs(logs) {
   const logList = document.getElementById('log-list');
   logList.innerHTML = ''; // Clear existing logs or messages

   if (!logs || logs.length === 0) {
       const emptyLi = document.createElement('li');
       emptyLi.className = 'text-center py-6 text-dark-muted italic';
       emptyLi.textContent = 'No logs recorded yet.';
       logList.appendChild(emptyLi);
       return;
   }

   // Since we fetched logs DESC, we might want to reverse for chronological display
   // Or display as is (newest first). Let's display newest first.
   logs.forEach(log => {
       const li = document.createElement('li');
       li.className = 'bg-dark-surface/50 p-3 rounded-lg border border-dark-border/50 hover:border-primary/30 transition-colors';
       
       const timeSpan = document.createElement('span');
       timeSpan.className = 'font-medium text-primary mr-2';
       
       // --- Timestamp Formatting Fix ---
       try {
         // SQLite stores timestamp usually as 'YYYY-MM-DD HH:MM:SS' in UTC.
         // Append 'Z' to indicate UTC for proper parsing by new Date().
         // If the timestamp format might vary, more robust parsing might be needed.
         const date = new Date(log.timestamp + 'Z'); 
         
         // Format consistently using local time with AM/PM
         timeSpan.textContent = date.toLocaleTimeString([], { 
             hour: '2-digit', 
             minute:'2-digit', 
             hour12: true 
         }) + ':'; 
       } catch(e) {
         console.error('Error parsing date:', log.timestamp, e); // Log error with timestamp
         timeSpan.textContent = 'Invalid Date:'; // Fallback
       }
       // --- End Timestamp Formatting Fix ---

       li.appendChild(timeSpan);
       li.appendChild(document.createTextNode(` ${log.activity || ''}`)); // Add activity text
       logList.appendChild(li);
   });
} 