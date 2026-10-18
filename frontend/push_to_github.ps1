# MediGrid AI — PowerShell GitHub Push Helper
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "               MEDIGRID AI — ONE-CLICK GITHUB PUSH SCRIPT                   " -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git is not installed or not in your PATH." -ForegroundColor Red
    exit 1
}

# 2. Branch main
git branch -M main | Out-Null

# 3. Check Remote
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "Please create a new repository on GitHub (https://github.com/new) and paste its URL below." -ForegroundColor Yellow
    $url = Read-Host "Enter GitHub Repository URL (e.g. https://github.com/user/repo.git)"
    if ([string]::IsNullOrWhiteSpace($url)) {
        Write-Host "[ERROR] No URL provided. Aborting." -ForegroundColor Red
        exit 1
    }
    git remote add origin $url.Trim()
    Write-Host "[OK] Added remote origin: $url" -ForegroundColor Green
} else {
    Write-Host "[INFO] Current remote origin: $remoteUrl" -ForegroundColor Gray
}

# 4. Stage and commit
git add .
$status = git status --porcelain
if ($status) {
    $msg = Read-Host "Enter commit message (Leave empty for default)"
    if ([string]::IsNullOrWhiteSpace($msg)) {
        $msg = "feat: update MediGrid AI full-stack platform"
    }
    git commit -m "$msg"
    Write-Host "[OK] Changes committed." -ForegroundColor Green
} else {
    Write-Host "[INFO] Working tree clean. Ready to push." -ForegroundColor Green
}

# 5. Push
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "`n[NOTICE] Push failed or authentication required." -ForegroundColor Yellow
    Write-Host "If the remote repo had existing commits, try: git pull origin main --rebase" -ForegroundColor Gray
}
