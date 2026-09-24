# --------------------------------------------------
# Trackzy Backend
# --------------------------------------------------

# Match the Python version used in development
FROM python:3.12.2-slim

# Python/container settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# All subsequent commands run from /app
WORKDIR /app


# --------------------------------------------------
# Dependencies
# --------------------------------------------------

# Copy dependency file first.
# This allows Docker to cache this layer when only
# application code changes.
COPY requirements.lock.txt .

# Install dependencies and verify their dependency graph
# Upgrade pip
RUN python -m pip install --upgrade pip

# Install CPU-only PyTorch first.
# Oracle A1 has no NVIDIA GPU, so CUDA packages are unnecessary.
RUN pip install --no-cache-dir \
    torch==2.11.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install remaining locked dependencies.
RUN pip install --no-cache-dir -r requirements.lock.txt

# Verify dependency consistency.
RUN pip check


# --------------------------------------------------
# Dependency smoke tests
# --------------------------------------------------

# Verify important ML/native dependencies can actually import
RUN python -c "\
import torch; \
import sentence_transformers; \
import numpy; \
import scipy; \
import sklearn; \
print('Torch version:', torch.__version__); \
print('CUDA available:', torch.cuda.is_available()); \
print('ML dependencies OK')"

# Verify important backend dependencies
RUN python -c "import fastapi; import sqlalchemy; import sqlmodel; import asyncpg; import firebase_admin; import groq; print('Backend dependencies OK')"


# --------------------------------------------------
# Application
# --------------------------------------------------

COPY . .


# --------------------------------------------------
# Runtime
# --------------------------------------------------

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]