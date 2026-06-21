import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_scroll_indicator_position" AS ENUM('bottom', 'inline');
  CREATE TYPE "public"."enum__pages_v_version_hero_scroll_indicator_position" AS ENUM('bottom', 'inline');
  ALTER TABLE "pages" ADD COLUMN "hero_scroll_indicator_enabled" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "hero_scroll_indicator_position" "enum_pages_hero_scroll_indicator_position" DEFAULT 'bottom';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_scroll_indicator_enabled" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_scroll_indicator_position" "enum__pages_v_version_hero_scroll_indicator_position" DEFAULT 'bottom';
  ALTER TABLE "search_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_projects_id_idx" ON "search_rels" USING btree ("projects_id");
  ALTER TABLE "pages" DROP COLUMN "hero_bottom_fade_enabled";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_bottom_fade_enabled";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_projects_fk";
  
  DROP INDEX "search_rels_projects_id_idx";
  ALTER TABLE "pages" ADD COLUMN "hero_bottom_fade_enabled" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_bottom_fade_enabled" boolean DEFAULT true;
  ALTER TABLE "pages" DROP COLUMN "hero_scroll_indicator_enabled";
  ALTER TABLE "pages" DROP COLUMN "hero_scroll_indicator_position";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_scroll_indicator_enabled";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_scroll_indicator_position";
  ALTER TABLE "search_rels" DROP COLUMN "projects_id";
  DROP TYPE "public"."enum_pages_hero_scroll_indicator_position";
  DROP TYPE "public"."enum__pages_v_version_hero_scroll_indicator_position";`)
}
