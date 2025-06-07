import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto'; // For generating unique filenames
import { existsSync } from 'fs';

// Define the directory where uploads will be stored relative to project root
// This will work on both Windows and Linux environments
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    // Validate file type - allow both images and videos
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return NextResponse.json({ 
        message: 'Invalid file type. Only images and videos are allowed.' 
      }, { status: 400 });
    }

    // Set file size limits
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
    
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ 
        message: `Image file too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.` 
      }, { status: 400 });
    }
    
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ 
        message: `Video file too large. Maximum size is ${MAX_VIDEO_SIZE / (1024 * 1024)}MB.` 
      }, { status: 400 });
    }

    // Generate a unique filename to prevent overwrites
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${randomUUID()}.${fileExtension}`;
    
    // Create uploads directory relative to project root
    // Use process.cwd() which gives the current working directory (project root in Next.js)
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure the uploads directory exists
    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
        console.log(`Created uploads directory at: ${uploadsDir}`);
      }
    } catch (mkdirError) {
      console.error('Error creating uploads directory:', mkdirError);
      return NextResponse.json({ 
        message: 'Failed to create uploads directory.', 
        error: mkdirError instanceof Error ? mkdirError.message : String(mkdirError) 
      }, { status: 500 });
    }
    
    const filePath = join(uploadsDir, uniqueFilename);

    // Convert file data to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write the file to the specified directory
    await writeFile(filePath, buffer);
    console.log(`File uploaded successfully to: ${filePath}`);

    // Construct the public URL for the uploaded file
    // In Next.js, files in the 'public' directory are served at the root path
    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({ 
      message: 'File uploaded successfully.', 
      url: publicUrl,
      fileType: isImage ? 'image' : 'video',
      fileName: file.name,
      fileSize: file.size
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error uploading file:', error);
    
    // Handle specific errors like file system errors
    if (error.code === 'ENOENT' || error.code === 'EACCES') {
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        console.error(`Filesystem error: Check if directory ${uploadsDir} exists and has write permissions.`);
        return NextResponse.json({ 
          message: 'Server error during file upload (filesystem issue).', 
          error: error.message,
          details: `Please ensure the directory ${uploadsDir} exists and has write permissions.`
        }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to upload file.', 
      error: error.message 
    }, { status: 500 });
  }
}

