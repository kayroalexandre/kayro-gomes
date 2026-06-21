import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

// Limpa estados lexical vazios ({ root: { children: [] } }) no campo introContent
// dos blocos Archive, zerando-os para NULL.
//
// IMPORTANTE: usa SQL cru direto na coluna `intro_content` (que existe desde a
// migration inicial) em vez de `payload.find()`. O `payload.find()` monta um
// SELECT com TODO o schema atual de `pages` — incluindo colunas (hero_overlay_*,
// hero_hero_image_fit, etc.) que só são criadas por migrations POSTERIORES a esta.
// Em um banco limpo (CI, Preview, deploy novo) essas colunas ainda não existem
// quando esta migration roda, e o SELECT quebrava com "column does not exist".
export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "pages_blocks_archive"
    SET "intro_content" = NULL
    WHERE "intro_content" IS NOT NULL
      AND jsonb_typeof("intro_content" -> 'root' -> 'children') = 'array'
      AND jsonb_array_length("intro_content" -> 'root' -> 'children') = 0;

    UPDATE "_pages_v_blocks_archive"
    SET "intro_content" = NULL
    WHERE "intro_content" IS NOT NULL
      AND jsonb_typeof("intro_content" -> 'root' -> 'children') = 'array'
      AND jsonb_array_length("intro_content" -> 'root' -> 'children') = 0;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data cleanup down migration can remain no-op
}
