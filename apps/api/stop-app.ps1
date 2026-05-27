# SalonHub API Stop Script
# Safely stops all application processes and containers

param(
    [switch]$All = $false,      # Stop everything (Docker + Local)
    [switch]$Clean = $false     # Also remove Docker volumes
)

# Color output functions
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }

Write-Info "SalonHub API Stop Script"
Write-Info "========================"

# Stop Java processes
Write-Info "Stopping Java processes..."
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    $javaProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Success "Java processes stopped"
} else {
    Write-Info "No Java processes found"
}

# Stop Docker containers
Write-Info "Stopping Docker containers..."
try {
    if ($Clean) {
        Write-Warning "Clean flag set - removing volumes and data"
        docker-compose down -v 2>$null
        docker volume prune -f 2>$null
        docker system prune -f 2>$null
    } else {
        docker-compose down 2>$null
    }
    Write-Success "Docker containers stopped"
} catch {
    Write-Info "No Docker containers to stop"
}

# Kill any remaining processes on port 8082
Write-Info "Checking for remaining processes on port 8082..."
try {
    $netstatOutput = netstat -ano | Select-String ":8082 " | Select-String "LISTENING"
    if ($netstatOutput) {
        $netstatOutput | ForEach-Object {
            $line = $_.Line
            $pid = ($line -split '\s+')[-1]
            if ($pid -and $pid -ne "0") {
                Write-Warning "Force stopping process $pid on port 8082"
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
    }
    Write-Success "Port 8082 is now free"
} catch {
    Write-Info "Port 8082 is already free"
}

Write-Success "All SalonHub processes stopped"
Write-Info "You can now restart the application safely"
