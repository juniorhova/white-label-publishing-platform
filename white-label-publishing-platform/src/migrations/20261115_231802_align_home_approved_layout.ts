import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_appearance" AS ENUM('default', 'cards', 'about');
  CREATE TYPE "public"."enum__pages_v_blocks_content_appearance" AS ENUM('default', 'cards', 'about');
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "video_u_r_l" varchar;
  ALTER TABLE "pages_blocks_content" ADD COLUMN "appearance" "enum_pages_blocks_content_appearance";
  ALTER TABLE "pages_blocks_content" ADD COLUMN "section_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_youtube_description" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "video_u_r_l" varchar;
  ALTER TABLE "_pages_v_blocks_content" ADD COLUMN "appearance" "enum__pages_v_blocks_content_appearance";
  ALTER TABLE "_pages_v_blocks_content" ADD COLUMN "section_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_youtube_description" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "video_u_r_l";
  ALTER TABLE "pages_blocks_content" DROP COLUMN "appearance";
  ALTER TABLE "pages_blocks_content" DROP COLUMN "section_title";
  ALTER TABLE "pages" DROP COLUMN "hero_youtube_description";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "video_u_r_l";
  ALTER TABLE "_pages_v_blocks_content" DROP COLUMN "appearance";
  ALTER TABLE "_pages_v_blocks_content" DROP COLUMN "section_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_youtube_description";
  DROP TYPE "public"."enum_pages_blocks_content_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_appearance";`)
}
