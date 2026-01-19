#!/bin/bash

# Script de backup automático para WaterLog
# Uso: ./scripts/backup.sh
# Para automatizar: agregar a crontab: 0 2 * * * /path/to/backup.sh

set -e

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="./data/waterlog.db"
UPLOADS_DIR="./uploads"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚰 WaterLog - Backup"
echo "===================="
echo ""

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"

# Nombre del backup
BACKUP_NAME="waterlog_backup_${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

echo "${YELLOW}⏳${NC} Creando backup..."

# Crear directorio temporal para este backup
mkdir -p "$BACKUP_PATH"

# Copiar base de datos
if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "${BACKUP_PATH}/waterlog.db"
    echo "${GREEN}✓${NC} Base de datos respaldada"
else
    echo "${YELLOW}⚠${NC} No se encontró la base de datos en $DB_FILE"
fi

# Copiar evidencias (fotos)
if [ -d "$UPLOADS_DIR" ]; then
    cp -r "$UPLOADS_DIR" "${BACKUP_PATH}/uploads"
    echo "${GREEN}✓${NC} Evidencias respaldadas"
fi

# Comprimir
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
cd ..

# Tamaño del backup
BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)

echo ""
echo "${GREEN}✅ Backup completado!${NC}"
echo "   Archivo: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "   Tamaño: $BACKUP_SIZE"

# Limpiar backups antiguos (mantener últimos 30 días)
echo ""
echo "🧹 Limpiando backups antiguos..."
find "$BACKUP_DIR" -name "waterlog_backup_*.tar.gz" -type f -mtime +30 -delete
echo "${GREEN}✓${NC} Backups antiguos eliminados (>30 días)"

echo ""
echo "Para restaurar este backup:"
echo "  tar -xzf ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz -C ${BACKUP_DIR}"
echo "  cp ${BACKUP_DIR}/${BACKUP_NAME}/waterlog.db ./data/"
echo "  cp -r ${BACKUP_DIR}/${BACKUP_NAME}/uploads ./uploads"