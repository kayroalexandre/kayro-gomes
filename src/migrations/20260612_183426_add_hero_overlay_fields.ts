import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_overlay_enabled" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_overlay_opacity" numeric DEFAULT 60;
  ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_bottom_fade_enabled" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_hero_overlay_enabled" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_hero_overlay_opacity" numeric DEFAULT 60;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_hero_bottom_fade_enabled" boolean DEFAULT true;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN IF EXISTS "hero_overlay_enabled";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "hero_overlay_opacity";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "hero_bottom_fade_enabled";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_hero_overlay_enabled";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_hero_overlay_opacity";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_hero_bottom_fade_enabled";`)
}
