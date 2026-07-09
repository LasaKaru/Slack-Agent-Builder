import { NextResponse } from "next/server";
import { MOCK_DISPUTES } from "@/lib/services";

export async function GET() {
  return NextResponse.json(MOCK_DISPUTES);
}
