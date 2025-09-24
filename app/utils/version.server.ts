import { readFileSync } from 'fs';
import { join } from 'path';

export function getAppVersion(): string {
  try {
    // Try to read version from the .env.version file created by Docker
    const versionPath = join(process.cwd(), '.env.version');
    const versionContent = readFileSync(versionPath, 'utf-8');
    const versionMatch = versionContent.match(/APP_VERSION=(.+)/);
    
    if (versionMatch) {
      return versionMatch[1].trim();
    }
  } catch (error) {
    // If file doesn't exist or can't be read, fall back to package.json
    console.warn('Could not read .env.version file, falling back to package.json');
  }

  try {
    // Fallback to reading from package.json
    const packagePath = join(process.cwd(), 'package.json');
    const packageContent = readFileSync(packagePath, 'utf-8');
    const packageJson = JSON.parse(packageContent);
    return packageJson.version || 'unknown';
  } catch (error) {
    console.error('Could not read version from package.json:', error);
    return 'unknown';
  }
} 