import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, "src", "data", "post");
const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

console.log(`Fixing image paths in ${files.length} markdown files...\n`);

let fixedCount = 0;

files.forEach((file) => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Check if file has malformed image path
  const imageMatch = content.match(/image:\s*"([^"]+)"/);

  if (imageMatch) {
    const currentPath = imageMatch[1];

    // Only fix if path has issues (multiple paths, extra quotes, etc.)
    if (
      currentPath.includes('"') ||
      content.includes('image: "~/assets/images/blog/') === false ||
      /image:\s*"[^"]*"[^"\n]+/.test(content)
    ) {
      // Extract just the filename
      const filename = file.replace(".md", ".jpg");
      const correctPath = `~/assets/images/blog/${filename}`;

      // Replace entire image line
      const newContent = content.replace(/image:\s*"[^"]*"[^\n]*/g, `image: "${correctPath}"`);

      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`✓ Fixed: ${file}`);
      fixedCount++;
    }
  }
});

console.log(`\nFixed ${fixedCount} files`);
