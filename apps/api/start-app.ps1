# SalonHub API Smart Startup Script
# Automatically handles port conflicts and container management

param(
    [switch]$Docker = $false,    # Use Docker containers
    [switch]$Local = $false,     # Run locally with H2 database
    [switch]$Clean = $false      # Force clean restart
)

# Color output functions
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Stop-AllProcessesOnPort {
    param($Port)
    
    Write-Info "Checking for processes on port $Port..."
    
    # Find and kill Java processes on the port
    $javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
    if ($javaProcesses) {
        Write-Warning "Found Java processes running. Stopping them..."
        $javaProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Success "Java processes stopped"
    }
    
    # Find processes using the port using netstat
    try {
        $netstatOutput = netstat -ano | Select-String ":$Port " | Select-String "LISTENING"
        if ($netstatOutput) {
            $netstatOutput | ForEach-Object {
                $line = $_.Line
                $pid = ($line -split '\s+')[-1]
                if ($pid -and $pid -ne "0") {
                    Write-Warning "Stopping process $pid using port $Port"
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    } catch {
                        Write-Warning "Could not stop process $pid (may have already stopped)"
                    }
                }
            }
            Start-Sleep -Seconds 2
        }
    } catch {
        Write-Info "No processes found on port $Port using netstat"
    }
}

function Stop-DockerContainers {
    Write-Info "Stopping SalonHub Docker containers..."
    
    try {
        # Stop and remove containers
        docker-compose down 2>$null
        
        # If clean flag is set, also remove volumes
        if ($Clean) {
            Write-Warning "Clean flag set - removing Docker volumes and data"
            docker-compose down -v 2>$null
            docker volume prune -f 2>$null
        }
        
        Write-Success "Docker containers stopped"
    } catch {
        Write-Info "No Docker containers to stop"
    }
}

function Test-Port {
    param($Port)
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

function Start-DockerApplication {
    Write-Info "Starting application with Docker..."
    
    # Build the JAR first
    Write-Info "Building application JAR..."
    .\gradlew.bat bootJar
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build JAR"
        exit 1
    }
    
    # Start Docker containers
    Write-Info "Starting Docker containers..."
    docker-compose up --build -d
    
    # Wait for application to start
    Write-Info "Waiting for application to start..."
    $maxAttempts = 30
    $attempt = 0
    
    do {
        Start-Sleep -Seconds 2
        $attempt++
        Write-Host "." -NoNewline
        
        if (Test-Port 8082) {
            Write-Host ""
            Write-Success "Application started successfully!"
            Write-Info "Swagger UI: http://localhost:8082/swagger-ui/index.html"
            Write-Info "API Docs: http://localhost:8082/v3/api-docs"
            return
        }
    } while ($attempt -lt $maxAttempts)
    
    Write-Host ""
    Write-Error "Application failed to start within timeout"
    Write-Info "Check Docker logs: docker logs salon-hub-api-app-1"
}

function Start-LocalApplication {
    Write-Info "Starting application locally with H2 database..."
    
    # Check if port is available
    if (Test-Port 8082) {
        Write-Error "Port 8082 is still in use. Trying to free it..."
        Stop-AllProcessesOnPort 8082
        Start-Sleep -Seconds 3
        
        if (Test-Port 8082) {
            Write-Error "Could not free port 8082. Please restart your computer or manually kill the process."
            exit 1
        }
    }
    
    Write-Info "Starting Spring Boot application..."
    Write-Info "Use Ctrl+C to stop the application"
    Write-Info "Swagger UI will be available at: http://localhost:8082/swagger-ui/index.html"
    
    # Start the application
    .\gradlew.bat bootRun --args='--spring.profiles.active=test'
}

# Main script logic
Write-Info "SalonHub API Startup Script"
Write-Info "=============================="

# Stop any existing processes/containers first
Stop-AllProcessesOnPort 8082
Stop-DockerContainers

# Determine startup mode
if ($Docker) {
    Start-DockerApplication
} elseif ($Local) {
    Start-LocalApplication
} else {
    # Interactive mode - ask user
    Write-Info "Choose startup mode:"
    Write-Info "1. Local (H2 database, fastest for development)"
    Write-Info "2. Docker (PostgreSQL database, production-like)"
    
    do {
        $choice = Read-Host "Enter choice (1 or 2)"
    } while ($choice -notin @("1", "2"))
    
    if ($choice -eq "1") {
        Start-LocalApplication
    } else {
        Start-DockerApplication
    }
}
