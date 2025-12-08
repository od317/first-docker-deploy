# Stage 1: Builder (NAME THIS STAGE!)
FROM node:22 AS builder  
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:22
WORKDIR /app
# Now "builder" stage exists!
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
EXPOSE 3000  
CMD ["npm", "start"]