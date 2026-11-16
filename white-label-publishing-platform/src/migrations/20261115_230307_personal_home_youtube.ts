import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "hero_youtube_video_u_r_l" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_youtube_u_r_l" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_github_u_r_l" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_linkedin_u_r_l" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_youtube_video_u_r_l" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_youtube_u_r_l" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_github_u_r_l" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_linkedin_u_r_l" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "hero_youtube_video_u_r_l";
  ALTER TABLE "pages" DROP COLUMN "hero_youtube_u_r_l";
  ALTER TABLE "pages" DROP COLUMN "hero_github_u_r_l";
  ALTER TABLE "pages" DROP COLUMN "hero_linkedin_u_r_l";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_youtube_video_u_r_l";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_youtube_u_r_l";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_github_u_r_l";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_linkedin_u_r_l";`)
}
