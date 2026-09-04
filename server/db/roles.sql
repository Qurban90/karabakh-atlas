-- Least-privilege database roles for QDX.
--
-- The app currently connects as the database owner, which means an SQL
-- injection or a bug in a migration path can drop tables outright. Splitting
-- the roles keeps the blast radius of the running process small:
--
--   qdx_migrate — owns the schema, runs DDL. Used at deploy time only.
--   qdx_app     — the runtime role. Reads and writes rows, and may TRUNCATE
--                 (store.syncAll replaces state in one transaction), but
--                 cannot CREATE, ALTER or DROP anything.
--
-- Apply once as a superuser:
--   psql -d qdx -f roles.sql
-- then point the service's DATABASE_URL at qdx_app.

-- 1. Roles ------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'qdx_app') THEN
    CREATE ROLE qdx_app LOGIN PASSWORD 'CHANGE_ME_APP';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'qdx_migrate') THEN
    CREATE ROLE qdx_migrate LOGIN PASSWORD 'CHANGE_ME_MIGRATE';
  END IF;
END
$$;

-- 2. Schema ownership -------------------------------------------------------
GRANT USAGE ON SCHEMA public TO qdx_app;
-- No CREATE on the schema: the runtime role cannot add or replace objects.
REVOKE CREATE ON SCHEMA public FROM qdx_app;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- 3. Table privileges -------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE
  ON ALL TABLES IN SCHEMA public TO qdx_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO qdx_app;

-- Tables created later by qdx_migrate inherit the same grants.
ALTER DEFAULT PRIVILEGES FOR ROLE qdx_migrate IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON TABLES TO qdx_app;
ALTER DEFAULT PRIVILEGES FOR ROLE qdx_migrate IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO qdx_app;

-- 4. Belt and braces --------------------------------------------------------
-- Never let the app read the role table it authenticates against.
REVOKE ALL ON pg_authid FROM qdx_app;
