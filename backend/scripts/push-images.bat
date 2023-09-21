@echo off

if "%1"=="thuthuka111" (
    echo Pushing to Docker Hub thuthuka111
    set namespace=thuthuka111
) else if "%1"=="docker-registry.thuthuka.me" (
    echo Pushing to private registry docker-registry.thuthuka.me
    set namespace=docker-registry.thuthuka.me
) else (
    echo Please specify either "thuthuka111" or "docker-registry.thuthuka.me" as the second argument.
    echo Example: %0 prod thuthuka111
    echo Example: %0 dev docker-registry.thuthuka.me
    exit /b
)

if "%2"=="prod" (
    echo Setting tag to latest
    set tag=latest
) else if "%2"=="dev" (
    echo Setting tag to dev-latest
    set tag=dev-latest
) else (
    echo Please specify either "prod" or "dev" as the first argument.
    echo "Example: %0 prod <namespace>"
    echo "Example: %0 dev"
    exit /b
)

if "%3"=="no-build" (
    echo Skipping build step
) else (
    echo Building from current branch and pushing to %tag% to repository %namespace%
    docker compose build
)

echo Tagging and pushing webserver
docker tag domain-pulse-webserver %namespace%/domain-pulse-webserver:%tag%
docker push %namespace%/domain-pulse-webserver:%tag%

echo Tagging and pushing domains
docker tag domain-pulse-domains %namespace%/domain-pulse-domain:%tag%
docker push %namespace%/domain-pulse-domain:%tag%

echo Tagging and pushing engine
docker tag domain-pulse-engine %namespace%/domain-pulse-engine:%tag%
docker push %namespace%/domain-pulse-engine:%tag%

echo Tagging and pushing profiles
docker tag domain-pulse-profiles %namespace%/domain-pulse-profiles:%tag%
docker push %namespace%/domain-pulse-profiles:%tag%

echo Tagging and pushing sourceconnector
docker tag domain-pulse-sourceconnector %namespace%/domain-pulse-sourceconnector:%tag%
docker push %namespace%/domain-pulse-sourceconnector:%tag%

echo Tagging and pushing warehouse
docker tag domain-pulse-warehouse %namespace%/domain-pulse-warehouse:%tag%
docker push %namespace%/domain-pulse-warehouse:%tag%