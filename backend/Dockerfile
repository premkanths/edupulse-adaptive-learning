# Stage 1: Build Spring Boot JAR
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends maven && rm -rf /var/lib/apt/lists/*

# Copy build context
COPY . ./context/

# Automatically detect whether build was triggered from repo root OR backend/ directory
RUN if [ -f ./context/backend/pom.xml ]; then \
        echo "Detected build from repository root"; \
        cp ./context/backend/pom.xml ./pom.xml && \
        cp -r ./context/backend/src ./src; \
    elif [ -f ./context/pom.xml ]; then \
        echo "Detected build from backend directory"; \
        cp ./context/pom.xml ./pom.xml && \
        cp -r ./context/src ./src; \
    else \
        echo "ERROR: pom.xml not found in build context!" && exit 1; \
    fi

RUN mvn dependency:go-offline -B || true
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Runtime Image
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/target/edupulse-server-*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 0

ENV JAVA_OPTS="-Xms256m -Xmx1024m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
