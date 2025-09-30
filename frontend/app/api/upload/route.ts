import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // 本来ならここでファイル保存処理をする
  return NextResponse.json({
    message: "ファイルを受け取りました",
    filename: file.name,
    size: file.size,
  });
}

