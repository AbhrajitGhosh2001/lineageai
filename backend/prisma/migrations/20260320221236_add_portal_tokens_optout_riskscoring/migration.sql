-- AlterTable
ALTER TABLE "FamilyMember" ADD COLUMN     "optedOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "riskScore" INTEGER;

-- CreateTable
CREATE TABLE "FamilyPortalToken" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyPortalToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptOut" (
    "id" TEXT NOT NULL,
    "familyMemberId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptOut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FamilyPortalToken_token_key" ON "FamilyPortalToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "OptOut_familyMemberId_key" ON "OptOut"("familyMemberId");

-- AddForeignKey
ALTER TABLE "FamilyPortalToken" ADD CONSTRAINT "FamilyPortalToken_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptOut" ADD CONSTRAINT "OptOut_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
