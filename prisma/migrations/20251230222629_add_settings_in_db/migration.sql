-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'claude-3-7-sonnet-latest',
    "apiKey" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
