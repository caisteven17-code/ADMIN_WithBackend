# Start both frontend and backend in parallel terminals

Write-Host "Starting HopeCard Admin System..." -ForegroundColor Green

# Start backend in a new terminal
Write-Host "Starting Backend (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\UST\3rd Year\TRIBE\Admin - Web\backend'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new terminal
Write-Host "Starting Frontend (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\UST\3rd Year\TRIBE\Admin - Web'; npm run dev"

Write-Host "✅ Both servers started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:5000" -ForegroundColor Yellow
