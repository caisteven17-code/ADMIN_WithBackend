# Start both frontend and backend in parallel terminals

Write-Host "Starting HopeCard Admin System..." -ForegroundColor Green
Write-Host ""

# Get the script directory (project root)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendPath = Join-Path $scriptPath "backend"
$frontendPath = $scriptPath

# Check if .env files exist
if (!(Test-Path (Join-Path $backendPath ".env"))) {
    Write-Host "Backend .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and fill in your values" -ForegroundColor Yellow
    exit 1
}

if (!(Test-Path (Join-Path $frontendPath ".env.local"))) {
    Write-Host "Frontend .env.local file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env.local and fill in your values" -ForegroundColor Yellow
    exit 1
}

# Start backend in a new terminal
Write-Host "Starting Backend (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new terminal
Write-Host "Starting Frontend (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host ""
Write-Host "Both servers starting!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
