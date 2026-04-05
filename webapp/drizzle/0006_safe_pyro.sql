CREATE TABLE `barcode` (
	`id` varchar(36) NOT NULL,
	`code` varchar(255) NOT NULL,
	`consumed` boolean DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`item_id` varchar(36),
	CONSTRAINT `barcode_id` PRIMARY KEY(`id`),
	CONSTRAINT `barcode_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `item` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`state` varchar(30) NOT NULL,
	`category` varchar(30) NOT NULL,
	`meat` varchar(30),
	`seafood` varchar(30),
	`quantity` int,
	`barcode_prefix` varchar(30) NOT NULL,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `item_id` PRIMARY KEY(`id`),
	CONSTRAINT `item_name_unique` UNIQUE(`name`),
	CONSTRAINT `item_barcode_prefix_unique` UNIQUE(`barcode_prefix`)
);
--> statement-breakpoint
ALTER TABLE `barcode` ADD CONSTRAINT `barcode_item_id_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `item_name_idx` ON `item` (`name`);--> statement-breakpoint
CREATE INDEX `item_barcode_prefix_idx` ON `item` (`barcode_prefix`);