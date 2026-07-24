-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "replacedByTokenId" UUID,
ADD COLUMN     "revokedReason" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "refresh_tokens_revokedAt_idx" ON "refresh_tokens"("revokedAt");
