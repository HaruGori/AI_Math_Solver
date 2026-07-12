FROM mcr.microsoft.com/devcontainers/python:3.11

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm@10.12.1 \
    && pip install uv \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
