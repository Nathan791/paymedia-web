-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('reader', 'editor', 'admin');

-- CreateEnum
CREATE TYPE "SessionTokenType" AS ENUM ('ACCESS', 'REFRESH');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('epub', 'audio', 'video');

-- CreateEnum
CREATE TYPE "PubStatus" AS ENUM ('draft', 'pending_review', 'published', 'rejected', 'archived');

-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('sms', 'whatsapp', 'email');

-- CreateEnum
CREATE TYPE "TxType" AS ENUM ('deposit', 'content_purchase', 'subscription', 'payout', 'refund');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('pending', 'completed', 'failed', 'rejected');

-- CreateEnum
CREATE TYPE "DurationUnit" AS ENUM ('hours', 'days', 'months');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('active', 'expired', 'cancelled', 'suspended');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'paid', 'failed');

-- CreateTable
CREATE TABLE "pm_users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ulid" CHAR(26) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150),
    "phone_number" VARCHAR(20),
    "password_hash" VARCHAR(255),
    "country_code" CHAR(2) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'reader',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pm_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ulid" CHAR(26) NOT NULL,
    "user_id" UUID NOT NULL,
    "jti" CHAR(26) NOT NULL,
    "token_type" "SessionTokenType" NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_otp_validations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "target" VARCHAR(150) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_otp_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_user_wallets" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ulid" CHAR(26) NOT NULL,
    "user_id" UUID NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'XAF',
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_user_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_transactions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ulid" CHAR(26) NOT NULL,
    "wallet_id" UUID NOT NULL,
    "content_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "TxType" NOT NULL,
    "status" "TxStatus" NOT NULL DEFAULT 'pending',
    "external_provider" VARCHAR(50),
    "external_reference" VARCHAR(100),
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_categories" (
    "id" SERIAL NOT NULL,
    "ulid" CHAR(26) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,

    CONSTRAINT "pm_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "pm_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_user_preferences" (
    "user_id" UUID NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "pm_user_preferences_pkey" PRIMARY KEY ("user_id","tag_id")
);

-- CreateTable
CREATE TABLE "pm_publications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ulid" CHAR(26) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "media_type" "MediaType" NOT NULL,
    "file_url" VARCHAR(512) NOT NULL,
    "thumbnail_url" VARCHAR(512),
    "editor_id" UUID,
    "category_id" INTEGER,
    "status" "PubStatus" NOT NULL DEFAULT 'draft',
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "free_preview_duration" INTEGER,
    "free_article_limit" INTEGER,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pm_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_publication_tags" (
    "publication_id" UUID NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "pm_publication_tags_pkey" PRIMARY KEY ("publication_id","tag_id")
);

-- CreateTable
CREATE TABLE "pm_publication_reviews" (
    "id" BIGSERIAL NOT NULL,
    "publication_id" UUID NOT NULL,
    "admin_id" UUID,
    "decision" "PubStatus" NOT NULL,
    "rejection_reason" TEXT,
    "reviewed_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_publication_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_subscription_plans" (
    "id" SERIAL NOT NULL,
    "ulid" CHAR(26) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration_type" "DurationUnit" NOT NULL,
    "duration_value" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pm_subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_user_subscriptions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ulid" CHAR(26) NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "start_at" TIMESTAMP NOT NULL,
    "ends_at" TIMESTAMP NOT NULL,
    "status" "SubStatus" NOT NULL DEFAULT 'active',
    "payment_reference" VARCHAR(100) NOT NULL DEFAULT 'WALLET_DEBIT',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_user_purchases" (
    "id" BIGSERIAL NOT NULL,
    "ulid" CHAR(26) NOT NULL,
    "user_id" UUID NOT NULL,
    "publication_id" UUID NOT NULL,
    "transaction_id" UUID,
    "purchase_type" VARCHAR(50) NOT NULL,
    "earning_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "unlocked_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "pm_user_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_downloads" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ulid" CHAR(26) NOT NULL,
    "purchase_id" BIGINT NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "downloaded_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_payouts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ulid" CHAR(26) NOT NULL,
    "user_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "gross_amount" DECIMAL(12,2) NOT NULL,
    "commission_amount" DECIMAL(12,2) NOT NULL,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "pm_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "target_table" VARCHAR(100) NOT NULL,
    "target_id" VARCHAR(100),
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_reading_progress" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "publication_id" UUID NOT NULL,
    "last_position" VARCHAR(50),
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_reading_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_daily_analytics" (
    "id" BIGSERIAL NOT NULL,
    "publication_id" UUID NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daily_views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pm_daily_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pm_users_ulid_key" ON "pm_users"("ulid");

-- CreateIndex
CREATE UNIQUE INDEX "pm_users_email_key" ON "pm_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pm_users_phone_number_key" ON "pm_users"("phone_number");

-- CreateIndex
CREATE INDEX "pm_users_email_idx" ON "pm_users"("email");

-- CreateIndex
CREATE INDEX "pm_users_deleted_at_idx" ON "pm_users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "pm_sessions_ulid_key" ON "pm_sessions"("ulid");

-- CreateIndex
CREATE UNIQUE INDEX "pm_sessions_jti_key" ON "pm_sessions"("jti");

-- CreateIndex
CREATE INDEX "pm_sessions_user_id_idx" ON "pm_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pm_user_wallets_ulid_key" ON "pm_user_wallets"("ulid");

-- CreateIndex
CREATE UNIQUE INDEX "pm_user_wallets_user_id_key" ON "pm_user_wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pm_transactions_ulid_key" ON "pm_transactions"("ulid");

-- CreateIndex
CREATE INDEX "pm_transactions_wallet_id_idx" ON "pm_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "pm_transactions_status_idx" ON "pm_transactions"("status");

-- CreateIndex
CREATE INDEX "pm_transactions_created_at_idx" ON "pm_transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "pm_categories_ulid_key" ON "pm_categories"("ulid");

-- CreateIndex
CREATE UNIQUE INDEX "pm_categories_slug_key" ON "pm_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pm_tags_name_key" ON "pm_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pm_publications_ulid_key" ON "pm_publications"("ulid");

-- CreateIndex
CREATE INDEX "pm_publications_editor_id_idx" ON "pm_publications"("editor_id");

-- CreateIndex
CREATE INDEX "pm_publications_category_id_idx" ON "pm_publications"("category_id");

-- CreateIndex
CREATE INDEX "pm_publications_status_idx" ON "pm_publications"("status");

-- CreateIndex
CREATE INDEX "pm_publications_deleted_at_idx" ON "pm_publications"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "pm_subscription_plans_ulid_key" ON "pm_subscription_plans"("ulid");

-- CreateIndex
CREATE UNIQUE INDEX "pm_user_subscriptions_ulid_key" ON "pm_user_subscriptions"("ulid");

-- CreateIndex
CREATE UNIQUE INDEX "pm_user_purchases_ulid_key" ON "pm_user_purchases"("ulid");

-- CreateIndex
CREATE UNIQUE INDEX "pm_user_purchases_user_id_publication_id_key" ON "pm_user_purchases"("user_id", "publication_id");

-- CreateIndex
CREATE UNIQUE INDEX "pm_downloads_ulid_key" ON "pm_downloads"("ulid");

-- CreateIndex
CREATE INDEX "pm_downloads_purchase_id_idx" ON "pm_downloads"("purchase_id");

-- CreateIndex
CREATE UNIQUE INDEX "pm_payouts_ulid_key" ON "pm_payouts"("ulid");

-- CreateIndex
CREATE INDEX "pm_payouts_user_id_idx" ON "pm_payouts"("user_id");

-- CreateIndex
CREATE INDEX "pm_payouts_status_idx" ON "pm_payouts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pm_reading_progress_user_id_publication_id_key" ON "pm_reading_progress"("user_id", "publication_id");

-- CreateIndex
CREATE UNIQUE INDEX "pm_daily_analytics_publication_id_date_key" ON "pm_daily_analytics"("publication_id", "date");

-- AddForeignKey
ALTER TABLE "pm_sessions" ADD CONSTRAINT "pm_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pm_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_otp_validations" ADD CONSTRAINT "pm_otp_validations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pm_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_user_wallets" ADD CONSTRAINT "pm_user_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pm_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_transactions" ADD CONSTRAINT "pm_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "pm_user_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_transactions" ADD CONSTRAINT "pm_transactions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "pm_publications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_user_preferences" ADD CONSTRAINT "pm_user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pm_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_user_preferences" ADD CONSTRAINT "pm_user_preferences_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "pm_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_publications" ADD CONSTRAINT "pm_publications_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "pm_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_publications" ADD CONSTRAINT "pm_publications_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "pm_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_publication_tags" ADD CONSTRAINT "pm_publication_tags_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "pm_publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_publication_tags" ADD CONSTRAINT "pm_publication_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "pm_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_publication_reviews" ADD CONSTRAINT "pm_publication_reviews_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "pm_publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_publication_reviews" ADD CONSTRAINT "pm_publication_reviews_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "pm_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_user_subscriptions" ADD CONSTRAINT "pm_user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pm_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_user_subscriptions" ADD CONSTRAINT "pm_user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "pm_subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_user_purchases" ADD CONSTRAINT "pm_user_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pm_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_user_purchases" ADD CONSTRAINT "pm_user_purchases_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "pm_publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_user_purchases" ADD CONSTRAINT "pm_user_purchases_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "pm_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_downloads" ADD CONSTRAINT "pm_downloads_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "pm_user_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_payouts" ADD CONSTRAINT "pm_payouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pm_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_audit_logs" ADD CONSTRAINT "pm_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pm_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_reading_progress" ADD CONSTRAINT "pm_reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pm_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_reading_progress" ADD CONSTRAINT "pm_reading_progress_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "pm_publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_daily_analytics" ADD CONSTRAINT "pm_daily_analytics_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "pm_publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
