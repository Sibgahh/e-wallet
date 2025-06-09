@echo off
echo ===================================
echo E-Wallet Application Setup
echo ===================================
echo.

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies!
    exit /b %ERRORLEVEL%
)
echo Dependencies installed successfully.
echo.

echo Building shared package...
call npm run build:shared
if %ERRORLEVEL% NEQ 0 (
    echo Error building shared package!
    exit /b %ERRORLEVEL%
)
echo Shared package built successfully.
echo.

echo Checking for .env file...
if not exist backend\.env (
    echo Creating .env file from template...
    copy backend\env.example backend\.env
    echo Please edit backend\.env with your database credentials.
    echo.
)

echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo To start the application:
echo 1. Make sure MySQL is running and the database is set up
echo    (see database/README.md for instructions)
echo.
echo 2. Start the backend:
echo    npm run start:backend
echo.
echo 3. Start the frontend:
echo    npm run start:frontend
echo.
echo 4. Access the application at http://localhost:3000
echo.
echo Test Account:
echo    Username: testuser
echo    Password: password123
echo ===================================

pause 