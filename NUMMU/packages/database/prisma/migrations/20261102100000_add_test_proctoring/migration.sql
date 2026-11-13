-- Proctoring configuration per test
ALTER TABLE "tests" ADD COLUMN "max_tab_switches" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "tests" ADD COLUMN "require_fullscreen" BOOLEAN NOT NULL DEFAULT true;

-- Proctoring counters per attempt
ALTER TABLE "test_attempts" ADD COLUMN "tab_switch_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "test_attempts" ADD COLUMN "fullscreen_exit_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "test_attempts" ADD COLUMN "auto_submitted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "test_attempts" ADD COLUMN "termination_reason" TEXT;

-- Violation audit log
CREATE TYPE "TestViolationType" AS ENUM ('TAB_SWITCH', 'FULLSCREEN_EXIT');

CREATE TABLE "test_violations" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "type" "TestViolationType" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_violations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "test_violations_attempt_id_occurred_at_idx" ON "test_violations"("attempt_id", "occurred_at");

ALTER TABLE "test_violations" ADD CONSTRAINT "test_violations_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

