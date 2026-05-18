#!/bin/sh
set -e
# Replace the build-time placeholder with the runtime API URL.
# If STREAMVAULT_API_URL is empty the placeholder becomes an empty string,
# which causes settings.ts to fall back to window.location.origin — correct
# behaviour when web and API share the same origin (e.g. behind Caddy).
find /usr/share/nginx/html -name '*.js' -exec \
    sed -i "s|__STREAMVAULT_API_URL__|${STREAMVAULT_API_URL:-}|g" {} \;
exec nginx -g 'daemon off;'
