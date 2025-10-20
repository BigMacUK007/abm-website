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

// Function to generate image
async function generateImage() {
  console.log('Generating AI tools image...');

  const prompt = "Photorealistic close-up of modern business professionals collaborating with AI technology, diverse team working together at sleek desk with multiple laptop screens showing data analytics and AI dashboards, professional hands typing and pointing at screens, modern corporate office environment with natural lighting, ultra-sharp detail focusing on the collaboration and technology, cinematic composition, 8K quality";

  try {
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: prompt,
        image_size: {
          width: 1792,
          height: 1792
        },
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`Progress: ${update.logs[update.logs.length - 1]?.message || 'Processing...'}`);
        }
      },
    });

    if (result.images && result.images.length > 0) {
      const imageUrl = result.images[0].url;
      console.log(`✓ Generated: ${imageUrl}`);
      return imageUrl;
    } else {
      console.error('✗ No image generated');
      return null;
    }
  } catch (error) {
    console.error(`✗ Error generating image: ${error.message}`);
    return null;
  }
}

// Function to upscale image
async function upscaleImage(imageUrl) {
  console.log('Upscaling...');

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
          console.log(`Progress: ${update.logs[update.logs.length - 1]?.message || 'Processing...'}`);
        }
      },
    });

    if (result.image && result.image.url) {
      console.log(`✓ Upscaled: ${result.image.url}`);
      return result.image.url;
    } else {
      console.error('✗ No upscaled image returned');
      return null;
    }
  } catch (error) {
    console.error(`✗ Error upscaling: ${error.message}`);
    return null;
  }
}

// Function to convert to WebP and save
async function convertToWebP(imageUrl, outputFilename) {
  console.log('Converting to WebP...');

  try {
    const tempPath = path.join(__dirname, 'temp-ai-tools-download.jpg');
    await downloadImage(imageUrl, tempPath);

    const outputPath = path.join(__dirname, 'src', 'assets', 'images', outputFilename);

    await sharp(tempPath)
      .webp({ quality: 90, effort: 6 })
      .toFile(outputPath);

    fs.unlinkSync(tempPath);

    console.log(`✓ Saved: ${outputFilename}`);
    return outputFilename;
  } catch (error) {
    console.error(`✗ Error converting to WebP: ${error.message}`);
    return null;
  }
}

// Main execution
async function main() {
  console.log('='.repeat(80));
  console.log('Generating AI Tools Image for Homepage');
  console.log('='.repeat(80));

  if (!process.env.FAL_KEY) {
    console.error('\n❌ Error: FAL_KEY environment variable not set');
    process.exit(1);
  }

  // Generate image
  const generatedUrl = await generateImage();

  if (generatedUrl) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Upscale
    const upscaledUrl = await upscaleImage(generatedUrl);

    if (upscaledUrl) {
      // Convert to WebP and save
      const filename = 'the-ai-stack-that-powers-modern-abm-master-the-tools.webp';
      const saved = await convertToWebP(upscaledUrl, filename);

      if (saved) {
        console.log('\n' + '='.repeat(80));
        console.log('✓ Complete! New AI tools image generated and saved');
        console.log(`Filename: ${filename}`);
        console.log(`Dimensions: 3584x3584`);
        console.log('='.repeat(80));
      }
    }
  }
}

main().catch(console.error);
