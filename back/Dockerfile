FROM node:20-alpine

WORKDIR /app

# Copiamos package.json y package-lock.json (tu repo tiene ambos en el back)
COPY package*.json ./

RUN npm install

# Copiamos el resto del código del backend (src, tsconfig, etc.)
COPY . .

# Compilamos TypeScript a la carpeta dist/
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]