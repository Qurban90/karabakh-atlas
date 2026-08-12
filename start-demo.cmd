@echo off
rem ── Qarabağ Dirçəliş Xəritəsi — bir-klik demo (API + tətbiq, port 5001) ──
set "PATH=%~dp0..\.tools\node-v22.23.2-win-x64;%PATH%"
where node >nul 2>nul || (
  echo Node.js tapilmadi. Portativ Node ..\.tools qovlugunda olmalidir,
  echo ve ya https://nodejs.org -dan Node LTS yukleyin.
  pause & exit /b 1
)
start "" http://localhost:5001
cd /d "%~dp0server"
node src/index.js
