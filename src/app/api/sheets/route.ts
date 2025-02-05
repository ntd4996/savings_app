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
      range: `${username}!F2:J`,
    });

    const rows = response.data.values || [];
    const savedDays = rows
      .filter((row) => row[0] && row[4] === "saved")
      .map((row) => parseInt(row[0]));

    return NextResponse.json({ savedDays });
  } catch (error: unknown) {
    console.error(
      "Fetch error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const cookieStore = await cookies();
    const username = cookieStore.get("savings_user")?.value;

    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sheets = await getGoogleSheets();

    // Lấy dữ liệu hiện tại để tìm dòng trống tiếp theo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${username}!F:J`,
    });

    const rows = response.data.values || [];
    const nextRow = rows.length + 1; // +1 vì rows bao gồm cả header

    // Thêm dữ liệu vào dòng trống tiếp theo
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${username}!F${nextRow}:J${nextRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            data.day,
            data.date,
            data.amount,
            new Date().toISOString(),
            "saved"
          ],
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(
      "Save error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { day } = await request.json();
    const cookieStore = await cookies();
    const username = cookieStore.get("savings_user")?.value;

    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sheets = await getGoogleSheets();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${username}!F2:J`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => parseInt(row[0]) === day);

    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${username}!F${rowIndex + 2}:J${rowIndex + 2}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(
      "Delete error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
