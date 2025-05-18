import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const formData = await request.formData();
	const file = formData.get("file") as File | null;
	const userId = (formData.get("userId") as string) || "current-user-id";
	const id = formData.get("id") as string;

	if (!file) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}

	// Check file type
	const supportedTypes = [
		"text/plain",
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	];

	if (!supportedTypes.includes(file.type)) {
		return NextResponse.json(
			{
				error:
					"Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.",
			},
			{ status: 400 },
		);
	}

	// Check file size (limit to 50MB)
	const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json(
			{
				error: "File too large. Maximum file size is 50MB.",
			},
			{ status: 400 },
		);
	}

	try {
		const supabase = await createClient();

		// 1. Upload file to Supabase Storage
		const fileName = `${Date.now()}-${file.name}`;
		const filePath = `user-files/${userId}/${fileName}`;

		const { error: uploadError } = await supabase.storage
			.from("documents")
			.upload(filePath, file);

		if (uploadError) throw uploadError;

		// Get the public URL
		const { data: publicUrlData } = supabase.storage
			.from("documents")
			.getPublicUrl(filePath);

		const publicUrl = publicUrlData.publicUrl;

		// 2. Create record in the documents table
		const { data: documentRecord, error: dbError } = await supabase
			.from("pdfs")
			.insert({
				id: id,
				name: file.name,
				pdf_url: publicUrl,
        		file_path: filePath,
				file_type: file.type,
				user_id: userId,
				size: file.size,
			})
			.select()
			.single();

		if (dbError) throw dbError;

		return NextResponse.json({
			success: true,
			document: { id: documentRecord.id, name: file.name },
		});
	} catch (error) {
		console.error("Error processing document:", error);
		return NextResponse.json(
			{
				error: "Failed to process document",
			},
			{ status: 500 },
		);
	}
}
