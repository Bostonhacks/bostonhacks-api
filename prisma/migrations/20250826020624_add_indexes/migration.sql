-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Application_applicationYear_idx" ON "Application"("applicationYear");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_applicationYear_status_idx" ON "Application"("applicationYear", "status");

-- CreateIndex
CREATE INDEX "Application_email_idx" ON "Application"("email");

-- CreateIndex
CREATE INDEX "Judge_year_idx" ON "Judge"("year");

-- CreateIndex
CREATE INDEX "Judge_accessCode_idx" ON "Judge"("accessCode");

-- CreateIndex
CREATE INDEX "JudgingCriteria_year_idx" ON "JudgingCriteria"("year");

-- CreateIndex
CREATE INDEX "JudgingCriteria_event_idx" ON "JudgingCriteria"("event");

-- CreateIndex
CREATE INDEX "Project_year_idx" ON "Project"("year");

-- CreateIndex
CREATE INDEX "Project_isWinner_idx" ON "Project"("isWinner");

-- CreateIndex
CREATE INDEX "Project_year_isWinner_idx" ON "Project"("year", "isWinner");

-- CreateIndex
CREATE INDEX "Project_track_idx" ON "Project"("track");

-- CreateIndex
CREATE INDEX "Project_placement_idx" ON "Project"("placement");

-- CreateIndex
CREATE INDEX "Score_totalScore_idx" ON "Score"("totalScore");

-- CreateIndex
CREATE INDEX "Score_judgeId_idx" ON "Score"("judgeId");

-- CreateIndex
CREATE INDEX "Score_projectId_idx" ON "Score"("projectId");

-- CreateIndex
CREATE INDEX "Score_createdAt_idx" ON "Score"("createdAt");
