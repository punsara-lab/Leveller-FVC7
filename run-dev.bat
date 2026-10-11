@echo off
REM FVC7 Leveller — one-click dev startup (installs deps, then vite dev)
setlocal
title FVC7 Leveller Dev
echo Launching FVC7 Leveller dev server...
if not exist node_modules (
  echo First run — installing dependencies...
  call npm install
  if %ERRORLEVEL% neq 0 ( echo npm install failed & pause & exit /b 1 )
)
start "" http://localhost:8080
call npx vite
endlocal
