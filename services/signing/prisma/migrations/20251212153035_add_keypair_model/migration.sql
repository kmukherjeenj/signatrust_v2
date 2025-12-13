-- CreateTable
CREATE TABLE "Keypair" (
    "did" TEXT NOT NULL,
    "encryptedSecretKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "Keypair_pkey" PRIMARY KEY ("did")
);

-- CreateIndex
CREATE INDEX "Keypair_publicKey_idx" ON "Keypair"("publicKey");
