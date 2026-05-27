# SalonHub API

A modern REST API for salon management, built with Spring Boot and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Local Development

```powershell
# Clone the repository
git clone <repository-url>
cd salon-hub-api

# Quick start (recommended) - handles port conflicts automatically
.\start-app.ps1 -Local

# Or with Docker + PostgreSQL
.\start-app.ps1 -Docker

# Stop the application
.\stop-app.ps1
```

### 📚 Documentation
- **[Development Guide](docs/DEVELOPMENT.md)** - Complete setup guide with smart scripts
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Security & Permissions](docs/SECURITY-PERMISSIONS.md)** - API security documentation

### API Documentation
- **Swagger UI**: `http://localhost:8082/swagger-ui/index.html`
- **OpenAPI Docs**: `http://localhost:8082/v3/api-docs`

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**Development Guide**](docs/DEVELOPMENT.md) | Development setup, workflow, and quick reference |
| [**Deployment Guide**](docs/DEPLOYMENT.md) | Production deployment to Render with PostgreSQL |
| [**Migration Log**](docs/MIGRATION-LOG.md) | Database migration history and changes |
| [**Copilot Instructions**](.github/copilot-instructions.md) | Detailed coding standards and best practices |

## 🏗️ Architecture

### Technology Stack
- **Framework**: Spring Boot 3.4.5
- **Database**: PostgreSQL 13+
- **Testing**: JUnit 5, Testcontainers
- **Build Tool**: Gradle 8.13
- **Deployment**: Docker, Render

### Project Structure
```
src/main/java/com/salonhub/api/
├── Application.java
├── appointment/          # Appointment management
├── auth/                 # Authentication & authorization
├── checkin/             # Customer check-in system
├── customer/            # Customer management
├── employee/            # Employee management
├── queue/               # Queue management
└── common/              # Shared utilities
```

## 🧪 Testing

```powershell
# Run unit tests
.\gradlew.bat test

# Run integration tests
.\gradlew.bat integrationTest

# Run all tests
.\gradlew.bat check
```

## 🐳 Docker

```powershell
# Start full stack (app + database)
docker-compose up --build

# Start only database
docker-compose up db -d

# View logs
docker logs salon-hub-api-app-1
```

## 🔗 API Endpoints

### Core Features
- **Customers**: `/api/customers` - Customer management
- **Employees**: `/api/employees` - Employee management  
- **Appointments**: `/api/appointments` - Appointment scheduling
- **Queue**: `/api/queue` - Queue management
- **Check-in**: `/api/checkin` - Customer check-in

### System
- **Health**: `/actuator/health` - Application health check
- **Docs**: `/v3/api-docs` - OpenAPI specification

## 🌟 Features

- ✅ **Customer Management** - CRUD operations for customers
- ✅ **Employee Management** - Employee profiles and availability
- ✅ **Appointment Scheduling** - Book and manage appointments
- ✅ **Queue System** - Real-time queue management
- ✅ **Check-in System** - Customer arrival tracking
- ✅ **Guest Support** - Support for walk-in customers
- ✅ **PostgreSQL Database** - Reliable data persistence
- ✅ **Docker Support** - Easy deployment and development
- ✅ **Comprehensive Testing** - Unit and integration tests
- ✅ **API Documentation** - Interactive Swagger UI

## 📝 Contributing

1. **Read the [Development Guide](docs/DEVELOPMENT.md)** for coding standards
2. **Create a feature branch**: `git checkout -b feature/short-name`
3. **Write tests first** - All features require comprehensive tests
4. **Run tests**: `.\gradlew.bat check`
5. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for modern salon management**
