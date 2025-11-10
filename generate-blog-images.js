import * as fal from "@fal-ai/serverless-client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
config();

// Configure Fal AI
const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("Error: FAL_KEY not found in environment variables");
  console.error("Please make sure .env file exists and contains FAL_KEY");
  process.exit(1);
}

console.log(`Using FAL_KEY: ${FAL_KEY.substring(0, 20)}...`);

fal.config({
  credentials: FAL_KEY,
});

// Blog post metadata for image generation
const blogPosts = [
  {
    file: "abm-ai-how-to-use-it.md",
    title: "ABM+AI - How to use it",
    prompt: "Professional business illustration showing AI technology integrated with account-based marketing, modern office setting with digital interfaces, LinkedIn social media elements, blue and purple gradient, clean minimal style, high quality digital art",
  },
  {
    file: "abm-fails-when-sales-arent-in-the-room.md",
    title: "ABM fails when sales aren't in the room",
    prompt: "Business meeting room with empty chairs, split screen showing marketing team on one side and sales team absent on other side, symbolizing misalignment, professional corporate art style, muted colors",
  },
  {
    file: "abmers-using-ai.md",
    title: "ABMers using AI",
    prompt: "Modern B2B marketer using AI tools on laptop, futuristic digital interfaces floating around, data visualization, professional business environment, blue tech aesthetic, high quality illustration",
  },
  {
    file: "account-churn-prediction.md",
    title: "Account churn prediction",
    prompt: "Abstract data visualization with flowing lines and curves representing customer retention, gradient colors from red to green, modern minimal illustration, NO TEXT, clean professional style",
  },
  {
    file: "achieving-thought-leadership.md",
    title: "Achieving thought leadership",
    prompt: "Professional speaker on stage with audience, spotlight effect, sharing expertise and insights, modern conference setting, inspiring atmosphere, blue and gold tones, premium business illustration",
  },
  {
    file: "ai-abm-top-10-insights.md",
    title: "AI+ABM top 10 insights",
    prompt: "AI brain with glowing neural networks connected to abstract marketing symbols, flowing data streams, lightbulbs representing insights, NO TEXT OR NUMBERS, modern tech aesthetic, blue and purple gradient",
  },
  {
    file: "appearing-in-ai-searches.md",
    title: "Appearing in AI searches",
    prompt: "Abstract search beam spotlight shining on glowing orb or node, AI network connections in background, visibility and discovery concept, NO TEXT, modern tech illustration, blue and white palette with glowing effects",
  },
  {
    file: "b2b-marketing-missing-valuable-targets.md",
    title: "B2B marketing missing valuable targets",
    prompt: "Target dartboard with some arrows missing the mark, business professionals in background, opportunity concept, professional business illustration, red and blue color scheme",
  },
  {
    file: "breaking-through-abm-planning-paradox.md",
    title: "Breaking through ABM planning paradox",
    prompt: "Maze or labyrinth with clear path emerging through complexity, lightbulb moment, strategic planning concept, modern minimal illustration, purple and teal gradient",
  },
  {
    file: "buyer-journey-complete-before-sales.md",
    title: "Buyer journey complete before sales",
    prompt: "Glowing ascending pathway with abstract milestone orbs and glowing checkpoints, business person at computer researching, another professional figure at the end of path, modern B2B illustration without any text or labels, blue gradient professional style",
  },
  {
    file: "data-vs-intelligence.md",
    title: "Data vs Intelligence",
    prompt: "Split composition with abstract data symbols (geometric shapes, flowing particles) on left transforming into glowing brain with lightbulb on right, NO TEXT, modern business illustration, blue and orange gradient",
  },
  {
    file: "fresh-abm-ai-insights.md",
    title: "Fresh ABM+AI insights",
    prompt: "Fresh modern take on traditional marketing, AI innovation symbols, light bulb moments, clean contemporary business illustration, bright vibrant colors, optimistic tech aesthetic",
  },
  {
    file: "future-of-b2b-marketing-abm-ai.md",
    title: "The Future of B2B Marketing: ABM+AI",
    prompt: "Futuristic B2B marketing landscape with AI elements, holographic interfaces, strategic crossroads, forward-looking perspective, premium corporate illustration, blue and silver tones",
  },
  {
    file: "get-the-rest-of-the-team-on-board.md",
    title: "Get the rest of the team on board",
    prompt: "Business team coming together, collaborative meeting, alignment and unity concept, people joining hands or gathering around table, warm professional illustration, team colors",
  },
  {
    file: "gtm-plan-complexity-vs-actionable.md",
    title: "GTM plan complexity vs actionable",
    prompt: "Complex tangled plan on left side transforming into simple clear roadmap on right side, simplification concept, professional business strategy illustration, contrasting visual clarity",
  },
  {
    file: "how-abmers-position-as-thought-leaders.md",
    title: "How ABMers position as thought leaders",
    prompt: "Marketing professional elevated on platform sharing knowledge, spotlight and audience, authority and expertise concept, modern conference aesthetic, inspiring professional style",
  },
  {
    file: "how-to-do-abm-quick-guide.md",
    title: "How to do ABM - quick guide",
    prompt: "Ascending staircase or progressive pathway with glowing milestone markers, upward arrow, journey to success concept, NO TEXT OR NUMBERS, modern clean illustration, blue and green gradient",
  },
  {
    file: "is-your-approach-on-time.md",
    title: "Is your approach on time",
    prompt: "Clock or hourglass with business strategy elements, timing and opportunity window concept, professional urgency illustration, modern clean design, blue and amber tones",
  },
  {
    file: "juggling-abm-accounts.md",
    title: "Juggling ABM accounts",
    prompt: "Business person juggling multiple account symbols or company logos, balance and management concept, professional illustration, dynamic motion, multi-colored objects",
  },
  {
    file: "knowledge-action-gap.md",
    title: "Knowledge action gap",
    prompt: "Bridge spanning gap between knowledge (books, learning) on one side and action (execution, results) on other side, professional business metaphor, clean modern illustration",
  },
  {
    file: "public-vs-in-house-abm-training.md",
    title: "Public vs in-house ABM training",
    prompt: "Split comparison of classroom training versus corporate internal training, professional development concept, modern educational illustration, balanced composition",
  },
  {
    file: "resonating-with-target-accounts.md",
    title: "Resonating with target accounts",
    prompt: "Sound waves or ripple effect connecting with target accounts, resonance and harmony concept, modern B2B illustration, vibrant energy waves, blue and purple gradient",
  },
  {
    file: "saas-abm-sales-forecast-problem.md",
    title: "SaaS ABM sales forecast problem",
    prompt: "Abstract diverging paths or misaligned arrows, prediction concept with crystal ball and question marks, forecast uncertainty visualization, NO TEXT, modern minimal style, red and blue contrast",
  },
  {
    file: "three-things-killing-abm-programmes.md",
    title: "Three things killing ABM programmes",
    prompt: "Three warning symbols or obstacles blocking ABM success, professional business illustration, warning aesthetic, red and black with white background, clear visual hierarchy",
  },
  {
    file: "two-page-gtm-plan.md",
    title: "Two page GTM plan",
    prompt: "Simple elegant two-page document layout, minimalist strategy plan, clean professional design, emphasis on simplicity and clarity, modern business aesthetic",
  },
  {
    file: "why-arent-they-buying.md",
    title: "Why aren't they buying",
    prompt: "Question mark over shopping cart or purchase decision, buyer hesitation concept, professional B2B sales illustration, thoughtful contemplative mood, blue and grey tones",
  },
  {
    file: "why-marketing-plans-dont-work.md",
    title: "Why marketing plans don't work",
    prompt: "Broken or crumbling marketing plan document, failure analysis, professional business illustration, contrast between planning and execution, dramatic lighting",
  },
];

// Function to download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if error
        reject(err);
      });
  });
}

// Function to generate image using Fal AI
async function generateImage(prompt, outputPath) {
  try {
    console.log(`Generating image with prompt: ${prompt.substring(0, 60)}...`);

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        image_size: "landscape_16_9",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`  Progress: ${update.logs[update.logs.length - 1]?.message || "Processing..."}`);
        }
      },
    });

    if (result.images && result.images.length > 0) {
      const imageUrl = result.images[0].url;
      console.log(`  Downloading image to ${outputPath}`);
      await downloadImage(imageUrl, outputPath);
      console.log(`  ✓ Successfully generated image`);
      return outputPath;
    } else {
      throw new Error("No image URL in response");
    }
  } catch (error) {
    console.error(`  ✗ Error generating image: ${error.message}`);
    throw error;
  }
}

// Function to update markdown file with image path
async function updateMarkdownFile(filePath, imagePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const imageFileName = path.basename(imagePath);
  const relativePath = `~/assets/images/blog/${imageFileName}`;

  // Replace image field - handles empty strings, existing paths, and malformed paths
  const updatedContent = content.replace(/image:\s*"[^"]*"[^"\n]*/g, `image: "${relativePath}"`);

  fs.writeFileSync(filePath, updatedContent, "utf8");
  console.log(`  Updated ${path.basename(filePath)} with image path`);
}

// Main function
async function main() {
  console.log("Starting blog image generation...\n");

  // Ensure output directory exists
  const imagesDir = path.join(__dirname, "src", "assets", "images", "blog");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`Created directory: ${imagesDir}\n`);
  }

  let successCount = 0;
  let failCount = 0;

  // Process each blog post
  for (const post of blogPosts) {
    console.log(`\nProcessing: ${post.title}`);
    console.log("─".repeat(60));

    try {
      const imageFileName = post.file.replace(".md", ".jpg");
      const imagePath = path.join(imagesDir, imageFileName);

      // Skip if image already exists
      if (fs.existsSync(imagePath)) {
        console.log(`  ⊘ Image already exists, skipping generation`);

        // Still update the markdown file
        const mdPath = path.join(__dirname, "src", "data", "post", post.file);
        await updateMarkdownFile(mdPath, imagePath);
        successCount++;
        continue;
      }

      // Generate image
      await generateImage(post.prompt, imagePath);

      // Update markdown file
      const mdPath = path.join(__dirname, "src", "data", "post", post.file);
      await updateMarkdownFile(mdPath, imagePath);

      successCount++;

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ✗ Failed to process ${post.file}: ${error.message}`);
      failCount++;
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log(`Image generation complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log("═".repeat(60));
}

// Run the script
main().catch(console.error);
