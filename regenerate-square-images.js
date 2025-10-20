import * as fal from "@fal-ai/serverless-client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Fal API key
fal.config({
  credentials: process.env.FAL_KEY
});

// Read existing image definitions
const generatedImagesPath = path.join(__dirname, 'generated-images.json');
const existingImages = JSON.parse(fs.readFileSync(generatedImagesPath, 'utf-8'));

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

// Function to generate a square image
async function generateSquareImage(definition, index, total) {
  console.log(`\n[${index + 1}/${total}] Generating square image: ${definition.section}`);
  console.log(`Prompt: ${definition.prompt.substring(0, 100)}...`);

  try {
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: definition.prompt,
        image_size: {
          width: 1792,
          height: 1792  // Square aspect ratio
        },
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`  Progress: ${update.logs[update.logs.length - 1]?.message || 'Processing...'}`);
        }
      },
    });

    if (result.images && result.images.length > 0) {
      const imageUrl = result.images[0].url;
      console.log(`  ✓ Generated: ${imageUrl}`);
      return imageUrl;
    } else {
      console.error(`  ✗ No image generated`);
      return null;
    }
  } catch (error) {
    console.error(`  ✗ Error generating image: ${error.message}`);
    return null;
  }
}

// Function to upscale image
async function upscaleImage(imageUrl, index, total) {
  console.log(`  Upscaling...`);

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

// Function to convert to WebP and save
async function convertToWebP(imageUrl, outputFilename) {
  console.log(`  Converting to WebP...`);

  try {
    const tempPath = path.join(__dirname, 'temp-square-download.jpg');
    await downloadImage(imageUrl, tempPath);

    const outputPath = path.join(__dirname, 'src', 'assets', 'images', outputFilename);

    await sharp(tempPath)
      .webp({ quality: 90, effort: 6 })
      .toFile(outputPath);

    fs.unlinkSync(tempPath);

    console.log(`  ✓ Saved: ${outputFilename}`);
    return outputFilename;
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
  console.log('ABM Prospector Square Image Generation');
  console.log('Regenerating images with 1:1 aspect ratio (1792x1792)');
  console.log('='.repeat(80));

  if (!process.env.FAL_KEY) {
    console.error('\n❌ Error: FAL_KEY environment variable not set');
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < existingImages.length; i++) {
    const definition = existingImages[i];

    console.log(`\n${'='.repeat(80)}`);
    console.log(`Processing: ${definition.section || 'Unnamed section'}`);
    console.log(`File: ${definition.file}:${definition.line}`);

    // Generate square image
    const generatedUrl = await generateSquareImage(definition, i, existingImages.length);

    if (generatedUrl) {
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Upscale
      const upscaledUrl = await upscaleImage(generatedUrl, i, existingImages.length);

      if (upscaledUrl) {
        // Convert to WebP and save
        const filename = generateFilename(definition.section || `image-${i}`, definition.alt);
        const saved = await convertToWebP(upscaledUrl, filename);

        if (saved) {
          results.push({
            ...definition,
            generatedUrl,
            upscaledUrl,
            filename,
            dimensions: '3584x3584'
          });
        }
      }

      // Delay between images
      if (i < existingImages.length - 1) {
        console.log('\n  Waiting 3 seconds before next image...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  // Save results
  const outputFile = path.join(__dirname, 'square-images.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log(`✓ Complete! ${results.length}/${existingImages.length} square images generated`);
  console.log(`Results saved to: ${outputFile}`);
  console.log('All images are now 3584x3584 pixels (1:1 aspect ratio)');
  console.log('='.repeat(80));

  console.log('\n\nGenerated Square Images:');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.section || 'Unnamed'}`);
    console.log(`   File: ${result.file}:${result.line}`);
    console.log(`   Filename: ${result.filename}`);
    console.log(`   Dimensions: ${result.dimensions}`);
  });
}

main().catch(console.error);
