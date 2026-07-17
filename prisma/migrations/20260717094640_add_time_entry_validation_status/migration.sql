-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN     "status" "ValidationStatus" NOT NULL DEFAULT 'APPROVED';
