-- 1. Create Enums
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');
CREATE TYPE "NotificationType" AS ENUM ('POST_REPORTED', 'EXCHANGE_REQUEST', 'EXCHANGE_ACCEPTED', 'EXCHANGE_REJECTED', 'EXCHANGE_COMPLETED');

-- 2. Handle Reports (Migrate from old 'report' to 'post_reports')
-- Note: Dropping old 'report' table as requested structure is significantly different (UUID primary key)
DROP TABLE IF EXISTS "report" CASCADE;
CREATE TABLE "post_reports" (
    "report_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "post_id" INTEGER NOT NULL,
    "reporter_id" INTEGER NOT NULL,
    "reason" VARCHAR NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_post" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE CASCADE,
    CONSTRAINT "fk_reporter" FOREIGN KEY ("reporter_id") REFERENCES "User"("student_id") ON DELETE CASCADE,
    CONSTRAINT "unique_post_reporter" UNIQUE ("post_id", "reporter_id")
);

-- 3. Handle Exchanges (Migrate from old 'exchange' to 'exchanges')
DROP TABLE IF EXISTS "exchange" CASCADE;
CREATE TABLE "exchanges" (
    "exchange_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "post_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "status" "ExchangeStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_post" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE CASCADE,
    CONSTRAINT "fk_owner" FOREIGN KEY ("owner_id") REFERENCES "User"("student_id") ON DELETE CASCADE,
    CONSTRAINT "fk_requester" FOREIGN KEY ("requester_id") REFERENCES "User"("student_id") ON DELETE CASCADE
);

-- 4. Create Notifications
CREATE TABLE "notifications" (
    "notification_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "reference_id" VARCHAR,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "User"("student_id") ON DELETE CASCADE
);
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX "idx_notifications_is_read" ON "notifications"("is_read");

-- 5. Handle Favorites (Migrate from old 'favorite' to 'favorites')
DROP TABLE IF EXISTS "favorite" CASCADE;
CREATE TABLE "favorites" (
    "favorite_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "User"("student_id") ON DELETE CASCADE,
    CONSTRAINT "fk_post" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE CASCADE,
    CONSTRAINT "unique_user_post_fav" UNIQUE ("user_id", "post_id")
);

-- 6. Add Indexes for optimization
CREATE INDEX "idx_post_reports_post_id" ON "post_reports"("post_id");
CREATE INDEX "idx_exchanges_post_id" ON "exchanges"("post_id");
CREATE INDEX "idx_exchanges_status" ON "exchanges"("status");
