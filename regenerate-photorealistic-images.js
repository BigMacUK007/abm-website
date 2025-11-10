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

// Photorealistic image definitions with people
const imageDefinitions = [
  {
    file: "src/pages/index.astro",
    line: 148,
    alt: "AI Technology",
    section: "Why AI Changes Everything in ABM - Game-Changing Capabilities",
    prompt: "Photorealistic scene of a diverse team of business professionals in a modern tech office, gathered around a large interactive holographic display showing AI neural networks and data visualizations, ambient natural lighting from floor-to-ceiling windows, professional corporate attire, focused expressions of innovation and collaboration, ultra-sharp detail, cinematic composition, shallow depth of field, 8K quality"
  },
  {
    file: "src/pages/index.astro",
    line: 230,
    alt: "AI Tools",
    section: "The AI Stack That Powers Modern ABM - Master the Tools",
    prompt: "Photorealistic close-up of a marketing professional's hands working on a sleek laptop with multiple AI tool interfaces visible on screen, modern minimalist workspace with secondary monitor showing data dashboards, soft natural window light, professional business casual attire, clean desk setup with coffee cup, ultra-sharp focus on screens and hands, cinematic quality, 8K detail"
  },
  {
    file: "src/pages/index.astro",
    line: 256,
    alt: "Patrick Rea",
    section: "Authority Section - ABM Prospector Leadership",
    prompt: "Photorealistic portrait of a confident senior business professional (male, 50s, business attire) standing in a modern corporate training room or conference space, arms crossed with approachable smile, background shows presentation screens with ABM frameworks and charts slightly out of focus, professional lighting, authority and expertise conveyed through posture and environment, ultra-sharp portrait detail, 8K quality"
  },
  {
    file: "src/pages/index.astro",
    line: 354,
    alt: "Future of B2B Revenue",
    section: "B2B Revenue Generation Has Changed Forever",
    prompt: "Photorealistic wide shot of a modern B2B sales team celebrating success in a contemporary office, diverse group of professionals looking at large screen showing positive growth metrics and revenue dashboards, natural expressions of achievement and optimism, floor-to-ceiling windows showing city skyline, professional attire, golden hour lighting, cinematic composition, 8K quality"
  },
  {
    file: "src/pages/about.astro",
    line: 50,
    alt: "Patrick Rea FCIM",
    section: "Patrick Rea Profile - CIM ABM Course Director",
    prompt: "Photorealistic professional headshot-style portrait of a distinguished business leader (male, 50s, professional business attire with FCIM designation context), confident and approachable expression, seated at modern executive desk or standing by office window with subtle corporate background, professional studio-quality lighting, ultra-sharp facial detail showing expertise and experience, 8K portrait quality"
  },
  {
    file: "src/pages/about.astro",
    line: 99,
    alt: "Team Strategy Session",
    section: "Our Philosophy - ABM Transformation",
    prompt: "Photorealistic scene of a diverse B2B marketing team engaged in collaborative strategy session around a modern conference table, laptops and tablets visible, whiteboard with frameworks and strategy diagrams in background, engaged facial expressions and body language showing teamwork, natural office lighting, professional business casual attire, ultra-sharp detail, cinematic composition, 8K quality"
  },
  {
    file: "src/pages/about.astro",
    line: 172,
    alt: "Client Success",
    section: "Client Success Stories - Trusted by Leading B2B Teams",
    prompt: "Photorealistic scene of a client meeting or handshake moment between business professionals, diverse team members showing satisfaction and trust, modern corporate meeting room with sleek design, natural expressions of success and partnership, professional business attire, ambient natural lighting, background shows subtle success metrics on screens, ultra-sharp detail, 8K cinematic quality"
  }
];

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

// Function to generate a photorealistic square image
async function generateSquareImage(definition, index, total) {
  console.log(`\n[${index + 1}/${total}] Generating photorealistic image: ${definition.section}`);
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
    const tempPath = path.join(__dirname, 'temp-photorealistic-download.jpg');
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
  console.log('ABM Prospector Photorealistic Image Generation');
  console.log('Generating images with people in realistic business environments');
  console.log('='.repeat(80));

  if (!process.env.FAL_KEY) {
    console.error('\n❌ Error: FAL_KEY environment variable not set');
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < imageDefinitions.length; i++) {
    const definition = imageDefinitions[i];

    console.log(`\n${'='.repeat(80)}`);
    console.log(`Processing: ${definition.section || 'Unnamed section'}`);
    console.log(`File: ${definition.file}:${definition.line}`);

    // Generate photorealistic square image
    const generatedUrl = await generateSquareImage(definition, i, imageDefinitions.length);

    if (generatedUrl) {
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Upscale
      const upscaledUrl = await upscaleImage(generatedUrl, i, imageDefinitions.length);

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
      if (i < imageDefinitions.length - 1) {
        console.log('\n  Waiting 3 seconds before next image...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  // Save results
  const outputFile = path.join(__dirname, 'photorealistic-images.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log(`✓ Complete! ${results.length}/${imageDefinitions.length} photorealistic images generated`);
  console.log(`Results saved to: ${outputFile}`);
  console.log('All images are now 3584x3584 pixels (1:1 aspect ratio) with photorealistic people');
  console.log('='.repeat(80));

  console.log('\n\nGenerated Photorealistic Images:');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.section || 'Unnamed'}`);
    console.log(`   File: ${result.file}:${result.line}`);
    console.log(`   Filename: ${result.filename}`);
    console.log(`   Dimensions: ${result.dimensions}`);
  });
}

main().catch(console.error);
