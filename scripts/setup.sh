#!/bin/bash

# Script de setup inicial del proyecto WaterLog
# Uso: ./scripts/setup.sh

set -e  # Salir si hay error

echo "🚰 WaterLog - Setup Inicial"
echo "============================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

echo "${GREEN}✓${NC} Docker y Docker Compose encontrados"

# Crear archivos .env si no existen
if [ ! -f backend/.env ]; then
    echo "${YELLOW}⚠${NC} Creando backend/.env desde .env.example..."
    cp backend/.env.example backend/.env
    
    # Generar SECRET_KEY aleatorio
    SECRET_KEY=$(openssl rand -hex 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your-super-secret-key-change-this-in-production-min-32-chars/$SECRET_KEY/" backend/.env
    else
        sed -i "s/your-super-secret-key-change-this-in-production-min-32-chars/$SECRET_KEY/" backend/.env
    fi
    echo "${GREEN}✓${NC} SECRET_KEY generado automáticamente"
else
    echo "${GREEN}✓${NC} backend/.env ya existe"
fi

if [ ! -f frontend/.env ]; then
    echo "${YELLOW}⚠${NC} Creando frontend/.env desde .env.example..."
    cp frontend/.env.example frontend/.env
else
    echo "${GREEN}✓${NC} frontend/.env ya existe"
fi

# Crear directorios necesarios
mkdir -p data uploads logs
echo "${GREEN}✓${NC} Directorios creados"

# Build y levantar contenedores
echo ""
echo "🐳 Construyendo contenedores Docker..."
docker-compose build

echo ""
echo "🚀 Levantando servicios..."
docker-compose up -d

echo ""
echo "${GREEN}✅ Setup completado!${NC}"
echo ""
echo "Servicios disponibles:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
echo "Para ver logs: docker-compose logs -f"
echo "Para detener: docker-compose down"
echo ""
echo "⚠️  IMPORTANTE: Cambia las credenciales por defecto"
echo "   Usuario: admin"
echo "   Password: changeme123"