import * as fal from "@fal-ai/serverless-client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Fal API key from environment variable
fal.config({
  credentials: process.env.FAL_KEY
});

// Read the generated images
const generatedImagesPath = path.join(__dirname, 'generated-images.json');
const generatedImages = JSON.parse(fs.readFileSync(generatedImagesPath, 'utf-8'));

// Function to download an image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Function to upscale an image
async function upscaleImage(imageUrl, index, total) {
  console.log(`\n[${index + 1}/${total}] Upscaling image...`);
  console.log(`  Original: ${imageUrl}`);

  try {
    const result = await fal.subscribe("fal-ai/clarity-upscaler", {
      input: {
        image_url: imageUrl,
        scale: 2,
        dynamic: 6,
        creativity: 0.35,
        resemblance: 0.6,
        fractality: 0.8,
        sharpness: 2
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS" && update.logs && update.logs.length > 0) {
          console.log(`  Progress: ${update.logs[update.logs.length - 1]?.message || 'Processing...'}`);
        }
      },
    });

    if (result.image && result.image.url) {
      console.log(`  ✓ Upscaled: ${result.image.url}`);
      return result.image.url;
    } else {
      console.error(`  ✗ No upscaled image returned`);
      return null;
    }
  } catch (error) {
    console.error(`  ✗ Error upscaling: ${error.message}`);
    return null;
  }
}

// Function to convert image to WebP
async function convertToWebP(imageUrl, outputFilename) {
  console.log(`  Converting to WebP...`);

  try {
    // Download the upscaled image to temp location
    const tempPath = path.join(__dirname, 'temp-download.jpg');
    await downloadImage(imageUrl, tempPath);

    // Convert to WebP with high quality
    const outputPath = path.join(__dirname, 'public', 'images', outputFilename);

    // Ensure the public/images directory exists
    const imagesDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    await sharp(tempPath)
      .webp({ quality: 90, effort: 6 })
      .toFile(outputPath);

    // Clean up temp file
    fs.unlinkSync(tempPath);

    console.log(`  ✓ Converted to WebP: ${outputFilename}`);
    return `/images/${outputFilename}`;
  } catch (error) {
    console.error(`  ✗ Error converting to WebP: ${error.message}`);
    return null;
  }
}

// Generate filename from section name
function generateFilename(section, alt) {
  const cleanSection = section
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${cleanSection}.webp`;
}

// Main execution
async function main() {
  console.log('='.repeat(80));
  console.log('ABM Prospector Image Upscaling & WebP Conversion');
  console.log('Using Fal AI Clarity Upscaler + Sharp');
  console.log('='.repeat(80));

  if (!process.env.FAL_KEY) {
    console.error('\n❌ Error: FAL_KEY environment variable not set');
    console.error('Please set your Fal API key: export FAL_KEY="your-key-here"');
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < generatedImages.length; i++) {
    const image = generatedImages[i];

    console.log(`\n${'='.repeat(80)}`);
    console.log(`Processing: ${image.section || 'Unnamed section'}`);
    console.log(`File: ${image.file}:${image.line}`);

    // Upscale the image
    const upscaledUrl = await upscaleImage(image.generatedUrl, i, generatedImages.length);

    if (upscaledUrl) {
      // Convert to WebP
      const filename = generateFilename(image.section || `image-${i}`, image.alt);
      const localPath = await convertToWebP(upscaledUrl, filename);

      if (localPath) {
        results.push({
          ...image,
          upscaledUrl,
          webpPath: localPath,
          filename
        });
      }

      // Small delay between requests
      if (i < generatedImages.length - 1) {
        console.log('\n  Waiting 3 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  // Save results
  const outputFile = path.join(__dirname, 'upscaled-images.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log(`✓ Processing complete! ${results.length}/${generatedImages.length} images upscaled and converted`);
  console.log(`Results saved to: ${outputFile}`);
  console.log('='.repeat(80));

  // Print summary
  console.log('\nProcessed Images:');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.section || 'Unnamed'}`);
    console.log(`   File: ${result.file}:${result.line}`);
    console.log(`   Original: ${result.generatedUrl}`);
    console.log(`   Upscaled: ${result.upscaledUrl}`);
    console.log(`   WebP: ${result.webpPath}`);
    console.log(`   Filename: ${result.filename}`);
  });

  console.log('\n\nNext step:');
  console.log('Run the update script to replace image URLs in .astro files');
}

main().catch(console.error);
