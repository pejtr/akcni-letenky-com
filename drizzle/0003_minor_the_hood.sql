CREATE TABLE `chatbot_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`date` timestamp NOT NULL,
	`totalConversations` int DEFAULT 0,
	`activeConversations` int DEFAULT 0,
	`convertedConversations` int DEFAULT 0,
	`abandonedConversations` int DEFAULT 0,
	`totalLeads` int DEFAULT 0,
	`hotLeads` int DEFAULT 0,
	`warmLeads` int DEFAULT 0,
	`coldLeads` int DEFAULT 0,
	`totalConversions` int DEFAULT 0,
	`totalRevenue` int DEFAULT 0,
	`totalCommissions` int DEFAULT 0,
	`fbGroupJoins` int DEFAULT 0,
	`whatsappGroupJoins` int DEFAULT 0,
	`conversionRate` int DEFAULT 0,
	`avgCommissionPerConversation` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatbot_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatbot_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`projectId` varchar(64) NOT NULL,
	`status` enum('active','converted','abandoned') DEFAULT 'active',
	`leadQuality` enum('hot','warm','cold') DEFAULT 'cold',
	`destination` varchar(100),
	`budget` int,
	`travelDate` timestamp,
	`passengers` int DEFAULT 1,
	`email` varchar(320),
	`phone` varchar(20),
	`name` varchar(100),
	`clickedOffer` int DEFAULT 0,
	`joinedCommunity` int DEFAULT 0,
	`converted` int DEFAULT 0,
	`conversionValue` int,
	`messageCount` int DEFAULT 0,
	`lastMessageAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatbot_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `chatbot_conversations_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `chatbot_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`leadId` int,
	`flightId` int,
	`bookingValue` int NOT NULL,
	`commissionRate` int DEFAULT 5,
	`commissionAmount` int NOT NULL,
	`affiliateSource` varchar(100),
	`affiliateClickId` varchar(255),
	`conversionType` enum('flight','hotel','package') DEFAULT 'flight',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatbot_conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatbot_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`name` varchar(100),
	`destination` varchar(100),
	`budget` int,
	`travelDate` timestamp,
	`passengers` int,
	`leadSource` varchar(50) DEFAULT 'chatbot',
	`leadQuality` enum('hot','warm','cold') DEFAULT 'warm',
	`status` enum('new','contacted','converted','lost') DEFAULT 'new',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatbot_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatbot_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`containsOffer` int DEFAULT 0,
	`containsCommunityInvite` int DEFAULT 0,
	`userClicked` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatbot_messages_id` PRIMARY KEY(`id`)
);
