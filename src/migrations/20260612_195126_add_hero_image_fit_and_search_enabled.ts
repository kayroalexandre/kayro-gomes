import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_hero_image_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__pages_v_version_hero_hero_image_fit" AS ENUM('cover', 'contain');
  ALTER TABLE "pages" ADD COLUMN "hero_hero_image_fit" "enum_pages_hero_hero_image_fit" DEFAULT 'cover';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_hero_image_fit" "enum__pages_v_version_hero_hero_image_fit" DEFAULT 'cover';
  ALTER TABLE "header" ADD COLUMN "search_enabled" boolean DEFAULT false;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "hero_hero_image_fit";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_hero_image_fit";
  ALTER TABLE "header" DROP COLUMN "search_enabled";
  DROP TYPE "public"."enum_pages_hero_hero_image_fit";
  DROP TYPE "public"."enum__pages_v_version_hero_hero_image_fit";`)
}
