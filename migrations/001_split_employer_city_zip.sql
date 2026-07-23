-- =============================================================================
-- One-off migration: split city / ZIP out of employers.address
-- =============================================================================
--
-- WHY
--   Earlier registrations ran through provisioning code that folded the city and
--   ZIP into the address text instead of using the dedicated columns:
--
--       address  = '<street address>' || chr(10) || '<city> <zip>'
--       city     = NULL
--       zip_code = NULL
--
--   The provisioning code is now fixed, so NEW employers are stored correctly.
--   This script repairs the EXISTING rows.
--
-- SAFETY
--   * Idempotent — only touches rows where city AND zip_code are still NULL
--     and the address actually contains a second line. Re-running is a no-op.
--   * Run STEP 1 (preview) first and eyeball the results.
--   * STEP 2 runs inside a transaction so you can ROLLBACK.
--   * Does NOT touch law_firms / agencies — those tables have no city/zip
--     columns, so their addresses intentionally keep the combined format.
--
-- NOTE
--   `outlet_name` cannot be recovered. It was never written to the database at
--   all, so there is no stored value to migrate. Affected employers must retype
--   it once in Dashboard -> Profile.
--
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> paste STEP 1, run, review.
--   Then paste STEP 2, run, review the returned rows, then COMMIT (or ROLLBACK).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- STEP 1 — PREVIEW. Changes nothing. Check that new_city / new_zip look right.
-- -----------------------------------------------------------------------------
SELECT
  id,
  public_code,
  name,
  address AS current_address,
  -- everything before the LAST newline stays as the address
  substring(address from '^(.*)\n[^\n]*$') AS new_address,
  -- on the last line, everything before the final space is the city
  NULLIF(
    substring(substring(address from '\n([^\n]*)$') from '^(.*) [^ ]+$'),
    ''
  ) AS new_city,
  -- the final space-separated token on the last line is the ZIP
  substring(substring(address from '\n([^\n]*)$') from '([^ ]+)$') AS new_zip
FROM public.employers
WHERE city IS NULL
  AND zip_code IS NULL
  AND address ~ '\n'
ORDER BY created_at;


-- -----------------------------------------------------------------------------
-- STEP 2 — APPLY. Only run after the preview above looks correct.
-- -----------------------------------------------------------------------------
BEGIN;

UPDATE public.employers AS e
SET
  city = NULLIF(
    substring(substring(e.address from '\n([^\n]*)$') from '^(.*) [^ ]+$'),
    ''
  ),
  zip_code   = substring(substring(e.address from '\n([^\n]*)$') from '([^ ]+)$'),
  address    = substring(e.address from '^(.*)\n[^\n]*$'),
  updated_at = now()
WHERE e.city IS NULL
  AND e.zip_code IS NULL
  AND e.address ~ '\n';

-- Verify the result before committing.
SELECT id, public_code, name, address, city, zip_code
FROM public.employers
ORDER BY updated_at DESC
LIMIT 25;

COMMIT;
-- If anything looks wrong, run ROLLBACK; instead of COMMIT;
