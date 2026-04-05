ALTER TABLE `item` MODIFY COLUMN `created_at` timestamp(3) DEFAULT (now());--> statement-breakpoint
ALTER TABLE `item` MODIFY COLUMN `updated_at` timestamp(3) DEFAULT (now());