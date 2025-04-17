FROM node:22-alpine

WORKDIR /app

# 1) install all deps (prod + dev)
COPY package*.json ./
RUN npm install

# 2) add psql client so we can sync the DB
RUN apk add --no-cache postgresql-client

# 3) copy the rest of your app
COPY . .

# 4) copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]