import fs from 'fs';
import unzipper from 'unzipper';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';

const buildPDF = async (zipFilePath, {disableWatermark,pdfOptions}) => {
  const tempDir = path.dirname(zipFilePath);
  fs.mkdirSync(tempDir, { recursive: true });

  // Extract files from the zip
  await new Promise((resolve, reject) => {
    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: tempDir }))
      .on('close', resolve)
      .on('error', reject);
  });

  // Read the contents of the extracted files
  const ejsFilePath = `${tempDir}/index.ejs`;
  const cssFilePath = `${tempDir}/style.css`;
  const dataFilePath = `${tempDir}/data.json`;

  if (
    !(
      fs.existsSync(ejsFilePath) &&
      fs.existsSync(cssFilePath) &&
      fs.existsSync(dataFilePath)
    )
  ) {
    throw new Error('Could not find the required files in the craftx file');
  }

  // Read the EJS file content
  const ejsContent = fs.readFileSync(ejsFilePath, 'utf8');

  // Read the CSS file content
  let cssContent = '';
  if (fs.existsSync(cssFilePath)) {
    cssContent = fs.readFileSync(cssFilePath, 'utf8');
  }

  // Read the data JSON file content
  const $ = fs.existsSync(dataFilePath)
    ? JSON.parse(fs.readFileSync(dataFilePath, 'utf8'))
    : {};

  const images = convertImagesToBase64(tempDir);

  // Compile EJS content with provided data
  const htmlContent = ejs.render(ejsContent, { $, images });

  // Append CSS content to HTML content
  const fullHtmlContent = `
    <html>
      <head>
        ${process.env.ADDITIONAL_HTML_HEADER || ''}
        <style>
          ${cssContent}
          ${!disableWatermark && `body {
            position: relative;
            z-index: 1;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.1;
            z-index: -1;
            pointer-events: none;
            width: 100%;
            height: 100%;
            background: url('${process.env.WATERMARK}') no-repeat center center;
            background-size: contain;
          }`}
        </style>
      </head>
      <body>
        <div class="watermark"></div>
        ${htmlContent}
      </body>
    </html>
  `;

  // Generate PDF using puppeteer
  const pdfBuffer = await generatePDF(fullHtmlContent,pdfOptions);

  return pdfBuffer;
};

const generatePDF = async (htmlContent,pdfOptions) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  if(!pdfOptions || pdfOptions.format || pdfOptions.printBackground) {
    if(pdfOptions===undefined || pdfOptions===null) pdfOptions = {};
    pdfOptions.format = 'A4';
    pdfOptions.printBackground = true;
  }

  const pdfBuffer = await page.pdf(pdfOptions);

  await browser.close();
  return pdfBuffer;
};

const convertImagesToBase64 = (dirPath) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const images = {};

  // Read the files in the directory
  const files = fs.readdirSync(dirPath);

  // Iterate through each file
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);

    // Check if it's a file and if it has an image extension
    if (
      fs.statSync(filePath).isFile() &&
      imageExtensions.includes(path.extname(file).toLowerCase())
    ) {
      // Read the file as binary data
      const fileData = fs.readFileSync(filePath);

      // Convert binary data to base64-encoded string
      const base64Data = fileData.toString('base64');

      // Generate data URL
      const dataURL = `data:image/${path
        .extname(file)
        .slice(1)};base64,${base64Data}`;

      // Get the file name without extension
      let fileName = path.basename(file, path.extname(file));
      fileName += path.extname(file);
      // Add it to the images object with the filename as key
      images[fileName] = dataURL;
    }
  });
  return images;
};

const parseCraftx = async (zipFilePath) => {
  const tempDir = path.dirname(zipFilePath);
  fs.mkdirSync(tempDir, { recursive: true });

  // Extract files from the zip
  await new Promise((resolve, reject) => {
    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: tempDir }))
      .on('close', resolve)
      .on('error', reject);
  });

  // Read the contents of the extracted files
  const ejsFilePath = `${tempDir}/index.ejs`;
  const cssFilePath = `${tempDir}/style.css`;
  const dataFilePath = `${tempDir}/data.json`;

  if (
    !(
      fs.existsSync(ejsFilePath) &&
      fs.existsSync(cssFilePath) &&
      fs.existsSync(dataFilePath)
    )
  ) {
    throw new Error('Could not find the required files in the craftx file');
  }

  // Read the EJS file content
  const ejsContent = fs.readFileSync(ejsFilePath, 'utf8');

  // Read the CSS file content
  let cssContent = '';
  if (fs.existsSync(cssFilePath)) {
    cssContent = fs.readFileSync(cssFilePath, 'utf8');
  }

  // Read the data JSON file content
  const data = fs.existsSync(dataFilePath)
    ? JSON.parse(fs.readFileSync(dataFilePath, 'utf8'))
    : {};

  return { ejsContent, cssContent, data };
};

const buildService = { buildPDF, parseCraftx };

export default buildService;
