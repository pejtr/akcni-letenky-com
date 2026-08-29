CREATE TABLE IF NOT EXISTS `flight_provider_sync_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(64) NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`finishedAt` timestamp,
	`httpStatus` int,
	`durationMs` int,
	`itemsReceived` int DEFAULT 0,
	`itemsValid` int DEFAULT 0,
	`itemsInserted` int DEFAULT 0,
	`itemsUpdated` int DEFAULT 0,
	`itemsUnchanged` int DEFAULT 0,
	`itemsInvalid` int DEFAULT 0,
	`error` text,
	CONSTRAINT `flight_provider_sync_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `flight_provider_offers` (
	`id` varchar(64) NOT NULL,
	`provider` varchar(64) NOT NULL,
	`externalOfferId` varchar(255) NOT NULL,
	`origin` varchar(10) NOT NULL,
	`destination` varchar(10) NOT NULL,
	`departureDate` timestamp,
	`returnDate` timestamp,
	`price` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CZK',
	`deeplink` text NOT NULL,
	`sourceUpdatedAt` timestamp,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','stale','expired','invalid') NOT NULL DEFAULT 'active',
	`rawPayloadHash` varchar(64) NOT NULL,
	`airline` varchar(100),
	CONSTRAINT `flight_provider_offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `flight_offer_price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` varchar(64) NOT NULL,
	`price` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CZK',
	`observedAt` timestamp NOT NULL DEFAULT (now()),
	`syncRunId` int,
	CONSTRAINT `flight_offer_price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `flight_provider_sync_locks` (
	`provider` varchar(64) NOT NULL,
	`lockedBy` varchar(128) NOT NULL,
	`lockedAt` timestamp NOT NULL DEFAULT (now()),
	`leaseExpiresAt` timestamp NOT NULL,
	CONSTRAINT `flight_provider_sync_locks_provider` PRIMARY KEY(`provider`)
);
