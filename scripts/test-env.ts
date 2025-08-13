import fs from 'fs';
import path from 'path';

console.log('🔍 Testing environment loading...');
console.log('Current directory:', __dirname);

const envLocalPath = path.join(__dirname, '..', '.env.local');
console.log('Looking for .env.local at:', envLocalPath);
console.log('Exists:', fs.existsSync(envLocalPath));

if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  console.log('First 100 chars:', content.substring(0, 100));
}
