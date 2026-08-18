@echo off
rem ── Lokal dev Postgres klasteri (port 5433, trust auth) ──
rem Bir dəfə winget ilə qurulan PostgreSQL 17-nin binarlarını istifadə edir;
rem data qovluğu ..\.tools\pgdata (start-demo.cmd-dən əvvəl işə salın).
set "PGBIN=C:\Program Files\PostgreSQL\17\bin"
set "PGDATA=%~dp0..\.tools\pgdata"
if not exist "%PGDATA%" (
  "%PGBIN%\initdb.exe" -D "%PGDATA%" -U qdx -A trust -E UTF8
  "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -o "-p 5433" start
  timeout /t 3 >nul
  "%PGBIN%\createdb.exe" -p 5433 -U qdx qdx
) else (
  "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -o "-p 5433" start
)
echo Postgres 5433 portunda hazirdir (postgres://qdx@localhost:5433/qdx)
