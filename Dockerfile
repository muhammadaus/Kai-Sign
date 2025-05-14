FROM python:3.12-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose port
EXPOSE 8000

# Set environment variables
ENV PORT=8000

# Run the FastAPI application
CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"] 