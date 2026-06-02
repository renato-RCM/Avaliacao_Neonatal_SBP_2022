# =========================================================
# Avaliacao Neonatal SBP 2022 — Dockerfile multi-stage
# =========================================================
#
# Stage 1 (build):   Node Alpine compila a SPA React/Vite
# Stage 2 (runtime): nginx:alpine serve a pasta dist/ estatica
#
# Tamanho final esperado: ~50 MB (nginx alpine + assets gzipados)
# =========================================================

# ---------- Stage 1: build da SPA ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copia somente os manifests primeiro para aproveitar o cache do Docker:
# se package.json/lock nao mudaram, o `npm ci` reutiliza camada.
COPY package*.json ./

# `npm ci` é determinístico (usa package-lock.json) e mais rápido
# que `npm install`. Mantemos devDependencies aqui pois o build
# precisa do Vite/TypeScript/Tailwind para gerar dist/.
RUN npm ci --no-audit --no-fund

# Copia o restante do código-fonte
COPY . .

# Gera a build de produção em /app/dist (TypeScript build + Vite build)
RUN npm run build


# ---------- Stage 2: runtime nginx ----------
FROM nginx:1.27-alpine AS runtime

# wget é usado pelo HEALTHCHECK
RUN apk add --no-cache wget tzdata && \
    cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone

# Remove a config default do nginx e usa a nossa (com SPA fallback)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia somente os artefatos estáticos da SPA
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 6689

# Healthcheck: nginx responde ao endpoint estático /index.html
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O- http://127.0.0.1:6689/ >/dev/null || exit 1

# nginx ja roda no foreground com o entrypoint padrao da imagem oficial.
CMD ["nginx", "-g", "daemon off;"]
