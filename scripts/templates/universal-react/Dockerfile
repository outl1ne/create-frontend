FROM node:10-alpine
WORKDIR /app

# Install dependencies
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install

# Build application
COPY . /app
RUN npm run build

CMD ["npm", "start"]