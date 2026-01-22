import { generateDailyArticles } from "./server/articleGenerator.js";

console.log("Generating test articles...\n");

try {
  await generateDailyArticles();
  console.log("\n✅ Test articles generated successfully!");
  process.exit(0);
} catch (error) {
  console.error("\n❌ Error generating articles:", error);
  process.exit(1);
}
