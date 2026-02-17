import { generateFlightArticle } from "./server/blogGenerator.ts";

console.log("Testing blog article generation...");

const result = await generateFlightArticle({
  destination: "Barcelona",
  destinationSlug: "barcelona",
  price: 1200,
  currency: "CZč",
  airline: "Ryanair",
});

console.log("Generated article:");
console.log("Title:", result.title);
console.log("Slug:", result.slug);
console.log("Excerpt:", result.excerpt.substring(0, 100) + "...");
console.log("Category:", result.category);
console.log("Tags:", result.tags.join(", "));
console.log("Featured Image:", result.featuredImage);
console.log("\nContent preview:", result.content.substring(0, 200) + "...");
