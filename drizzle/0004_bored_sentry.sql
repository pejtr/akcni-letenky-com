CREATE TABLE `affiliate_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destination` varchar(100) NOT NULL,
	`destinationSlug` varchar(100) NOT NULL,
	`source` varchar(50) NOT NULL,
	`affiliatePartner` varchar(50) DEFAULT 'kiwi',
	`affiliateUrl` text NOT NULL,
	`userAgent` text,
	`referrer` text,
	`ipCountry` varchar(2),
	`sessionId` varchar(64),
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
