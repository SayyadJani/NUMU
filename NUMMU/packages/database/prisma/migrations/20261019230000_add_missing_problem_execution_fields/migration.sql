-- CreateEnum
CREATE TYPE "ExecutionMode" AS ENUM ('FUNCTION', 'STDIN_STDOUT');

-- AlterTable
ALTER TABLE "problems" ADD COLUMN "execution_mode" "ExecutionMode" NOT NULL DEFAULT 'FUNCTION';
ALTER TABLE "problems" ADD COLUMN "function_contract" JSONB;
ALTER TABLE "problems" ADD COLUMN "input_format" TEXT;
ALTER TABLE "problems" ADD COLUMN "output_format" TEXT;
ALTER TABLE "problems" ADD COLUMN "comparator_type" TEXT NOT NULL DEFAULT 'EXACT';
