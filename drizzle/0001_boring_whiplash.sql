CREATE TABLE `flights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(64) NOT NULL,
	`sourceId` varchar(255) NOT NULL,
	`fromCity` varchar(100) NOT NULL,
	`toCity` varchar(100) NOT NULL,
	`departureDate` timestamp NOT NULL,
	`returnDate` timestamp,
	`price` int NOT NULL,
	`originalPrice` int,
	`discountPercent` int DEFAULT 0,
	`airline` varchar(100),
	`stops` int DEFAULT 0,
	`duration` varchar(50),
	`rating` int DEFAULT 45,
	`imageUrl` text,
	`affiliateUrl` text NOT NULL,
	`isFeatured` int DEFAULT 0,
	`remainingSeats` int DEFAULT 10,
	`seatsUpdatedAt` timestamp DEFAULT (now()),
	`discountUpdatedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offer_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`flightId` int NOT NULL,
	`viewCount` int DEFAULT 0,
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offer_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`flightId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`)
);
