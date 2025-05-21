
# Backend Data Schema for Supabase (Based on Admin Panel)

This document outlines the data structures used in the admin panel, which can serve as a basis for creating your Supabase schema.

**General Notes:**

*   **IDs**: Each main record (e.g., a Service, a Gallery Item) has an `id`. Supabase typically handles primary keys automatically (often as `id` of type `uuid` or `bigint`).
*   **Timestamps**: Supabase can automatically add `created_at` and `updated_at` timestamps to your tables. These are not explicitly listed below but are highly recommended.
*   **File Uploads (Images/Videos)**: Fields like `imageUrl`, `logoUrl`, `headOfDepartmentImage`, `src` (for gallery items), `image` (for news) would typically store a URL pointing to a file in Supabase Storage. The admin panel handles the Data URI temporarily for upload, but the backend should process this, upload to storage, and save the URL.
*   **Optional Fields**: Indicated with `?` in TypeScript types, meaning they can be `null` or not present in the database.
*   **Text vs. Varchar**: For string fields, consider `TEXT` for longer descriptions and `VARCHAR(length)` for shorter, constrained strings in SQL.
*   **Enums**: Fields like `GalleryItem.type` can be implemented as `ENUM` types in PostgreSQL (Supabase's underlying database) or as `TEXT` with check constraints.

---

## 1. Site Settings

Corresponds to general site configuration. This might be a single row in a `site_settings` table or a JSONB column in a general app configuration table.

*   **`hospitalName`**: `TEXT` (or `VARCHAR`) - Min 3 characters.
    *   *Constraint: NOT NULL*
*   **`logoUrl`**: `TEXT` (URL to image in Supabase Storage) - Optional.
    *   *Validation: Must be a valid URL if provided.*
*   **`facebookUrl`**: `TEXT` (URL) - Optional.
    *   *Validation: Must be a valid URL if provided.*
*   **`tiktokUrl`**: `TEXT` (URL) - Optional.
    *   *Validation: Must be a valid URL if provided.*
*   **`telegramUrl`**: `TEXT` (URL) - Optional.
    *   *Validation: Must be a valid URL if provided.*

---

## 2. Hero Slides

Represents items in the homepage hero carousel. Table: `hero_slides`.

*   **`id`**: `UUID` or `BIGINT` (Primary Key)
*   **`src`**: `TEXT` (URL to image in Supabase Storage)
    *   *Constraint: NOT NULL. Must be a valid URL.*
*   **`alt`**: `TEXT` (or `VARCHAR(255)`) - Min 5 characters. Alternative text for the image.
    *   *Constraint: NOT NULL*
*   **`hint`**: `VARCHAR(50)` - Optional. AI hint for image search (max 2 words, 50 chars).
*   **`title`**: `VARCHAR(100)` - Optional. Overlay title text.
*   **`subtitle`**: `VARCHAR(200)` - Optional. Overlay subtitle text.
*   **`ctaLink`**: `TEXT` (URL or path) - Optional.
    *   *Validation: Must be a valid URL/path if provided.*
*   **`ctaText`**: `VARCHAR(30)` - Optional. Text for the call-to-action button.
*   **`order` / `position`**: `INTEGER` - Optional but recommended for controlling slide order.

---

## 3. About Content

Content for the "About Us" section. This might be a single row in an `about_content` table.

*   **`title`**: `TEXT` (or `VARCHAR(255)`) - Min 5 characters.
    *   *Constraint: NOT NULL*
*   **`description`**: `TEXT` - Min 20 characters.
    *   *Constraint: NOT NULL*
*   **`mission`**: `TEXT` - Min 10 characters.
    *   *Constraint: NOT NULL*
*   **`vision`**: `TEXT` - Min 10 characters.
    *   *Constraint: NOT NULL*
*   **`imageUrl`**: `TEXT` (URL to image in Supabase Storage) - Optional.
    *   *Validation: Must be a valid URL if provided.*
*   **`imageHint`**: `VARCHAR(50)` - Optional. AI hint for image search (max 2 words).

---

## 4. Services

Represents hospital services. Table: `services`.

*   **`id`**: `UUID` or `BIGINT` (Primary Key)
*   **`name`**: `VARCHAR(255)` - Min 3 characters.
    *   *Constraint: NOT NULL*
*   **`description`**: `VARCHAR(150)` - Short description (card front). Min 10 characters, max 150.
    *   *Constraint: NOT NULL*
*   **`detailedDescription`**: `TEXT` - Detailed description (card back). Min 20 characters.
    *   *Constraint: NOT NULL*
*   **`iconName`**: `VARCHAR(100)` - Name of the Lucide icon.
    *   *Constraint: NOT NULL. Should correspond to a valid Lucide icon.*

---

## 5. Facilities

Represents hospital facilities. Table: `facilities`.

*   **`id`**: `UUID` or `BIGINT` (Primary Key)
*   **`name`**: `VARCHAR(255)` - Min 3 characters.
    *   *Constraint: NOT NULL*
*   **`description`**: `VARCHAR(150)` - Short description (for card). Min 10 characters, max 150.
    *   *Constraint: NOT NULL*
*   **`detailedDescription`**: `TEXT` - Detailed description (for modal). Min 20 characters.
    *   *Constraint: NOT NULL*
*   **`iconName`**: `VARCHAR(100)` - Name of the Lucide icon.
    *   *Constraint: NOT NULL. Should correspond to a valid Lucide icon.*
*   **`imageUrl`**: `TEXT` (URL to image in Supabase Storage) - Optional. Image for the modal.
    *   *Validation: Must be a valid URL if provided.*
*   **`imageHint`**: `VARCHAR(50)` - Optional. AI hint for image search (max 50 chars).

---

## 6. Departments

Represents hospital departments. Table: `departments`.

*   **`id`**: `UUID` or `BIGINT` (Primary Key)
*   **`name`**: `VARCHAR(255)` - Min 3 characters.
    *   *Constraint: NOT NULL*
*   **`description`**: `VARCHAR(150)` - Short description (for accordion trigger). Min 10 characters, max 150.
    *   *Constraint: NOT NULL*
*   **`detailedDescription`**: `TEXT` - Detailed description (for accordion content). Min 20 characters.
    *   *Constraint: NOT NULL*
*   **`iconName`**: `VARCHAR(100)` - Name of the Lucide icon.
    *   *Constraint: NOT NULL. Should correspond to a valid Lucide icon.*
*   **`headOfDepartmentImage`**: `TEXT` (URL to image in Supabase Storage) - Optional.
    *   *Validation: Must be a valid URL if provided.*
*   **`headOfDepartmentImageHint`**: `VARCHAR(50)` - Optional. AI hint (max 50 chars).

---

## 7. Gallery Items

Represents photos and videos in the gallery. Table: `gallery_items`.

*   **`id`**: `UUID` or `BIGINT` (Primary Key)
*   **`type`**: `TEXT` (or `ENUM('photo', 'video')`) - 'photo' or 'video'.
    *   *Constraint: NOT NULL*
*   **`src`**: `TEXT` (URL to image/video in Supabase Storage)
    *   *Constraint: NOT NULL. Must be a valid URL.*
*   **`alt`**: `TEXT` (or `VARCHAR(255)`) - Min 5 characters. Alternative text.
    *   *Constraint: NOT NULL*
*   **`hint`**: `VARCHAR(50)` - Optional. AI hint (max 50 chars).
*   **`order` / `position`**: `INTEGER` - Optional but recommended for controlling gallery order.

---

## 8. News & Events

Represents news articles or event announcements. Table: `news_events`.

*   **`id`**: `UUID` or `BIGINT` (Primary Key)
*   **`title`**: `TEXT` (or `VARCHAR(255)`) - Min 5 characters.
    *   *Constraint: NOT NULL*
*   **`date`**: `DATE` or `TIMESTAMP` - Date of the news/event.
    *   *Constraint: NOT NULL*
*   **`summary`**: `VARCHAR(200)` - Short summary. Min 10 characters, max 200.
    *   *Constraint: NOT NULL*
*   **`fullContent`**: `TEXT` - Full content of the article/event. Min 50 characters.
    *   *Constraint: NOT NULL*
*   **`image`**: `TEXT` (URL to image in Supabase Storage)
    *   *Constraint: NOT NULL. Must be a valid URL.*
*   **`link`**: `VARCHAR(255)` - Unique slug/path for the article (e.g., "/news/my-article-slug").
    *   *Constraint: NOT NULL, UNIQUE. Must start with '/'.*
*   **`hint`**: `VARCHAR(50)` - Optional. AI hint for the image (max 50 chars).

---

## 9. Contact Information

Content for the contact page/section. This might be a single row in a `contact_info` table.

*   **`address`**: `TEXT` - Min 10 characters.
    *   *Constraint: NOT NULL*
*   **`phone`**: `VARCHAR(50)` - Min 10 characters.
    *   *Constraint: NOT NULL. Validation: Valid phone format.*
*   **`email`**: `VARCHAR(255)`
    *   *Constraint: NOT NULL. Validation: Valid email format.*
*   **`mapPlaceholder`**: `TEXT` - Optional. Can store coordinates "lat,lng", a full map embed URL, or placeholder text. The frontend will need logic to interpret this.

---

## 10. Admin Users (Authentication)

This would typically be handled by **Supabase Auth**. You wouldn't create a separate table for this in the same way, but rather manage users through the Supabase Auth system. The fields here are for reference to what `verifyAdminCredentials` used:

*   **`username`**: (Handled by Supabase Auth - usually email)
*   **`password`**: (Handled by Supabase Auth - stored securely as a hash)

---

This schema should give you a comprehensive starting point for your Supabase backend. Remember to adapt it based on the specific needs and features of your production application!
