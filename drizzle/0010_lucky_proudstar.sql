CREATE TABLE `browsing_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`destination` varchar(100) NOT NULL,
	`destinationSlug` varchar(100) NOT NULL,
	`price` int,
	`viewDuration` int,
	`source` varchar(50),
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `browsing_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`destination` varchar(100) NOT NULL,
	`destinationSlug` varchar(100) NOT NULL,
	`currentPrice` int NOT NULL,
	`targetPrice` int,
	`alertThreshold` int DEFAULT 10,
	`isActive` int DEFAULT 1,
	`lastCheckedPrice` int,
	`lastNotifiedAt` timestamp,
	`notificationCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destination` varchar(100) NOT NULL,
	`destinationSlug` varchar(100) NOT NULL,
	`price` int NOT NULL,
	`source` varchar(50) DEFAULT 'pelikan',
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shareCode` varchar(20) NOT NULL,
	`platform` varchar(30) NOT NULL,
	`destination` varchar(100),
	`destinationSlug` varchar(100),
	`pageUrl` text,
	`referrerEmail` varchar(320),
	`referralClicks` int DEFAULT 0,
	`referralConversions` int DEFAULT 0,
	`discountCode` varchar(20),
	`discountUsed` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_shares_id` PRIMARY KEY(`id`),
	CONSTRAINT `social_shares_shareCode_unique` UNIQUE(`shareCode`)
);
