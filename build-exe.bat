@echo off
REM ============================================================
REM  FVC7 Leveller — Build Windows .exe (Electron Packager)
REM  punsara-lab — GitHub-ready
REM ============================================================
setlocal enabledelayedexpansion

title FVC7 Build EXE
echo.
echo =======================================================
echo   FVC7 Leveller — Packaging EXE for Windows x64
echo   Target: punsara-lab release
echo =======================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [ERROR] Node.js not found in PATH. Install Node 20+ first.
  pause
  exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [ERROR] npm not found. Install Node 20+ first.
  pause
  exit /b 1
)

echo [1/5] Checking for node_modules...
if not exist "node_modules" (
  echo Installing dependencies (npm ci)...
  call npm ci
  if errorlevel 1 (
    call npm install
    if errorlevel 1 ( echo [FAIL] npm install failed & pause & exit /b 1 )
  )
) else (
  echo   ^(skipped — node_modules already present. Delete to re-install.^)
)

echo.
echo [2/5] Running vite production build (dist/)...
call npx vite build
if %ERRORLEVEL% neq 0 (
  echo [FAIL] Vite build failed — see errors above.
  pause
  exit /b 1
)
if not exist "dist\index.html" (
  echo [FAIL] dist/index.html missing after build.
  pause
  exit /b 1
)

echo.
echo [3/5] Packaging Electron app with @electron/packager...
if exist "electron-release" ( rmdir /s /q "electron-release" )

call npx electron-packager . ^
  "FVC7 Leveller" ^
  --platform=win32 ^
  --arch=x64 ^
  --out=electron-release ^
  --overwrite ^
  --prune=true ^
  --ignore="^/(\.git|\.vscode|android|ios|release|electron-release|src/.*\.tsx?$|public/(manifest|sw|robots)\..*$)" ^
  --app-copyright="punsara-lab" ^
  --app-version=0.1.0 ^
  --build-version=0.1.0 ^
  --win32metadata.CompanyName="punsara-lab" ^
  --win32metadata.FileDescription="FVC7 Leveller — offline build & study protocol tracker" ^
  --win32metadata.OriginalFilename="FVC7 Leveller.exe" ^
  --win32metadata.InternalName="FVC7-Leveller" ^
  --win32metadata.ProductName="FVC7 Leveller"

if %ERRORLEVEL% neq 0 (
  echo [FAIL] electron-packager failed.
  echo Hint: try running:  npm install
  pause
  exit /b 1
)

echo.
echo [4/5] Locating build artefacts...
set EXEDIR=
for /d %%D in ("electron-release\FVC7 Leveller-win32*") do set EXEDIR=%%~fD
if "%EXEDIR%"=="" (
  echo [WARN] Could not find packaged directory, scanning...
  dir /s /b "electron-release\*.exe" 2>nul
) else (
  echo   App folder : %EXEDIR%
  if exist "%EXEDIR%\FVC7 Leveller.exe" (
    echo   Exe path   : %EXEDIR%\FVC7 Leveller.exe
    echo.
    echo =======================================================
    echo   SUCCESS — Build complete
    echo =======================================================
    echo.
    echo   ZIP / share  : the folder:
    echo     %EXEDIR%
    echo.
    echo   Launch        : double-click  FVC7 Leveller.exe
    echo.
    echo   For GitHub release, zip the folder as:
    echo     FVC7-Leveller-win32-x64-v0.1.0.zip
    echo.
    echo   Optional — create portable zip now? (Y/N)
    choice /c YN /n /m "   "
    if !ERRORLEVEL! equ 1 (
      if not exist "release" mkdir "release"
      set ZIPNAME=release\FVC7-Leveller-win32-x64-v0.1.0.zip
      echo.
      echo   Creating  !ZIPNAME! ...
      powershell -NoProfile -Command "Compress-Archive -Path '%EXEDIR%\*' -DestinationPath '%CD%\!ZIPNAME!' -Force"
      if !ERRORLEVEL! equ 0 (
        echo   Done: %CD%\!ZIPNAME!
      ) else (
        echo   [WARN] Zip failed — please zip the folder manually.
      )
    )
  )
)

echo.
echo [5/5] Done. Press any key to open the output folder.
pause >nul
if not "%EXEDIR%"=="" ( explorer "%EXEDIR%" ) else ( explorer "electron-release" )
endlocal
