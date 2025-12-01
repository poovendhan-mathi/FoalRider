import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // Example: allow all requests (customize as needed)
  return NextResponse.next();
}
