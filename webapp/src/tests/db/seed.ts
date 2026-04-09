import { item } from "$lib/server/db/schema"
import * as schema from "$lib/server/db/schema"
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from "dotenv";
dotenv.config();

const mockedItems = [
    { name: "Raw Ground Beef", state: "raw", category: "meat", meat:"beef" , date: "2017-10-10", quantity: 5, barcodePrefix: "RGB"},
    { name: "Raw Chicken Thigh", state: "raw", category: "meat", meat: "chicken", date: "2018-10-10", quantity: 0, barcodePrefix: "RCT"},
    { name: "Mexican Ground Beef", state: "cooked", category: "meat", meat: "beef", date: "2019-10-10", quantity: 1, barcodePrefix: "MGB"},
    { name: "Cajun Chicken Thigh", state: "cooked", category: "meat", meat: "chicken", date: "2020-10-10", quantity: 9, barcodePrefix: "CCT"},
    { name: "Jajanmyeun", state: "cooked", category: "meal", date: "2020-10-10", quantity: 6, barcodePrefix: "J"},
    { name: "Minced Garlic", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG"},
    { name: "Minced Garlic1", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG1"},
    { name: "Minced Garlic2", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG2"},
    { name: "Minced Garlic3", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG3"},
    { name: "Minced Garlic4", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG4"},
    { name: "Minced Garlic5", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG5"},
    { name: "Minced Garlic6", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG6"},
    { name: "Minced Garlic7", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG7"},
    { name: "Minced Garlic8", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG8"},
    { name: "Minced Garlic9", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG9"},
    { name: "Minced Garlic10", state: "prepped", category: "ingredient", date: "2020-10-10", quantity: 6, barcodePrefix: "MG10"}
];

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined in .env");
    }
    const client = mysql.createPool(process.env.DATABASE_URL);
    const db = drizzle(client, { schema, mode: 'default' });
    await db.insert(item).values(mockedItems);
    console.log("Items inserted successfully!");
}

// npx tsx .\src\tests\db\seed.ts
await main();