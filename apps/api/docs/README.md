# SalonHub API Documentation

Welcome to the SalonHub API documentation hub. This folder contains comprehensive guides for development, deployment, and project maintenance.

## 📖 Documentation Index

### Getting Started
- **[Main README](../README.md)** - Project overview and quick start guide
- **[Development Guide](DEVELOPMENT.md)** - Development setup and workflow
- **[Copilot Instructions](../.github/copilot-instructions.md)** - Detailed coding standards and guidelines

### Operations
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment to Render with PostgreSQL
- **[Migration Log](MIGRATION-LOG.md)** - Database migration history and PostgreSQL transition

## 📋 Quick Reference

### Development Commands
```powershell
# Start development
.\gradlew.bat bootRun

# Run tests
.\gradlew.bat test integrationTest

# Build for production
.\gradlew.bat bootJar
```

### Docker Commands
```powershell
# Full stack
docker-compose up --build

# Database only
docker-compose up db -d
```

### API Endpoints
- **Application**: `http://localhost:8082`
- **API Docs**: `http://localhost:8082/swagger-ui/index.html`
- **Health Check**: `http://localhost:8082/actuator/health`

## 🏗️ Architecture Overview

```
SalonHub API
├── Spring Boot 3.4.5
├── PostgreSQL Database
├── Docker Containerization
├── Comprehensive Testing
└── Production-Ready Deployment
```

## 📚 External Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Render Deployment Guide](https://render.com/docs)

---

**Need help?** Check the specific guides above or review the main project README.
