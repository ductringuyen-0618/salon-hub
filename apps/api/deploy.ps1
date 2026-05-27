# SalonHub API Production Deployment Script for Windows

Write-Host "🚀 Starting SalonHub API Production Deployment..." -ForegroundColor Green

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Yellow
.\gradlew.bat clean bootJar

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix the errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Build Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
docker build -t salon-hub-api:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built successfully!" -ForegroundColor Green

# Test the Docker image locally (optional)
Write-Host "🧪 Testing Docker image locally..." -ForegroundColor Yellow
docker run --rm -d -p 8080:8080 `
  -e SPRING_PROFILES_ACTIVE=prod `
  -e DB_PASSWORD=test `
  -e JWT_SECRET=test-secret-key-for-local-testing-only `
  --name salon-hub-test `
  salon-hub-api:latest

# Wait a bit for the container to start
Start-Sleep -Seconds 10

# Check if container is running
$containerStatus = docker ps --filter "name=salon-hub-test" --format "table {{.Names}}"

if ($containerStatus -match "salon-hub-test") {
    Write-Host "✅ Container is running!" -ForegroundColor Green
    docker stop salon-hub-test | Out-Null
} else {
    Write-Host "❌ Container failed to start. Check logs:" -ForegroundColor Red
    docker logs salon-hub-test
    docker rm salon-hub-test | Out-Null
    exit 1
}

Write-Host "🎉 Production build ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Push your code to GitHub" -ForegroundColor White
Write-Host "   2. Connect your Render service to your GitHub repository" -ForegroundColor White
Write-Host "   3. Set environment variables in Render:" -ForegroundColor White
Write-Host "      - SPRING_PROFILES_ACTIVE=prod" -ForegroundColor Gray
Write-Host "      - DB_PASSWORD=<your-postgres-password>" -ForegroundColor Gray
Write-Host "      - JWT_SECRET=<secure-random-string>" -ForegroundColor Gray
Write-Host "   4. Deploy!" -ForegroundColor White
