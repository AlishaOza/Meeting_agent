-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "nextSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "purpose" TEXT;
