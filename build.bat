@echo off
:: build.bat — Compile poudlard-rpg.html (fichier standalone, aucun serveur requis)
:: Double-cliquer pour compiler, puis ouvrir poudlard-rpg.html dans un navigateur.

cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js est requis pour compiler. Telechargez-le sur https://nodejs.org
    pause
    exit /b 1
)

node build.js
if %errorlevel% neq 0 (
    echo La compilation a echoue.
    pause
    exit /b 1
)

echo.
echo Voulez-vous ouvrir poudlard-rpg.html maintenant ? (O/N)
set /p rep=
if /i "%rep%"=="O" start "" "poudlard-rpg.html"

pause
