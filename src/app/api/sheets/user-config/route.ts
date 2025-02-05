import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  console.error("Missing env:", {
    SPREADSHEET_ID,
    GOOGLE_CLIENT_EMAIL: !!GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY: !!GOOGLE_PRIVATE_KEY,
  });
  throw new Error("Server configuration error");
}

async function getAuthClient() {
  const auth = new JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

async function getGoogleSheets() {
  const auth = await getAuthClient();
  return google.sheets({ version: "v4", auth });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const username = cookieStore.get("savings_user")?.value;

    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sheets = await getGoogleSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${username}!A2:D2`,
    });

    if (!response.data.values?.[0]) {
      return NextResponse.json({ error: "No config found" }, { status: 404 });
    }

    const [startDate, endDate, targetAmount] = response.data.values[0];

    return NextResponse.json({
      startDate,
      endDate,
      targetAmount: parseInt(targetAmount),
    });
  } catch (error) {
    console.error("Config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}
