# Clean Next.js build directory (Windows)
# Fixes EINVAL errors when Next.js tries to clean .next folder

Write-Host "Cleaning Next.js build directory..." -ForegroundColor Yellow

$frontendPath = Join-Path $PSScriptRoot "..\frontend"
$nextPath = Join-Path $frontendPath ".next"

if (Test-Path $nextPath) {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    try {
        Remove-Item -Path $nextPath -Recurse -Force -ErrorAction Stop
        Write-Host "✓ Successfully removed .next directory" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error removing .next directory: $_" -ForegroundColor Red
        Write-Host "Try running PowerShell as Administrator" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host ".next directory doesn't exist - nothing to clean" -ForegroundColor Gray
}

Write-Host "Done! Restart your dev server." -ForegroundColor Green
