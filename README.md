# **Inici projecte:**

## **Crea la carpeta del proyecto y accede a ella**.

```
mkdir mi-proyecto-express
cd mi-proyecto-express
```

## **Inicializa el proyecto de Node.js** :

```
npm init -y
```

### **Instala Express**

```
npm install express
```

### Crea tu primer servidor

ejemplo:

```
const express = require('express');
const app = express();
const port = 3000;app.get('/', (req, res) => {
res.send('¡Hola Mundo desde Express!');
});app.listen(port, () => {
console.log(Servidor corriendo en http://localhost:${port});
});
```

### Ejecuta tu servidor

```
node app.js
```

Después, abre tu navegador y visita `http://localhost:3000` para ver el mensaje.

### Inicializa el repositorio en tu proyecto

```
cd mi-proyecto-express
git init -b main
```

### Crea un archivo `.gitignore`

```
# Dependencias
node_modules/

# Variables de entorno
.env

# Logs
*.log

# Archivos del sistema
.DS_Store
Thumbs.db
```

## \_PASOS PARA HACER GIT

### Haz tu primer commit

```
git add .
git commit -m "Commit inicial: proyecto Node + Express"
```

### Comandos que usarás a diario a partir de ahora

```
git status # Ver qué archivos han cambiado
git add archivo.js # Añadir un archivo concreto
git add . # Añadir todos los cambios
git commit -m "mensaje" # Guardar los cambios con un mensaje
git log --oneline # Ver el historial resumido
git diff # Ver los cambios antes de commitear
```

### Conectar con un remoto más adelante

```
git remote add origin https://github.com/tu-usuario/mi-proyecto-express.git
git push -u origin main
```

### Ver las ramas que tienes

```
git branch
```

### Crear una rama nueva

```
git branch nombre-rama
```

### Cambiarte a otra rama

```
git checkout nombre-rama
```

### Crear y cambiarte en un solo paso

```
git checkout -b nombre-rama
```

## Flujo típico de trabajo con ramas

### 1. Asegúrate de estar en main y actualizado

```
git switch main
git pull # si tienes remoto
```

### 2. Crea tu rama de trabajo

```
git switch -c feature/login
```

### 3. Trabaja: edita archivos...

### 4. Guarda los cambios

```
git add .
git commit -m "Añade formulario de login"
```

### 5. Más cambios...

```
git add .
git commit -m "Valida credenciales en el login"
```

### 6. Vuelve a main

```
git switch main
```

### 7. Fusiona tu rama con main

```
git merge feature/login
```

### Borrar una rama ya fusionada

```
git branch -d feature/login
```

## Resumen de los comandos más usados

```
git branch # Ver ramas
git switch -c feature/nueva # Crear y cambiar a nueva rama
git switch main # Volver a main
git merge feature/nueva # Fusionar rama en main
git branch -d feature/nueva # Borrar rama fusionada
git log --oneline --graph --all # Ver el árbol de ramas
```

# **THUNDERCLIENT**

### Crear y configurar una consulta

**1. Crea una nueva petición** : Haz clic en el botón **"New Request"**

1. **Selecciona el método HTTP** : En el desplegable a la izquierda de la barra de URL, elige `GET` (para obtener datos) o `POST` (para enviar datos), etc..
2. **Introduce la URL** : En la barra de direcciones, escribe la ruta de tu API. Para tu servidor local, sería: `http://localhost:3000/`.
3. **Envía la petición** : Pulsa el botón azul **"Send"** (Enviar) a la derecha. Verás la respuesta de tu servidor en el panel inferior.

### Configuraciones avanzadas

Para peticiones más complejas (como un `POST` para crear un usuario), necesitas usar las pestañas que aparecen debajo de la barra de URL.

- **Body (Cuerpo)** : Para enviar datos a tu servidor (por ejemplo, en un `POST`), ve a esta pestaña. Debes seleccionar el modo **JSON** . Aquí escribirás el objeto JSON que tu API espera recibir.[](https://www.geeksforgeeks.org/node-js/introduction-to-thunder-client-for-api-development/#1)
- **⚠️ Consejo clave para JSON** : Para que funcione, **debes añadir manualmente** un encabezado. Ve a la pestaña **"Headers"** y agrega una nueva línea con `Content-Type` como clave y `application/json` como valor. Thunder Client no lo añade automáticamente.[](https://www.php.cn/faq/2293821.html#1)
- **Query Params (Parámetros de consulta)** : Se usan para `GET` y sirven para filtrar datos (ej: `?id=123`). Puedes añadirlos en esta pestaña, pero **recuerda hacer clic en el botón "Add to URL"** que aparece; de lo contrario, no se adjuntarán a la petición.[](https://www.php.cn/faq/2293821.html#1)
- **Headers (Encabezados)** : Aquí puedes añadir cualquier otra cabecera HTTP que necesite tu API, como tokens de autenticación (`Authorization`).

### Guardar tus consultas en el proyecto

1. Una vez configurada una petición, haz clic en el icono de **"Save"** (Guardar) o usa `Ctrl+S`.[](https://thunder-docs-pages.pages.dev/features/common)
2. Te pedirá que la guardes en una **Colección** . Crea una nueva (por ejemplo, "Mi Proyecto Express") y guárdala.
3. Esto creará una carpeta `thunder-tests` en la raíz de tu proyecto. **Esta carpeta es la que debes incluir en Git** para compartir tus pruebas con el equipo o tenerlas versionadas.

# DOCKER

## Iniciar MongoDB con Docker Compose:

```
docker compose up -d
```

La aplicación se ejecuta en el equipo, no en un contenedor. Copia la configuración
de ejemplo y arráncala después de iniciar MongoDB:

```
Copy-Item .env.example .env
npm run import:posters
node app.js
```

`npm run import:posters` importa una sola vegada els cartells de `movies.json`
que falten a MongoDB, relacionant les pel·lícules pel títol. Els cartells que ja
existeixen no se sobreescriuen.

## Parar los contenedores:

```
docker compose stop
```

## Eliminar los contenedores y conservar los datos:

```
docker compose down
```

Para eliminar también los datos de MongoDB:

```
docker compose down --volumes
```

# INICIALITZAR PROJECTE

```
npm init -y
npm install express@5 mongoose@9
mkdir models
```

### afegir la uri (url)

```
$env:MONGODB_URI = 'mongodb://127.0.0.1:27017/movies'
node app.js
```

hh
