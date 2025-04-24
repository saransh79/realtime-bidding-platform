FROM python:3.9-slim

WORKDIR /app

# Install pipenv
RUN pip install pipenv

# Copy Pipfile
COPY Pipfile Pipfile.lock* ./

# Install dependencies
RUN pipenv install --system --deploy --ignore-pipfile

# Copy application code
COPY . .

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 