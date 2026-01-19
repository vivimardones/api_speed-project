# Speed Project – Backend API

## Descripción del proyecto

Este repositorio contiene el desarrollo del backend del sistema Speed Project, el cual corresponde a una API que permite gestionar la información de un club deportivo, incluyendo usuarios, clubes, campeonatos, entrenamientos, pagos y comunicaciones.

La API fue desarrollada como parte del Proyecto de Título, con el objetivo de centralizar la información del club y facilitar la planificación deportiva y administrativa.

---

## Tecnologías utilizadas

- Node.js  
- Express  
- Firebase Firestore  
- JavaScript  
- Postman (para pruebas de endpoints)

---

## Arquitectura general

El backend está construido bajo una arquitectura en capas, separando responsabilidades entre:

- Rutas  
- Controladores  
- Servicios  
- Acceso a datos (Firebase)

La base de datos utilizada es Firebase Firestore, siguiendo un enfoque NoSQL orientado a consultas y desnormalización controlada.

---

## Requisitos previos

Antes de ejecutar el proyecto es necesario contar con:

- Node.js instalado  
- NPM instalado  
- Una cuenta de Firebase con un proyecto creado  
- Archivo de credenciales de Firebase (service account)

---

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/vivimardones/club-api_speed-project.git
```

2. Ingresar al directorio del proyecto:
```bash
cd club-api_speed-project
```
3. Instalar dependencias:
```bash
npm install
```
## Configurar Firebase:
- Crear un proyecto en Firebase
- Habilitar Firestore
- Descargar el archivo de credenciales
- Configurar las credenciales según el archivo de configuración del proyecto

## Ejecución del proyecto
  Para levantar el servidor en entorno local:
  ```bash
  npm run dev
  ```
El backend quedará disponible en el puerto configurado en el proyecto (por defecto http://localhost:3000).

## Endpoints principales
La API expone endpoints para la gestión de:
- Usuarios
- Clubes
- Campeonatos
- Entrenamientos
- Inscripciones
- Pagos
- Comunicaciones

Las pruebas de los endpoints se realizaron utilizando Postman, validando los flujos principales del sistema.

## Pruebas
Las pruebas se realizaron de forma manual mediante Postman, verificando:
- Creación de registros
- Obtención de datos
- Actualización de información
- Manejo de estados

Estas pruebas permiten validar el correcto funcionamiento de la API y su integración con la base de datos Firestore.

## Relación con el Frontend

Este backend es consumido por el frontend del proyecto, el cual se encuentra disponible en el siguiente repositorio:

https://github.com/vivimardones/front_speed_project

La comunicación entre frontend y backend se realiza mediante peticiones HTTP a los endpoints definidos en esta API.

## Autora

Proyecto desarrollado por Viviana Mardones
Proyecto de Título – Analista Programador

