import { addToWatchlist, removeFromWatchlist } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { ticker, name } = await request.json();
  if (!ticker || !name) return NextResponse.json({ error: "ticker and name required" }, { status: 400 });
  await addToWatchlist(ticker.toUpperCase(), name);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const { ticker } = await request.json();
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });
  await removeFromWatchlist(ticker.toUpperCase());
  return NextResponse.json({ ok: true });
}
