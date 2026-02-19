import { pelikanCache } from "../server/pelikanCache.js";

async function main() {
  const flights = await pelikanCache.getFlights();
  const vacations = await pelikanCache.getVacations();
  
  console.log(`\n=== Pelikan Cache Stats ===`);
  console.log(`Total flights: ${flights.length}`);
  console.log(`Total vacations: ${vacations.length}`);
  
  console.log(`\n=== First 10 Flight Destinations ===`);
  flights.slice(0, 10).forEach((flight, i) => {
    console.log(`${i + 1}. ${flight.to} (destination: ${flight.destination || 'N/A'})`);
  });
  
  // Group by destination
  const destCounts = new Map<string, number>();
  flights.forEach(f => {
    const dest = f.to?.toLowerCase() || 'unknown';
    destCounts.set(dest, (destCounts.get(dest) || 0) + 1);
  });
  
  console.log(`\n=== Flights by Destination ===`);
  Array.from(destCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([dest, count]) => {
      console.log(`${dest}: ${count} flights`);
    });
}

main().catch(console.error);
