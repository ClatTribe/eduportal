import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportMentors() {
  console.log("Fetching mentors from Supabase...");
  const { data, error } = await supabase.from("mentors").select("*");

  if (error) {
    console.error("Error fetching mentors:", error);
    process.exit(1);
  }

  const outputPath = path.resolve(process.cwd(), "mentors-export.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log(`Successfully exported ${data.length} mentors to mentors-export.json`);
}

exportMentors();
