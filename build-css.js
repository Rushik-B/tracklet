const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define paths
const srcDir = path.join(__dirname, 'src');
const mainCssFile = path.join(srcDir, 'main.css');

// Check if Tailwind is in node_modules
try {
  console.log('Building Tailwind CSS...');
  
  // Run Tailwind CLI to build the CSS
  execSync(`npx tailwindcss -i ./src/main.css -o ./src/main.compiled.css`);
  
  console.log('Tailwind CSS built successfully!');
  
  // Read the compiled CSS
  const compiledCss = fs.readFileSync(path.join(__dirname, 'src', 'main.compiled.css'), 'utf-8');
  
  // Rename the compiled file to main.css
  fs.writeFileSync(mainCssFile, compiledCss);
  
  // Remove the temporary file
  fs.unlinkSync(path.join(__dirname, 'src', 'main.compiled.css'));
  
  console.log('CSS processing complete!');
} catch (error) {
  console.error('Error building CSS:', error.message);
  process.exit(1);
} 