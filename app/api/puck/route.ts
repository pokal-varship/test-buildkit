import { NextRequest, NextResponse } from "next/server";
import { Data } from "@measured/puck";
import fs from "fs";
import path from "path";

const databasePath = path.join(process.cwd(), "database.json");
const draftDatabasePath = path.join(process.cwd(), "database-drafts.json");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagePath = searchParams.get('path');
    const isDraft = searchParams.get('draft') === 'true';
    const listAll = searchParams.get('list') === 'true';

    // Choose the appropriate database based on draft flag
    const dbPath = isDraft ? draftDatabasePath : databasePath;
    
    // Read existing data
    let database: Record<string, Data> = {};
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, "utf-8");
      database = JSON.parse(fileContent);
    }

    // If list=true, return all pages
    if (listAll) {
      return NextResponse.json(database);
    }

    // If no path provided, return error
    if (!pagePath) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    // Get the page data
    const pageData = database[pagePath];

    if (!pageData) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: pageData });
  } catch {

    return NextResponse.json(
      { error: "Failed to read page data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data, path: pagePath, isDraft, publishFromDraft }: { 
      data: Data; 
      path: string; 
      isDraft?: boolean;
      publishFromDraft?: boolean;
    } = await request.json();

    if (publishFromDraft) {
      // Publish from draft: take latest draft and make it live
      let draftDatabase: Record<string, Data> = {};
      if (fs.existsSync(draftDatabasePath)) {
        const draftFileContent = fs.readFileSync(draftDatabasePath, "utf-8");
        draftDatabase = JSON.parse(draftFileContent);
      }

      const draftData = draftDatabase[pagePath];
      if (!draftData) {
        return NextResponse.json(
          { error: "No draft found to publish" },
          { status: 404 }
        );
      }

      // Read existing live data
      let liveDatabase: Record<string, Data> = {};
      if (fs.existsSync(databasePath)) {
        const liveFileContent = fs.readFileSync(databasePath, "utf-8");
        liveDatabase = JSON.parse(liveFileContent);
      }

      // Update live database with draft data
      liveDatabase[pagePath] = draftData;

      // Save to live database
      fs.writeFileSync(databasePath, JSON.stringify(liveDatabase, null, 2));

      return NextResponse.json({ success: true, message: "Draft published live successfully" });
    }

    // Choose the appropriate database based on draft flag
    const dbPath = isDraft ? draftDatabasePath : databasePath;
    
    // Read existing data
    let database: Record<string, Data> = {};
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, "utf-8");
      database = JSON.parse(fileContent);
    }

    // Update the page data
    database[pagePath] = data;

    // Save to appropriate database
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

    const message = isDraft ? "Draft saved successfully" : "Page published successfully";
    return NextResponse.json({ success: true, message });
  } catch {

    return NextResponse.json(
      { error: "Failed to save page data" },
      { status: 500 }
    );
  }
} 