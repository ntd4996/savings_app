import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

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

export async function POST(request: Request) {
  try {
    const { startDate, endDate, targetAmount } = await request.json();
    const cookieStore = await cookies();
    const username = cookieStore.get("savings_user")?.value;

    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sheets = await getGoogleSheets();

    // Lưu thông tin cấu hình vào sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${username}!A2:D2`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[startDate, endDate, targetAmount, new Date().toISOString()]],
      },
    });

    // Không cần tạo header nữa vì đã được tạo trong init
    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("savings_setup", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error("Setup error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to save setup" }, { status: 500 });
  }
} 