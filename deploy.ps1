$ErrorActionPreference = "Stop"

# PRIME RPG deploy script
# Run from: C:\PrimeRPG

$repoUrl = "https://github.com/Coldqh/LifeRPG.git"

Write-Host "PRIME RPG deploy started..." -ForegroundColor Green

if (-not (Test-Path "index.html")) {
  Write-Host "index.html not found. Run this script inside C:\PrimeRPG after extracting the app files." -ForegroundColor Red
  exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git not found. Install Git for Windows first." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path ".git")) {
  git init
}

git branch -M main

git remote remove origin 2>$null
git remote add origin $repoUrl

git add .

$hasChanges = git status --porcelain
if ($hasChanges) {
  git commit -m "Deploy PRIME RPG v0.1"
} else {
  Write-Host "No changes to commit." -ForegroundColor Yellow
}

git push -u origin main

Write-Host "Done. Now open GitHub -> Settings -> Pages -> Deploy from a branch -> main / root." -ForegroundColor Green
