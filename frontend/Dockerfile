# ==============================================================================
# FRONTEND DOCKERFILE - Build Multi-stage
# ==============================================================================

# Estágio 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio 2: Production
FROM nginx:alpine

# Copiar build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx (se necessário)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Nginx já tem CMD padrão, não precisa redefinir
