@echo off
:: build.bat — Compile dist\hogwarts-rpg.html (fichier autonome, aucun serveur requis)
:: Double-cliquer pour compiler, puis ouvrir dist\hogwarts-rpg.html dans un navigateur.

:: Se placer à la racine du projet (dossier parent de tools)
cd /d "%~dp0.."


where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js est requis pour compiler. Telechargez-le sur https://nodejs.org
    pause
    exit /b 1
)

node toolsuild.js
if %errorlevel% neq 0 (
    echo La compilation a echoue.
    pause
    exit /b 1
)

echo.
echo Voulez-vous ouvrir dist\hogwarts-rpg.html maintenant ? (O/N)
set /p rep=
if /i "%rep%"=="O" start "" "dist\hogwarts-rpg.html"

pause
