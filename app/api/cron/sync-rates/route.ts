import { syncExchangeRates } from "@/app/actions/admin-actions";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await syncExchangeRates();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to sync exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to sync exchange rates" },
      { status: 500 }
    );
  }
} 