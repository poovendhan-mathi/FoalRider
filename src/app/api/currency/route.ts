import { NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";

/**
 * GET - Fetch current exchange rates
 * Returns current exchange rates from database with fallback
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServerActionClient();

    const { data, error } = await supabase
      .from("currency_rates")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching currency rates:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch currency rates",
          message: "Unable to retrieve exchange rates from database",
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: "No rates found",
          message: "No active currency rates configured in the system",
          rates: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      rates: data,
      count: data.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("❌ Unexpected error in currency GET:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while fetching currency rates",
      },
      { status: 500 }
    );
  }
}
