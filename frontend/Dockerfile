# Usa una imagen base de Node.js
FROM node:18-alpine
# Instala curl, htop y otras herramientas básicas
RUN apk add --no-cache curl htop

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias de la aplicación

# Copia el resto del código de la aplicación
COPY . .

# Establece las variables de entorno de build (NEXT_PUBLIC_API_URL vendrá del docker-compose.yml)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Construye la aplicación de Next.js en modo producción

# Exponer el puerto donde se ejecutará Next.js (3000 en este caso)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
