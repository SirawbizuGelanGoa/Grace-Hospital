import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { revalidateTag } from 'next/cache';
import { existsSync } from 'fs';
import { join } from 'path';

export async function POST() {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    let cleanedCount = 0;
    const cleanupResults = [];

    // Check hero slides
    const heroSlides = await query('SELECT id, src FROM hero_slides WHERE src LIKE "/uploads/%"') as any[];
    for (const slide of heroSlides) {
      const filePath = join(process.cwd(), 'public', slide.src);
      if (!existsSync(filePath)) {
        await query('UPDATE hero_slides SET src = NULL WHERE id = ?', [slide.id]);
        cleanedCount++;
        cleanupResults.push(`Hero slide ${slide.id}: removed missing image reference`);
      }
    }

    // Check about content
    const aboutContent = await query('SELECT id, imageUrl FROM about_content WHERE imageUrl LIKE "/uploads/%"') as any[];
    for (const content of aboutContent) {
      const filePath = join(process.cwd(), 'public', content.imageUrl);
      if (!existsSync(filePath)) {
        await query('UPDATE about_content SET imageUrl = NULL WHERE id = ?', [content.id]);
        cleanedCount++;
        cleanupResults.push(`About content ${content.id}: removed missing image reference`);
      }
    }

    // Check facilities
    const facilities = await query('SELECT id, imageUrl FROM facilities WHERE imageUrl LIKE "/uploads/%"') as any[];
    for (const facility of facilities) {
      const filePath = join(process.cwd(), 'public', facility.imageUrl);
      if (!existsSync(filePath)) {
        await query('UPDATE facilities SET imageUrl = NULL WHERE id = ?', [facility.id]);
        cleanedCount++;
        cleanupResults.push(`Facility ${facility.id}: removed missing image reference`);
      }
    }

    // Check departments
    const departments = await query('SELECT id, headOfDepartmentImage FROM departments WHERE headOfDepartmentImage LIKE "/uploads/%"') as any[];
    for (const dept of departments) {
      const filePath = join(process.cwd(), 'public', dept.headOfDepartmentImage);
      if (!existsSync(filePath)) {
        await query('UPDATE departments SET headOfDepartmentImage = NULL WHERE id = ?', [dept.id]);
        cleanedCount++;
        cleanupResults.push(`Department ${dept.id}: removed missing image reference`);
      }
    }

    // Check news events
    const newsEvents = await query('SELECT id, image FROM news_events WHERE image LIKE "/uploads/%"') as any[];
    for (const news of newsEvents) {
      const filePath = join(process.cwd(), 'public', news.image);
      if (!existsSync(filePath)) {
        await query('UPDATE news_events SET image = NULL WHERE id = ?', [news.id]);
        cleanedCount++;
        cleanupResults.push(`News event ${news.id}: removed missing image reference`);
      }
    }

    // Check gallery items
    const galleryItems = await query('SELECT id, src FROM gallery_items WHERE src LIKE "/uploads/%"') as any[];
    for (const item of galleryItems) {
      const filePath = join(process.cwd(), 'public', item.src);
      if (!existsSync(filePath)) {
        await query('UPDATE gallery_items SET src = NULL WHERE id = ?', [item.id]);
        cleanedCount++;
        cleanupResults.push(`Gallery item ${item.id}: removed missing image reference`);
      }
    }

    // Check site settings
    const siteSettings = await query('SELECT id, logoUrl FROM site_settings WHERE logoUrl LIKE "/uploads/%"') as any[];
    for (const settings of siteSettings) {
      const filePath = join(process.cwd(), 'public', settings.logoUrl);
      if (!existsSync(filePath)) {
        await query('UPDATE site_settings SET logoUrl = NULL WHERE id = ?', [settings.id]);
        cleanedCount++;
        cleanupResults.push(`Site settings ${settings.id}: removed missing logo reference`);
      }
    }

    // Revalidate all caches
    if (cleanedCount > 0) {
      revalidateTag('hero-slides');
      revalidateTag('about-content');
      revalidateTag('facilities');
      revalidateTag('departments');
      revalidateTag('news-events');
      revalidateTag('gallery-items');
      revalidateTag('site-settings');
    }

    return NextResponse.json({
      message: `Cleanup completed. ${cleanedCount} missing image references removed.`,
      cleanedCount,
      details: cleanupResults
    });

  } catch (error: any) {
    console.error('Image cleanup error:', error);
    return NextResponse.json({
      message: 'Failed to cleanup missing images',
      error: error.message
    }, { status: 500 });
  }
}
