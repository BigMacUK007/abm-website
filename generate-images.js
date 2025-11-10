import * as fal from "@fal-ai/serverless-client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Fal API key from environment variable
fal.config({
  credentials: process.env.FAL_KEY
});

// Define images to generate with their section context
const imageDefinitions = [
  // index.astro images
  {
    file: 'src/pages/index.astro',
    line: 148,
    alt: 'AI Technology',
    section: 'Why AI Changes Everything in ABM - Game-Changing Capabilities',
    prompt: '3D isometric scene showing AI-powered intelligence system, holographic data nodes and neural network connections flowing through space, glossy CGI with cool blue and violet tones, volumetric lighting creating soft glows around abstract tech elements, glass-like transparent surfaces with subtle reflections, futuristic corporate aesthetic, negative space on left side for text overlay, ultra-clean composition, no text, no logos, no people'
  },
  {
    file: 'src/pages/index.astro',
    line: 230,
    alt: 'AI Tools',
    section: 'The AI Stack That Powers Modern ABM - Master the Tools',
    prompt: '3D isometric workspace with floating abstract tool icons and interface elements, sleek tech devices suspended in mid-air, cool teal and blue color scheme with warm orange accent glows, glass materials with reflections, soft depth of field blurring background elements, futuristic corporate style, negative space on right for text, ultra-clean CGI finish, no text, no logos, no people'
  },
  {
    file: 'src/pages/index.astro',
    line: 256,
    alt: 'Patrick Rea',
    section: 'Authority Section - ABM Prospector Leadership',
    prompt: '3D isometric professional achievement scene with abstract award podium, rising graph lines, and excellence symbols, glossy blue and violet materials with gold accent highlights, glass trophy-like elements with reflections, volumetric lighting, corporate futuristic aesthetic, balanced composition with negative space for overlay text, no text, no logos, no people'
  },
  {
    file: 'src/pages/index.astro',
    line: 354,
    alt: 'Future of B2B Revenue',
    prompt: '3D isometric future cityscape or tech horizon, abstract geometric structures rising upward representing growth and transformation, cool blue and teal tones with purple sky gradient, glass-like buildings with reflections, volumetric light rays, soft depth of field, futuristic corporate aesthetic, wide negative space for text overlay, ultra-clean CGI, no text, no logos, no people'
  },

  // about.astro images
  {
    file: 'src/pages/about.astro',
    line: 50,
    alt: 'Patrick Rea FCIM',
    section: 'Patrick Rea Profile - CIM ABM Course Director',
    prompt: '3D isometric professional excellence scene with abstract educational symbols, certification badges floating in space, knowledge network connections, glossy blue and violet with gold accents, glass-like materials with subtle reflections, volumetric lighting creating professional ambiance, corporate futuristic style, negative space on left for text, no text, no logos, no people'
  },
  {
    file: 'src/pages/about.astro',
    line: 99,
    alt: 'Team Strategy Session',
    section: 'Our Philosophy - ABM Transformation',
    prompt: '3D isometric strategic planning environment with floating abstract strategy elements, interconnected nodes showing alignment and collaboration, cool blue and teal tones with warm accent glows, glass conference table with holographic projections, soft lighting, futuristic corporate aesthetic, balanced composition with negative space, no text, no logos, no people'
  },
  {
    file: 'src/pages/about.astro',
    line: 172,
    alt: 'Client Success',
    section: 'Client Success Stories - Trusted by Leading B2B Teams',
    prompt: '3D isometric success and growth visualization, rising charts and positive metrics floating in space, achievement symbols and celebration elements, glossy CGI with cool blue and violet tones plus warm gold success highlights, glass-like materials with reflections, volumetric lighting, corporate futuristic style, negative space for text overlay, no text, no logos, no people'
  }
];

// Function to generate a single image
async function generateImage(definition, index) {
  console.log(`\n[${index + 1}/${imageDefinitions.length}] Generating: ${definition.section}`);
  console.log(`Prompt: ${definition.prompt.substring(0, 100)}...`);

  try {
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: definition.prompt,
        image_size: {
          width: 1792,
          height: 1024
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

      return {
        ...definition,
        generatedUrl: imageUrl
      };
    } else {
      console.error(`  ✗ No image generated`);
      return null;
    }
  } catch (error) {
    console.error(`  ✗ Error generating image: ${error.message}`);
    return null;
  }
}

// Main execution
async function main() {
  console.log('='.repeat(80));
  console.log('ABM Prospector Image Generation');
  console.log('Using Fal AI SeeD Dream v4');
  console.log('='.repeat(80));

  if (!process.env.FAL_KEY) {
    console.error('\n❌ Error: FAL_KEY environment variable not set');
    console.error('Please set your Fal API key: export FAL_KEY="your-key-here"');
    process.exit(1);
  }

  const results = [];

  // Generate all images
  for (let i = 0; i < imageDefinitions.length; i++) {
    const result = await generateImage(imageDefinitions[i], i);
    if (result) {
      results.push(result);
    }

    // Add a small delay between requests to avoid rate limiting
    if (i < imageDefinitions.length - 1) {
      console.log('  Waiting 2 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Save results to a JSON file
  const outputFile = path.join(__dirname, 'generated-images.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log(`✓ Generation complete! ${results.length}/${imageDefinitions.length} images generated`);
  console.log(`Results saved to: ${outputFile}`);
  console.log('='.repeat(80));

  // Print summary
  console.log('\nImage URLs:');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.section}`);
    console.log(`   File: ${result.file}:${result.line}`);
    console.log(`   URL: ${result.generatedUrl}`);
  });

  console.log('\n\nNext steps:');
  console.log('1. Review the generated images at the URLs above');
  console.log('2. Download and save them to public/images/ directory');
  console.log('3. Update the image src attributes in the relevant .astro files');
}

main().catch(console.error);
