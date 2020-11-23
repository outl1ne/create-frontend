FROM node:14-alpine
WORKDIR /app

# Install dependencies
COPY package.json /app/
COPY package-lock.json /app/
RUN npm ci

# Build application
COPY . /app
RUN npm run build

CMD ["npm", "start"]
