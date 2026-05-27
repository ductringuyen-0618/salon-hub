# SalonHub API - Production Deployment Guide

## 🚀 Deploying to Render with PostgreSQL

This guide walks you through deploying the SalonHub API to Render with a PostgreSQL database.

### Prerequisites

1. A [Render](https://render.com) account
2. Your code pushed to a GitHub repository
3. PostgreSQL database credentials from Render

### Step 1: Database Setup

If you haven't already created a PostgreSQL database on Render:

1. Go to your Render dashboard
2. Click "New" → "PostgreSQL"
3. Configure your database:
   - Name: `salon-hub-db`
   - Database Name: `salon_hub`
   - User: `salon_hub_api`
   - Plan: Free (or upgrade as needed)
4. Save the database credentials (you'll need the password)

### Step 2: Environment Configuration

Your application uses the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Spring profile to use | `prod` |
| `DB_PASSWORD` | PostgreSQL database password | `your-db-password` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secure-random-string` |

### Step 3: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Push your code** to GitHub with the `render.yaml` file included
2. **Create a new Web Service** on Render:
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration
3. **Set environment variables** in Render dashboard:
   ```
   SPRING_PROFILES_ACTIVE=prod
   DB_PASSWORD=<your-postgres-password>
   JWT_SECRET=<generate-a-secure-random-string>
   ```
4. **Deploy!** Render will automatically build and deploy your application

#### Option B: Manual Configuration

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure the service**:
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Build Command**: `./gradlew bootJar`
   - **Port**: `8080`
4. **Set environment variables** (same as Option A)
5. **Deploy**

### Step 4: Verify Deployment

After deployment, verify everything is working:

1. **Health Check**: Visit `https://your-app.onrender.com/actuator/health`
2. **API Documentation**: Visit `https://your-app.onrender.com/swagger-ui/index.html`
3. **Test API endpoints**: Use Postman or curl to test your endpoints

### Database Migration

The application will automatically run PostgreSQL migrations on startup using Flyway. The migrations are located in:
```
src/main/resources/db/migration/
```

### Local Testing

To test the production build locally:

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Troubleshooting

#### Common Issues

1. **Database Connection Error**
   - Verify your PostgreSQL credentials
   - Check that the database URL in `prod.yml` matches your Render database

2. **Migration Errors**
   - Ensure your database is empty before first deployment
   - Check migration files for PostgreSQL compatibility

3. **Memory Issues**
   - The Dockerfile is configured with `-Xmx1g` (1GB memory limit)
   - Adjust if you're on a different Render plan

4. **Health Check Failures**
   - Check that `/actuator/health` endpoint is accessible
   - Verify your application starts within 40 seconds

#### Logs

View application logs in the Render dashboard:
1. Go to your service
2. Click on "Logs" tab
3. Look for startup errors or runtime issues

### Production Configuration

The `prod.yml` configuration includes:

- **PostgreSQL** database connection
- **Connection pooling** with HikariCP
- **Health checks** via Spring Actuator
- **Flyway migrations** enabled
- **Logging** optimized for production
- **Security** configurations

### Security Notes

1. **Never commit secrets** to your repository
2. **Use environment variables** for all sensitive data
3. **Generate strong JWT secrets** (at least 256 bits)
4. **Enable HTTPS** (automatic on Render)
5. **Regular security updates** for dependencies

### Scaling

Render's free tier includes:
- 512 MB RAM
- 0.5 CPU
- Sleeps after 15 minutes of inactivity

For production workloads, consider upgrading to:
- **Starter Plan**: Always-on, 1 GB RAM, 1 CPU
- **Standard Plan**: 2 GB RAM, 1 CPU
- **Pro Plan**: 4 GB RAM, 2 CPU

### Monitoring

Monitor your application with:
- **Render Metrics**: CPU, memory, request metrics
- **Application Logs**: Via Render dashboard
- **Health Checks**: `https://your-app.onrender.com/actuator/health`
- **Database Metrics**: In Render PostgreSQL dashboard

### Support

For issues:
1. Check the [Render documentation](https://render.com/docs)
2. Review application logs
3. Verify environment variables
4. Test locally with production configuration

---

## 🔄 Development Workflow

### Local Development
- Use `application.yml` with PostgreSQL
- Run: `./gradlew bootRun`

### Production Testing
- Use `prod.yml` with PostgreSQL
- Run: `SPRING_PROFILES_ACTIVE=prod ./gradlew bootRun`

### Deployment
- Push to GitHub
- Render auto-deploys from your main branch

---

Happy coding! 🎉
