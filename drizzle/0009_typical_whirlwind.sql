CREATE TABLE `ab_test_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`testName` varchar(100) NOT NULL,
	`variant` varchar(50) NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ab_test_assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `ab_test_assignments_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `ab_test_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`testName` varchar(100) NOT NULL,
	`variant` varchar(50) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`eventData` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ab_test_events_id` PRIMARY KEY(`id`)
);
