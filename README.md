<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

# Restaurant List API

**API para búsqueda de restaurantes utilizando geolocalización.**

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura y Estilo del Código](#estructura-y-estilo-del-código)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución Local y Docker](#ejecución-local-y-docker)
- [Pruebas Automatizadas](#pruebas-automatizadas)
- [Documentación de la API](#documentación-de-la-api)
- [Notas y Buenas Prácticas](#notas-y-buenas-prácticas)
- [Licencia](#licencia)

---

## Descripción General

Esta API permite a los usuarios autenticados buscar restaurantes cercanos a una ubicación específica, ya sea mediante texto (dirección, ciudad, etc.) o coordenadas geográficas directas. El sistema registra las búsquedas realizadas y permite consultar el historial de cada usuario.

El proyecto está desarrollado con **NestJS** y sigue estándares internacionales de desarrollo backend, priorizando la claridad, mantenibilidad y escalabilidad.

---

## Características Principales

- **Autenticación JWT**: Registro, login y logout de usuarios.
- **Búsqueda de restaurantes**: Por dirección, ciudad o coordenadas, con radio configurable.
- **Historial de búsquedas**: Consulta de búsquedas previas por usuario.
- **Integración con API externa**: Uso de Geoapify para geolocalización.
- **Persistencia robusta**: Base de datos PostgreSQL gestionada con TypeORM.
- **Documentación interactiva**: Swagger disponible para explorar y probar la API.

---

## Stack Tecnológico

- **Node.js** (v23)
- **NestJS** (TypeScript)
- **PostgreSQL** (v14+)
- **TypeORM**
- **JWT** para autenticación
- **Geoapify API** para geolocalización
- **Docker & Docker Compose** para despliegue y entorno reproducible

---

## Estructura y Estilo del Código

- **Inglés como idioma base**: Todo el código, nombres de variables, funciones y clases están en inglés, siguiendo el estándar global de la industria para facilitar la colaboración internacional y la mantenibilidad.
- **Comentarios estratégicos**: Los comentarios se han utilizado exclusivamente para explicar la lógica de funciones, controladores, entidades, helpers y estrategias, facilitando la comprensión rápida del flujo y propósito de cada componente.
- **Arquitectura modular**: Separación clara de responsabilidades en módulos, servicios, controladores y entidades.

---

## Instalación y Configuración

### 1. Clona el repositorio

```bash
git clone https://github.com/AlejandroChing11/restaurant.list.api
cd restaurant.list.api
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DB_NAME=restaurantapi
DB_PASSWORD=postgres
JWT_SECRET=your_jwt_secret
API_KEY=your_geoapify_api_key (En archivo de documentacion esta la api key utilizada)
```

> **Nota:** Puedes solicitar una API Key gratuita en [Geoapify](https://www.geoapify.com/).

---

## Ejecución Local y Docker

### Opción 1: Ejecución con Docker (recomendado)

1. **Construye e inicia los servicios:**
   ```bash
   docker-compose up -d
   ```
2. **Accede a la API:**  
   http://localhost:3000

3. **Documentación Swagger:**  
   http://localhost:3000/api

4. **Detén los servicios:**
   ```bash
   docker-compose down
   ```

### Opción 2: Ejecución local (sin Docker)

1. Instala dependencias:
   ```bash
   yarn install
   ```
2. Asegúrate de tener PostgreSQL corriendo y configurado según tu `.env`.
3. Ejecuta la aplicación:
   ```bash
   yarn start:dev
   ```

---

## Pruebas Automatizadas

El proyecto incluye pruebas unitarias y end-to-end (E2E):

- **Unitarias:**  
  ```bash
  yarn test
  ```
- **Cobertura:**  
  ```bash
  yarn test:cov
  ```
- **End-to-End:**  
  ```bash
  yarn test:e2e
  ```

Las pruebas cubren autenticación, lógica de negocio y flujos completos de usuario.

---

## Documentación de la API

- **Swagger UI:**  
  Accesible en [http://localhost:3000/api](http://localhost:3000/api) una vez la API esté corriendo.
- **Endpoints principales:**
  - `/auth/register` — Registro de usuario
  - `/auth/login` — Login
  - `/restaurants/search` — Búsqueda de restaurantes
  - `/restaurants/history` — Historial de búsquedas

---

## Notas y Buenas Prácticas

- **Inglés como estándar:**  
  Todo el código está en inglés para alinearse con las mejores prácticas internacionales y facilitar la colaboración global.
- **Comentarios útiles:**  
  Los comentarios explican únicamente la lógica relevante, evitando redundancia y mejorando la legibilidad.
- **Dockerización:**  
  El uso de Docker y Docker Compose permite que cualquier persona pueda levantar el entorno completo con un solo comando, sin preocuparse por dependencias locales o versiones de Node/PostgreSQL.
- **Seguridad:**  
  Las variables sensibles (como JWT_SECRET y API_KEY) nunca se exponen en el código fuente y deben ser gestionadas mediante el archivo `.env`.

---

¿Dudas, sugerencias o feedback? ¡No dudes en abrir un issue o contactarme! Muchas gracias por la oportunidad!
