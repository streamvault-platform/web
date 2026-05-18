FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Default to placeholder so the pre-built image supports runtime injection.
# Override at build time (--build-arg STREAMVAULT_PUBLIC_API_URL=...) to bake
# a specific URL in (static hosting). EXPO_PUBLIC_ prefix is an Expo requirement
# and stays an internal detail — callers always use STREAMVAULT_PUBLIC_API_URL.
ARG STREAMVAULT_PUBLIC_API_URL=__STREAMVAULT_API_URL__
ENV EXPO_PUBLIC_API_URL=${STREAMVAULT_PUBLIC_API_URL}
RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
