# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY src/Mypaws.Api/Mypaws.Api.csproj src/Mypaws.Api/
COPY src/Mypaws.Application/Mypaws.Application.csproj src/Mypaws.Application/
COPY src/Mypaws.Domain/Mypaws.Domain.csproj src/Mypaws.Domain/
COPY src/Mypaws.Infrastructure/Mypaws.Infrastructure.csproj src/Mypaws.Infrastructure/
RUN dotnet restore src/Mypaws.Api/Mypaws.Api.csproj

# Copy everything and build
COPY . .
RUN dotnet build src/Mypaws.Api/Mypaws.Api.csproj -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish src/Mypaws.Api/Mypaws.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 5000

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Mypaws.Api.dll"]
