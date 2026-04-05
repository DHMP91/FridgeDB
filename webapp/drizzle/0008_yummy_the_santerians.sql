ALTER TABLE `barcode` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `barcode` MODIFY COLUMN `item_id` int;--> statement-breakpoint
ALTER TABLE `item` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;