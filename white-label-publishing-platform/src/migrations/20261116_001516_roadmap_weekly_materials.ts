import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns_topics" ADD COLUMN "description" varchar;
  ALTER TABLE "pages_blocks_content_columns_topics" ADD COLUMN "resource_title" varchar;
  ALTER TABLE "pages_blocks_content_columns_topics" ADD COLUMN "resource_u_r_l" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "week" numeric;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "weekly_goal" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "practice" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns_topics" ADD COLUMN "description" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns_topics" ADD COLUMN "resource_title" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns_topics" ADD COLUMN "resource_u_r_l" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "week" numeric;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "weekly_goal" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "practice" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns_topics" DROP COLUMN "description";
  ALTER TABLE "pages_blocks_content_columns_topics" DROP COLUMN "resource_title";
  ALTER TABLE "pages_blocks_content_columns_topics" DROP COLUMN "resource_u_r_l";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "week";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "weekly_goal";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "practice";
  ALTER TABLE "_pages_v_blocks_content_columns_topics" DROP COLUMN "description";
  ALTER TABLE "_pages_v_blocks_content_columns_topics" DROP COLUMN "resource_title";
  ALTER TABLE "_pages_v_blocks_content_columns_topics" DROP COLUMN "resource_u_r_l";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "week";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "weekly_goal";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "practice";`)
}
