FROM node:22-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
ENV PORT=8080
EXPOSE 8080
CMD ["npm","start"]
