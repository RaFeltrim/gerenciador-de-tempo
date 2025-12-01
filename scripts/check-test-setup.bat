@echo off
setlocal enabledelayedexpansion
REM Check Test Setup Script for Windows
REM This script verifies that the testing environment is properly configured

echo.
echo Checking test setup for Gerenciador de Tempo...
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js is installed: %NODE_VERSION%
) else (
    echo [ERROR] Node.js is not installed
    echo    Please install Node.js from https://nodejs.org/
)
echo.

REM Check npm
echo Checking npm...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm is installed: %NPM_VERSION%
) else (
    echo [ERROR] npm is not installed
)
echo.

REM Check node_modules
echo Checking dependencies...
if exist "node_modules\" (
    echo [OK] node_modules directory exists
    if exist "node_modules\cypress\" (
        echo [OK] Cypress is installed
    ) else (
        echo [WARNING] Cypress is not installed
        echo    Run: npm install
    )
) else (
    echo [ERROR] node_modules directory not found
    echo    Run: npm install
)
echo.

REM Check Cypress config
echo Checking Cypress configuration...
if exist "cypress.config.ts" (
    echo [OK] cypress.config.ts exists
) else (
    echo [ERROR] cypress.config.ts not found
)

if exist "cypress\support\" (
    echo [OK] cypress\support directory exists
    
    if exist "cypress\support\e2e.ts" (
        echo [OK] cypress\support\e2e.ts exists
    ) else (
        echo [ERROR] cypress\support\e2e.ts not found
    )
    
    if exist "cypress\support\component.ts" (
        echo [OK] cypress\support\component.ts exists
    ) else (
        echo [ERROR] cypress\support\component.ts not found
    )
    
    if exist "cypress\support\commands.ts" (
        echo [OK] cypress\support\commands.ts exists
    ) else (
        echo [ERROR] cypress\support\commands.ts not found
    )
) else (
    echo [ERROR] cypress\support directory not found
)
echo.

REM Check Python
echo Checking Python (for Robot Framework)...
where python >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo [OK] Python is installed: !PYTHON_VERSION!
    
    REM Check Robot Framework
    python -c "import robot" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Robot Framework is installed
    ) else (
        echo [WARNING] Robot Framework is not installed
        echo    Run: pip install -r requirements.txt
    )
) else (
    echo [WARNING] Python is not installed
    echo    Install Python to run Robot Framework tests
)
echo.

REM Check if Next.js dev server is running
echo Checking Next.js dev server...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Next.js dev server is running on http://localhost:3000
) else (
    echo [WARNING] Next.js dev server is not running
    echo    Start it with: npm run dev
    echo    (Required for E2E and Robot Framework tests)
)
echo.

REM Summary
echo ================================
echo Summary
echo ================================
echo.
echo To run tests:
echo   Unit tests:        npm test
echo   Cypress E2E:       npm run cypress:run:e2e (requires dev server)
echo   Cypress Component: npm run cypress:run:component
echo   Robot Framework:   npm run test:robot (requires dev server)
echo.
echo See RUNNING_TESTS.md for detailed instructions.
echo.
pause
