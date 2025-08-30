const fs = require('fs');
const path = require('path');

// Simple zip creation without external dependencies
function createZip(sourceDir, outputPath) {
  const files = [];
  
  function walkDir(dir, baseDir = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(baseDir, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath, relativePath);
      } else {
        const content = fs.readFileSync(fullPath);
        files.push({
          name: relativePath.replace(/\\/g, '/'),
          data: content
        });
      }
    }
  }
  
  walkDir(sourceDir);
  
  // Create a simple zip structure (this is a basic implementation)
  // For a real deployment, you'd want to use a proper zip library
  
  // For now, let's create a tar file which is more universally supported
  const { execSync } = require('child_process');
  try {
    execSync(`cd "${sourceDir}" && tar -czf "${path.resolve(outputPath)}" .`);
    console.log('Archive created successfully');
  } catch (error) {
    console.error('Error creating archive:', error.message);
  }
}

createZip('dist/public', 'site.tar.gz');