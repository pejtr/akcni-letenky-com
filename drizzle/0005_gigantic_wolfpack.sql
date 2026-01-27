CREATE TABLE `chatbot_user_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`preferredDestinations` text,
	`preferredBudget` int,
	`preferredTravelStyle` varchar(50),
	`preferredAirlines` text,
	`travelFrequency` varchar(50),
	`lastDestinationAsked` varchar(100),
	`lastBudgetMentioned` int,
	`lastTravelDate` timestamp,
	`lastPassengerCount` int,
	`totalConversations` int DEFAULT 0,
	`totalMessages` int DEFAULT 0,
	`lastInteractionAt` timestamp DEFAULT (now()),
	`conversationSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatbot_user_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_base` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('flight','destination','article','faq','airline') NOT NULL,
	`contentId` int,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`keywords` text,
	`metadata` text,
	`searchVector` text,
	`relevanceScore` int DEFAULT 0,
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledge_base_id` PRIMARY KEY(`id`)
);
