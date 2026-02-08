-- Supabase PostgreSQL Migration
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable: users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: Claim
CREATE TABLE IF NOT EXISTS "Claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "userId" TEXT,
    "steelmanArguments" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Claim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: Feedback
CREATE TABLE IF NOT EXISTS "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "helpful" BOOLEAN,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex: users_email_key (unique)
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex: Claim_userId_idx
CREATE INDEX IF NOT EXISTS "Claim_userId_idx" ON "Claim"("userId");

-- CreateIndex: Claim_createdAt_idx
CREATE INDEX IF NOT EXISTS "Claim_createdAt_idx" ON "Claim"("createdAt");

-- CreateIndex: Claim_category_idx
CREATE INDEX IF NOT EXISTS "Claim_category_idx" ON "Claim"("category");

-- CreateIndex: Claim_processingStatus_idx
CREATE INDEX IF NOT EXISTS "Claim_processingStatus_idx" ON "Claim"("processingStatus");

-- CreateIndex: Feedback_claimId_idx
CREATE INDEX IF NOT EXISTS "Feedback_claimId_idx" ON "Feedback"("claimId");

-- CreateIndex: Feedback_userId_idx
CREATE INDEX IF NOT EXISTS "Feedback_userId_idx" ON "Feedback"("userId");

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'Claim', 'Feedback');
