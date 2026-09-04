@echo off
rem ── Qarabağ Dirçəliş Xəritəsi — bir-klik demo (API + tətbiq, port 5001) ──
rem
rem Admin şifrəsi burada təyin olunur ki, təqdimat zamanı moderasiyanı
rem göstərmək üçün log axtarmayasınız. Bu yalnız LOKAL demo üçündür —
rem produksiyada şifrə Render-in Environment bölməsindən gəlir.
setlocal
set "PATH=%~dp0..\.tools\node-v22.23.2-win-x64;%PATH%"
set "ADMIN_PASSWORD=QdxDemo2026!"
set "MODERATOR_PASSWORD=QdxDemo2026!"

where node >nul 2>nul || (
  echo Node.js tapilmadi. Portativ Node ..\.tools qovlugunda olmalidir,
  echo ve ya https://nodejs.org -dan Node LTS yukleyin.
  pause & exit /b 1
)

echo.
echo  ============================================================
echo   Qarabag Dircelis Xeritesi - demo
echo  ============================================================
echo   Tetbiq   : http://localhost:5001
echo   API sened: http://localhost:5001/api/docs
echo.
echo   Demo hesablari:
echo     istifadeci : aysel@demo.az    / Demo123!
echo     admin      : admin@qdx.az     / QdxDemo2026!
echo     moderator  : leyla@demo.az    / QdxDemo2026!
echo.
echo   Baglamaq ucun bu pencerede Ctrl+C basin.
echo  ============================================================
echo.

start "" http://localhost:5001
cd /d "%~dp0server"
node src/index.js
