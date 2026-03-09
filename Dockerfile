# ── Stage 1: Build React ────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

ARG VITE_WS_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# ── Stage 2: Nginx serve estático ────────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80