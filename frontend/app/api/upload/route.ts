import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const caseId = formData.get("case_id") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
      { status: 400 }
    );
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  try {
    const filename = `cases/${caseId}/${Date.now()}-${file.name}`;
    
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Save image reference to database
    const { data: image, error } = await (supabase as any)
      .from("case_images")
      .insert({
        case_id: caseId,
        image_url: blob.url,
        image_type: file.type,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      image: {
        id: image.id,
        url: blob.url,
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
