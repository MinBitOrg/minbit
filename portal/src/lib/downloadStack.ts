import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { WizardState } from '@/stores/wizardStore';
import { getAllServices } from '@/lib/services';
import { generateDockerCompose, generateEnvFile, generateReadme } from './configGenerator';

interface EditedFiles {
  dockerCompose: string | null;
  envFile: string | null;
  readme: string | null;
}

export async function downloadStack(state: WizardState): Promise<void> {
  const { selectedServices, serviceConfigs, projectName, useCase } = state;

  // Get full service objects
  const allServices = getAllServices();
  const selectedServiceObjects = allServices.filter((s) =>
    selectedServices.includes(s.id)
  );

  if (selectedServiceObjects.length === 0) {
    throw new Error('No services selected');
  }

  // Check for edited files from the review step
  let editedFiles: EditedFiles = {
    dockerCompose: null,
    envFile: null,
    readme: null,
  };

  try {
    const storedEdits = sessionStorage.getItem('minbit-edited-files');
    if (storedEdits) {
      editedFiles = JSON.parse(storedEdits);
    }
  } catch {
    // Ignore parsing errors, use generated files
  }

  // Generate or use edited configuration files
  const dockerCompose = editedFiles.dockerCompose ?? generateDockerCompose(
    selectedServiceObjects,
    serviceConfigs,
    projectName
  );

  const envFile = editedFiles.envFile ?? generateEnvFile(selectedServiceObjects, serviceConfigs);

  const readme = editedFiles.readme ?? generateReadme(selectedServiceObjects, projectName, useCase);

  // Create ZIP file
  const zip = new JSZip();

  // Add files to ZIP
  zip.file('docker-compose.yml', dockerCompose);
  zip.file('.env', envFile);
  zip.file('README.md', readme);

  // Generate and download ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });

  // Download with project name
  saveAs(blob, `${projectName}.zip`);

  // Clear the edited files from session storage after download
  sessionStorage.removeItem('minbit-edited-files');
}
