# Multi-stage build for production
FROM eclipse-temurin:17-jdk AS builder

# Set the working directory
WORKDIR /app

# Copy gradle files
COPY gradle gradle
COPY gradlew gradlew.bat build.gradle settings.gradle ./

# Make gradlew executable
RUN chmod +x gradlew

# Download dependencies
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build the application
RUN ./gradlew bootJar --no-daemon

# Production stage
FROM eclipse-temurin:17-jre

# Set the working directory
WORKDIR /app

# Copy the built jar file
COPY --from=builder /app/build/libs/salon-hub-api-0.0.1-SNAPSHOT.jar app.jar

# Create non-root user for security
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application with production profile
ENTRYPOINT ["java", "-Xmx1g", "-Dspring.profiles.active=prod", "-jar", "app.jar"]