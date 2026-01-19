# Usamos una imagen ligera de Node
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar el caché)
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto 3001
EXPOSE 3001

# Comando para iniciar en modo desarrollo (con host 0.0.0.0 para que Docker lo vea)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]