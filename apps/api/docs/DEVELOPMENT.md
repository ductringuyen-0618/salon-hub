# SalonHub API - Development Setup

## 🚀 Quick Start (No Port Conflicts!)

We've solved the port conflict problem! Use these smart scripts that automatically handle port conflicts and container management.

### One-Click Start Options

#### Option 1: Quick Local Development (Recommended)
```powershell
# Double-click this file or run in PowerShell
.\quick-start.bat
```

#### Option 2: PowerShell Commands
```powershell
# Start with H2 database (fastest, good for development)
.\start-app.ps1 -Local

# Start with Docker + PostgreSQL (production-like)
.\start-app.ps1 -Docker

# Interactive mode (choose at runtime)
.\start-app.ps1
```

#### Option 3: VS Code Tasks
Press `Ctrl+Shift+P` → "Tasks: Run Task" → Choose:
- `SalonHub: Start Local (H2)` - Fast local development
- `SalonHub: Start Docker (PostgreSQL)` - Production-like setup
- `SalonHub: Stop All` - Stop everything safely
- `SalonHub: Clean Restart` - Reset and restart

### Stop Application
```powershell
# Stop all processes and containers
.\stop-app.ps1

# Stop and clean all data (fresh start)
.\stop-app.ps1 -Clean
```

## ✅ Problem Solved: No More Port Conflicts!

### What We Fixed:
1. **Smart port checking** - Automatically detects and kills processes on port 8082
2. **Container management** - Properly stops Docker containers before starting
3. **Process cleanup** - Finds and terminates Java processes that might be stuck
4. **Graceful restart** - Changed Docker restart policy from `always` to `unless-stopped`

### How It Works:
- The scripts automatically check for existing processes on port 8082
- Kill any Java processes that might be running
- Stop any Docker containers properly
- Start fresh with a clean environment
- No more "Port already in use" errors!

### After PC Restart:
Just run `.\start-app.ps1 -Local` and everything works immediately. No manual process killing needed!

## 🔧 Development Workflows

### Daily Development:
```powershell
# Morning startup
.\start-app.ps1 -Local

# Code, test, develop...

# Evening shutdown
.\stop-app.ps1
```

### Testing with Docker:
```powershell
# Start with real PostgreSQL database
.\start-app.ps1 -Docker

# Test your changes

# Stop and clean
.\stop-app.ps1 -Clean
```

### Quick Testing:
```powershell
# Clean restart for testing
.\stop-app.ps1 -Clean
.\start-app.ps1 -Local
```

## 📊 Application Access

Once started, access your application at:
- **Swagger UI**: http://localhost:8082/swagger-ui/index.html
- **API Docs**: http://localhost:8082/v3/api-docs
- **H2 Console**: http://localhost:8082/h2-console (when using local mode)

## 🔑 Test Credentials

For Swagger authentication testing:
- **Admin**: `admin@salonhub.com` / `admin123`
- **Manager**: `manager@salonhub.com` / `manager123`
- **Front Desk**: `frontdesk@salonhub.com` / `frontdesk123`
- **Customer**: `customer@salonhub.com` / `customer123`

## 🛠 Troubleshooting

### Still Getting Port Conflicts?
```powershell
# Nuclear option - stop everything
.\stop-app.ps1 -Clean
# Wait 10 seconds
Start-Sleep -Seconds 10
# Start fresh
.\start-app.ps1 -Local
```

### Check What's Running:
```powershell
# Check Java processes
Get-Process -Name "java" -ErrorAction SilentlyContinue

# Check port 8082 usage
netstat -ano | findstr ":8082"

# Check Docker containers
docker ps
```

### Manual Cleanup (Emergency):
```powershell
# Kill all Java processes
Get-Process -Name "java" | Stop-Process -Force

# Stop all Docker containers
docker stop $(docker ps -aq)
docker system prune -f
```

## 📁 Script Files

- `start-app.ps1` - Smart startup script with port conflict resolution
- `stop-app.ps1` - Safe shutdown script
- `quick-start.bat` - One-click startup for Windows
- `.vscode/tasks.json` - VS Code task definitions

These scripts ensure you **never have port conflicts again**! 🎉
