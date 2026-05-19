FROM mcr.microsoft.com/devcontainers/python:3.12

# Keep image lightweight; project uses Python stdlib scripts only.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/mitrackpng-website
