# Production Dockerfile for Calc Server
FROM python:3.12-alpine AS builder

WORKDIR /app

# Copy requirements and install dependencies
COPY apps/calc_server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-alpine AS runner

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY apps/calc_server ./apps/calc_server

WORKDIR /app/apps/calc_server

EXPOSE 8001 8002 8003

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]
