console.log('Input Renderer Loaded');

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('activity-input');
    const logButton = document.getElementById('log-button');
    const cancelButton = document.getElementById('cancel-button');

    // Focus the input field automatically when the window opens
    inputField?.focus(); 

    const submitLog = async () => {
        const activity = inputField.value.trim();
        if (activity) { // Only log if there is text
            console.log(`Renderer sending log: ${activity}`);
            try {
                await window.electronInputAPI.addLog(activity);
                // Close the window after successfully sending the log
                window.electronInputAPI.closeInputWindow(); 
            } catch (error) {
                console.error('Error sending log:', error);
                // Optionally show an error to the user in the input window
                alert('Failed to save log. Please try again.');
            }
        } else {
             // If input is empty, just close the window
             console.log('Input is empty, closing window.');
             window.electronInputAPI.closeInputWindow();
        }
    };

    // Handle button click
    logButton.addEventListener('click', submitLog);
    
    // Handle cancel button
    cancelButton.addEventListener('click', () => {
        console.log('Cancel button clicked, closing window.');
        window.electronInputAPI.closeInputWindow();
    });

    // Handle Enter key press in the input field
    inputField.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission behavior (if any)
            submitLog();
        }
    });
    
    // Handle Escape key to cancel
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            console.log('Escape key pressed, closing window.');
            window.electronInputAPI.closeInputWindow();
        }
    });
}); 