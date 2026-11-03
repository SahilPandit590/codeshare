-- Add an optional short public identifier for snippets. Existing pastes keep
-- their internal IDs and continue to work through the legacy routes.
ALTER TABLE "pastes"
ADD COLUMN "shortCode" VARCHAR(6);

CREATE UNIQUE INDEX "pastes_shortCode_key" ON "pastes"("shortCode");
