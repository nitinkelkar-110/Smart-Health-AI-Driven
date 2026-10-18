@echo off
setlocal enabledelayedexpansion
title Push MediGrid AI to GitHub

echo ============================================================================
echo               MEDIGRID AI — ONE-CLICK GITHUB PUSH SCRIPT
echo ============================================================================
echo.

:: 1. Verify Git Installation
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not found in your PATH. Please install Git first.
    pause
    exit /b 1
)

:: 2. Ensure we are on branch main
git branch -M main >nul 2>nul

:: 3. Check if remote 'origin' already exists
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [INFO] No GitHub remote is currently configured for this repository.
    echo.
    echo Please create a new repository on GitHub (https://github.com/new^)
    echo and paste your repository URL below:
    echo Example: https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    echo.
    set /p REPO_URL="Enter GitHub Repository URL: "
    if "!REPO_URL!"=="" (
        echo [ERROR] No URL provided. Aborting.
        pause
        exit /b 1
    )
    git remote add origin !REPO_URL!
    echo [OK] Remote 'origin' added: !REPO_URL!
) else (
    for /f "tokens=*" %%a in ('git remote get-url origin') do set CURRENT_REMOTE=%%a
    echo [INFO] Current GitHub Remote: !CURRENT_REMOTE!
    echo.
    set /p CHANGE_REMOTE="Do you want to change this remote? (y/N): "
    if /i "!CHANGE_REMOTE!"=="y" (
        set /p NEW_URL="Enter new GitHub Repository URL: "
        if not "!NEW_URL!"=="" (
            git remote set-url origin !NEW_URL!
            echo [OK] Remote updated to: !NEW_URL!
        )
    )
)

echo.
echo ----------------------------------------------------------------------------
echo Staging and committing any recent changes...
echo ----------------------------------------------------------------------------

:: 4. Check status and stage
git add .

:: Check if there are changes to commit
git diff --cached --quiet
if %ERRORLEVEL% neq 0 (
    set /p COMMIT_MSG="Enter commit message (Press Enter for default): "
    if "!COMMIT_MSG!"=="" (
        set COMMIT_MSG=feat: update MediGrid AI full-stack platform
    )
    git commit -m "!COMMIT_MSG!"
    echo [OK] Changes committed.
) else (
    echo [INFO] All files are already up-to-date and committed.
)

echo.
echo ----------------------------------------------------------------------------
echo Pushing branch 'main' to GitHub...
echo ----------------------------------------------------------------------------
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ============================================================================
    echo       [SUCCESS] Successfully pushed MediGrid AI to GitHub!
    echo ============================================================================
) else (
    echo.
    echo ----------------------------------------------------------------------------
    echo [NOTICE] If the push was rejected because the remote repository contains 
    echo          existing files (like a README or LICENSE), try:
    echo          git pull origin main --rebase
    echo          git push -u origin main
    echo.
    echo If GitHub requested credentials:
    echo 1. Sign in via the browser popup, OR
    echo 2. Use a GitHub Personal Access Token (Classic) with 'repo' permissions
    echo ----------------------------------------------------------------------------
)

echo.
pause
