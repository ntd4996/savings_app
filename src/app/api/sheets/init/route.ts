import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    const sheets = await getGoogleSheets();

    // Kiểm tra xem sheet đã tồn tại chưa
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === username
    );

    // Tạo response object
    const response = NextResponse.json({ success: true });
    
    // Set cookie user
    response.cookies.set("savings_user", username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    if (existingSheet) {
      // Kiểm tra xem sheet có dữ liệu setup không
      const configResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${username}!A2:D2`,
      });

      const hasConfig = configResponse.data.values && configResponse.data.values.length > 0;
      
      if (hasConfig) {
        // Nếu đã có dữ liệu setup thì set thêm cookie setup
        response.cookies.set("savings_setup", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
        });
      }
    } else {
      // Tạo sheet mới nếu chưa tồn tại
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: username,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 10,
                  },
                },
              },
            },
          ],
        },
      });

      // Thêm header cho sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${username}!A1:E1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[
            "StartDate", "EndDate", "TargetAmount", "CreatedAt", "SavedDays"
          ]],
        },
      });

      // Thêm header riêng cho phần lịch sử tiết kiệm
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${username}!F1:J1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[
            "SavedDay", "SavedDate", "SavedAmount", "SavedAt", "Status"
          ]],
        },
      });
    }

    return response;
  } catch (error: unknown) {
    console.error(
      "Init error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to initialize sheet" },
      { status: 500 }
    );
  }
}
