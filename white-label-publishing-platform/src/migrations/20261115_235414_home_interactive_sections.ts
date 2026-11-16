import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_content_appearance" ADD VALUE 'timeline';
  ALTER TYPE "public"."enum_pages_blocks_content_appearance" ADD VALUE 'roadmap';
  ALTER TYPE "public"."enum__pages_v_blocks_content_appearance" ADD VALUE 'timeline';
  ALTER TYPE "public"."enum__pages_v_blocks_content_appearance" ADD VALUE 'roadmap';
  CREATE TABLE "pages_blocks_content_columns_photos" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer
  );

  CREATE TABLE "pages_blocks_content_columns_topics" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar
  );

  CREATE TABLE "_pages_v_blocks_content_columns_photos" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "image_id" integer,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_content_columns_topics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "_uuid" varchar
  );

  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "stage_group" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "period" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "stage_group" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "period" varchar;
  ALTER TABLE "pages_blocks_content_columns_photos" ADD CONSTRAINT "pages_blocks_content_columns_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns_photos" ADD CONSTRAINT "pages_blocks_content_columns_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns_topics" ADD CONSTRAINT "pages_blocks_content_columns_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns_photos" ADD CONSTRAINT "_pages_v_blocks_content_columns_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns_photos" ADD CONSTRAINT "_pages_v_blocks_content_columns_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns_topics" ADD CONSTRAINT "_pages_v_blocks_content_columns_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_content_columns_photos_order_idx" ON "pages_blocks_content_columns_photos" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_photos_parent_id_idx" ON "pages_blocks_content_columns_photos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_columns_photos_image_idx" ON "pages_blocks_content_columns_photos" USING btree ("image_id");
  CREATE INDEX "pages_blocks_content_columns_topics_order_idx" ON "pages_blocks_content_columns_topics" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_topics_parent_id_idx" ON "pages_blocks_content_columns_topics" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_columns_photos_order_idx" ON "_pages_v_blocks_content_columns_photos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_photos_parent_id_idx" ON "_pages_v_blocks_content_columns_photos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_columns_photos_image_idx" ON "_pages_v_blocks_content_columns_photos" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_content_columns_topics_order_idx" ON "_pages_v_blocks_content_columns_topics" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_topics_parent_id_idx" ON "_pages_v_blocks_content_columns_topics" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM "pages_blocks_content" WHERE "appearance"::text IN ('timeline', 'roadmap'))
      OR EXISTS (SELECT 1 FROM "_pages_v_blocks_content" WHERE "appearance"::text IN ('timeline', 'roadmap')) THEN
      RAISE EXCEPTION 'Restore timeline and roadmap content before rollback; back up all topic and photo data first.';
    END IF;
  END $$;`)

  await db.execute(sql`
   DROP TABLE "pages_blocks_content_columns_photos" CASCADE;
  DROP TABLE "pages_blocks_content_columns_topics" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns_photos" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns_topics" CASCADE;
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "appearance" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_content_appearance";
  CREATE TYPE "public"."enum_pages_blocks_content_appearance" AS ENUM('default', 'cards', 'about');
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "appearance" SET DATA TYPE "public"."enum_pages_blocks_content_appearance" USING "appearance"::"public"."enum_pages_blocks_content_appearance";
  ALTER TABLE "_pages_v_blocks_content" ALTER COLUMN "appearance" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_content_appearance";
  CREATE TYPE "public"."enum__pages_v_blocks_content_appearance" AS ENUM('default', 'cards', 'about');
  ALTER TABLE "_pages_v_blocks_content" ALTER COLUMN "appearance" SET DATA TYPE "public"."enum__pages_v_blocks_content_appearance" USING "appearance"::"public"."enum__pages_v_blocks_content_appearance";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "stage_group";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "period";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "stage_group";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "period";`)
}
