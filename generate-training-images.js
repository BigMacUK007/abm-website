import * as fal from "@fal-ai/serverless-client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fal.config({
  credentials: process.env.FAL_KEY
});

const imageDefinitions = [
  {
    filename: 'abm-training-workshop.webp',
    prompt: 'Photorealistic scene of professional business training workshop, diverse group of business professionals engaged in learning session, modern corporate training room with large screens showing ABM frameworks, people taking notes and collaborating, natural lighting, professional atmosphere, ultra-sharp detail, cinematic composition, 8K quality'
  },
  {
    filename: 'ai-tools-hands-on-training.webp',
    prompt: 'Photorealistic close-up of business professionals hands-on with laptops and tablets in training session, multiple screens showing AI tools and analytics dashboards, collaborative learning environment, modern corporate setting, engaged expressions, natural lighting, ultra-sharp detail focusing on the technology and collaboration, 8K quality'
  }
];

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

async function generateImage(definition, index, total) {
  console.log(`\n[${index + 1}/${total}] Generating: ${definition.filename}`);
  console.log(`Prompt: ${definition.prompt.substring(0, 100)}...`);

  try {
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: definition.prompt,
        image_size: { width: 1792, height: 1792 },
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
      console.log(`  ✓ Generated: ${result.images[0].url}`);
      return result.images[0].url;
    }
    return null;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return null;
  }
}

async function upscaleImage(imageUrl) {
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
      console.log(`  ✓ Upscaled`);
      return result.image.url;
    }
    return null;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return null;
  }
}

async function convertToWebP(imageUrl, outputFilename) {
  console.log(`  Converting to WebP...`);
  try {
    const tempPath = path.join(__dirname, 'temp-training-download.jpg');
    await downloadImage(imageUrl, tempPath);
    const outputPath = path.join(__dirname, 'src', 'assets', 'images', outputFilename);
    await sharp(tempPath).webp({ quality: 90, effort: 6 }).toFile(outputPath);
    fs.unlinkSync(tempPath);
    console.log(`  ✓ Saved: ${outputFilename}`);
    return outputFilename;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('Generating Training Page Images');
  console.log('='.repeat(80));

  if (!process.env.FAL_KEY) {
    console.error('\n❌ Error: FAL_KEY environment variable not set');
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < imageDefinitions.length; i++) {
    const definition = imageDefinitions[i];
    const generatedUrl = await generateImage(definition, i, imageDefinitions.length);

    if (generatedUrl) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const upscaledUrl = await upscaleImage(generatedUrl);

      if (upscaledUrl) {
        const saved = await convertToWebP(upscaledUrl, definition.filename);
        if (saved) results.push(definition.filename);
      }

      if (i < imageDefinitions.length - 1) {
        console.log('\n  Waiting 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✓ Complete! ${results.length}/${imageDefinitions.length} images generated`);
  console.log('='.repeat(80));
}

main().catch(console.error);
