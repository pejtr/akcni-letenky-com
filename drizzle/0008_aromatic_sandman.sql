CREATE TABLE `email_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`subject` varchar(200) NOT NULL,
	`preheader` varchar(200),
	`htmlContent` text NOT NULL,
	`textContent` text,
	`personaVariant` varchar(50),
	`segmentTarget` varchar(50),
	`sequenceOrder` int DEFAULT 1,
	`delayDays` int DEFAULT 0,
	`isActive` int DEFAULT 1,
	`totalSent` int DEFAULT 0,
	`totalOpened` int DEFAULT 0,
	`totalClicked` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailCaptureId` int NOT NULL,
	`campaignId` int NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`status` varchar(20) DEFAULT 'pending',
	`sentAt` timestamp,
	`errorMessage` text,
	`opened` int DEFAULT 0,
	`openedAt` timestamp,
	`clicked` int DEFAULT 0,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_score_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailCaptureId` int NOT NULL,
	`previousScore` int DEFAULT 0,
	`newScore` int NOT NULL,
	`reason` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_score_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remarketing_triggers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailCaptureId` int NOT NULL,
	`triggerType` varchar(50) NOT NULL,
	`triggerDate` timestamp NOT NULL,
	`status` varchar(20) DEFAULT 'pending',
	`triggeredAt` timestamp,
	`contextData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remarketing_triggers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `email_captures` ADD `leadScore` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_captures` ADD `leadTier` varchar(20) DEFAULT 'cold';--> statement-breakpoint
ALTER TABLE `email_captures` ADD `converted` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_captures` ADD `convertedAt` timestamp;