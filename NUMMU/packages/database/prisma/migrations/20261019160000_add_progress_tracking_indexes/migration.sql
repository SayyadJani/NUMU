-- CreateIndex
CREATE INDEX "submissions_user_id_verdict_idx" ON "submissions"("user_id", "verdict");

-- CreateIndex
CREATE INDEX "submissions_user_id_created_at_idx" ON "submissions"("user_id", "created_at");
