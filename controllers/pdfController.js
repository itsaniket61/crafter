import buildService from '@/service/BuildService';
import fs from 'fs';
import path from 'path';

const buildPDF = async (file) => {
  if (file.name.split('.').at(-1) !== 'craftx') {
    throw new Error('The provided file is not a craftx file');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const sessionId = Date.now().toString();
  const tempDir = 'temp/'+sessionId;
  const tempZipPath = path.join(tempDir, sessionId + '.craftx');

  try {
    // Check if the directory exists, create it if it doesn't
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir,{ recursive: true});
    }

    // Write file asynchronously
    await fs.promises.writeFile(tempZipPath, buffer);

    const pdfPath = await buildService.buildPDF(tempZipPath, () => {});

    // Remove the temporary file
    fs.unlinkSync(tempZipPath);
    fs.rmdirSync(tempDir, {recursive: true});

    // Return the path to the generated PDF file
    return { response: pdfPath, status: 200 };
  } catch (err) {
    console.error('Error generating or handling PDF:', err);
    fs.unlinkSync(tempZipPath);
    fs.rmdirSync(tempDir, { recursive: true });
    throw { response: "Failed to generate PDF", status: 500, error: err.message };
  }
};

const parseCraftx = async (file) => {
  if (file.name.split('.').at(-1) !== 'craftx') {
    throw new Error('The provided file is not a craftx file');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const sessionId = Date.now().toString();
  const tempDir = 'temp/' + sessionId;
  const tempZipPath = path.join(tempDir, sessionId + '.craftx');

  try {
    // Check if the directory exists, create it if it doesn't
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write file asynchronously
    await fs.promises.writeFile(tempZipPath, buffer);

    const parsedData = await buildService.parseCraftx(tempZipPath);

    // Remove the temporary file
    fs.unlinkSync(tempZipPath);
    fs.rmdirSync(tempDir, { recursive: true });

    // Return the path to the generated PDF file
    return { response: parsedData, status: 200 };
  } catch (err) {
    console.error('Error generating or handling PDF:', err);
    fs.unlinkSync(tempZipPath);
    fs.rmdirSync(tempDir, { recursive: true });
    throw {
      response: 'Failed to generate PDF',
      status: 500,
      error: err.message,
    };
  }
};

const pdfController = { buildPDF, parseCraftx };

export default pdfController;
