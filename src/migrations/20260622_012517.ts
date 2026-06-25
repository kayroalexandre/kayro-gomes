import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_menu_type" AS ENUM('reference', 'custom');
  CREATE TABLE "menu" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_menu_type" DEFAULT 'reference',
  	"new_tab" boolean,
  	"url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "menu_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"projects_id" integer
  );
  
  ALTER TABLE "header_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_nav_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_pages_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_posts_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_projects_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_pages_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_posts_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_projects_fk";
  
  DROP INDEX "header_rels_pages_id_idx";
  DROP INDEX "header_rels_posts_id_idx";
  DROP INDEX "header_rels_projects_id_idx";
  DROP INDEX "footer_rels_pages_id_idx";
  DROP INDEX "footer_rels_posts_id_idx";
  DROP INDEX "footer_rels_projects_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "menu_id" integer;
  ALTER TABLE "header_rels" ADD COLUMN "menu_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "menu_id" integer;
  ALTER TABLE "menu_rels" ADD CONSTRAINT "menu_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_rels" ADD CONSTRAINT "menu_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_rels" ADD CONSTRAINT "menu_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_rels" ADD CONSTRAINT "menu_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "menu_updated_at_idx" ON "menu" USING btree ("updated_at");
  CREATE INDEX "menu_created_at_idx" ON "menu" USING btree ("created_at");
  CREATE INDEX "menu_rels_order_idx" ON "menu_rels" USING btree ("order");
  CREATE INDEX "menu_rels_parent_idx" ON "menu_rels" USING btree ("parent_id");
  CREATE INDEX "menu_rels_path_idx" ON "menu_rels" USING btree ("path");
  CREATE INDEX "menu_rels_pages_id_idx" ON "menu_rels" USING btree ("pages_id");
  CREATE INDEX "menu_rels_posts_id_idx" ON "menu_rels" USING btree ("posts_id");
  CREATE INDEX "menu_rels_projects_id_idx" ON "menu_rels" USING btree ("projects_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_menu_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_menu_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_menu_id_idx" ON "payload_locked_documents_rels" USING btree ("menu_id");
  CREATE INDEX "header_rels_menu_id_idx" ON "header_rels" USING btree ("menu_id");
  CREATE INDEX "footer_rels_menu_id_idx" ON "footer_rels" USING btree ("menu_id");
  ALTER TABLE "header_rels" DROP COLUMN "pages_id";
  ALTER TABLE "header_rels" DROP COLUMN "posts_id";
  ALTER TABLE "header_rels" DROP COLUMN "projects_id";
  ALTER TABLE "footer_rels" DROP COLUMN "pages_id";
  ALTER TABLE "footer_rels" DROP COLUMN "posts_id";
  ALTER TABLE "footer_rels" DROP COLUMN "projects_id";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  ALTER TABLE "menu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "menu_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "menu" CASCADE;
  DROP TABLE "menu_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_menu_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_menu_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_menu_fk";
  
  DROP INDEX "payload_locked_documents_rels_menu_id_idx";
  DROP INDEX "header_rels_menu_id_idx";
  DROP INDEX "footer_rels_menu_id_idx";
  ALTER TABLE "header_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "header_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "header_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "header_rels_projects_id_idx" ON "header_rels" USING btree ("projects_id");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  CREATE INDEX "footer_rels_projects_id_idx" ON "footer_rels" USING btree ("projects_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "menu_id";
  ALTER TABLE "header_rels" DROP COLUMN "menu_id";
  ALTER TABLE "footer_rels" DROP COLUMN "menu_id";
  DROP TYPE "public"."enum_menu_type";`)
}
