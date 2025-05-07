# Dockerización de la API de Restaurantes (NestJS)

## Requisitos
- Docker
- Docker Compose

## Configuración inicial

1. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
# Database
DB_NAME=restaurant_db
DB_PASSWORD=postgres

# API
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret

# External API
API_KEY=your_external_api_key
```

Reemplaza los valores de `JWT_SECRET` y `API_KEY` con tus propias claves.

## Ejecución con Docker Compose

Para iniciar la aplicación con Docker Compose:

```bash
docker-compose up -d
```

Esto construirá e iniciará tanto la API NestJS como la base de datos PostgreSQL.

- La API estará disponible en: http://localhost:3000
- PostgreSQL estará disponible en: localhost:5432

## Comandos útiles

- Ver logs de la aplicación:
```bash
docker-compose logs api
```

- Detener la aplicación:
```bash
docker-compose down
```

- Reconstruir después de cambios:
```bash
docker-compose up -d --build
```

## Notas

- El volumen `./src:/app/src` permite realizar cambios en tiempo real durante el desarrollo
- La base de datos persiste en el directorio `./postgres` 