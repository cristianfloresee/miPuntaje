# Introducción

Esta documentación lo ayudará a familiarizarse con los recursos de la API RuviClass y le mostrará cómo realizar diferentes consultas.

# API Rest

URL Base: https://rickandmortyapi.com/api/

La URL base contiene información sobre todos los recursos de API disponibles. Todas las solicitudes son solicitudes GET y SOBRE https. Todas las respuestas devolverán datos en `json`.

Ejmeplo de Solicitud:
```
https://rickandmortyapi.com/api/
```

```JSON
{
  "activities": "https://rickandmortyapi.com/api/activities",
  "calendars": "https://rickandmortyapi.com/api/calendars",
  "categories": "https://rickandmortyapi.com/api/categories"
}
```

Actualmente hay 12 recursos disponibles:
+ activities: se usa para obtener todas las actividades.
+ calendars: se usa para obtener todas los períodos.
+ categories: se usa para obtener todas las categorías.

# Información y Paginación
La API paginará automáticamente las respuestas. Recibirás hasta 20 documentos por página.
Cada recurso contiene un objeto con información sobre la respuesta.

 Clave | Tipo          | Descripción 
-------|---------------|-------------
 count | int           | Longitud de la respuesta 
 pages | int           | Cantidad de páginas 
 next  | string (URL)  | URL de la página siguiente (si existe)
 prev  | string (URL)  | URL de la página anterior (si existe)

 Ejemplo de Solicitud:
 ```
 https://rickandmortyapi.com/api/character/
 ```

 ```JSON
 {
  "info": {
    "count": 394,
    "pages": 20,
    "next": "https://rickandmortyapi.com/api/character/?page=2",
    "prev": ""
  },
  "results": [
    // ...
  ]
}
 ```

 Puede acceder a diferentes páginas con el parámetro `page`. Si no especifica ninguna página, se mostrará la primera página. Por ejemplo, para acceder a la página 2, agregue `?page=2` al final de la URL.

 Ejemplo de Solicitud:
 ```
 https://rickandmortyapi.com/api/character/?page=19
 ```
 ```JSON
 {
  "info": {
    "count": 394,
    "pages": 20,
    "next": "https://rickandmortyapi.com/api/character/?page=20",
    "prev": "https://rickandmortyapi.com/api/character/?page=18"
  },
  "results": [
    {
      "id": 361,
      "name": "Toxic Rick",
      "status": "Dead",
      "species": "Humanoid",
      "type": "Rick's Toxic Side",
      "gender": "Male",
      "origin": {
        "name": "Alien Spa",
        "url": "https://rickandmortyapi.com/api/location/64"
      },
      "location": {
        "name": "Earth",
        "url": "https://rickandmortyapi.com/api/location/20"
      },
      "image": "https://rickandmortyapi.com/api/character/avatar/361.jpeg",
      "episode": [
        "https://rickandmortyapi.com/api/episode/27"
      ],
      "url": "https://rickandmortyapi.com/api/character/361",
      "created": "2018-01-10T18:20:41.703Z"
    },
    // ...
  ]
}
 ```

 ## Calendars

 ### Calendar Schema

  Clave | Tipo          | Descripción 
--------|---------------|-------------
 id     | int           | ID del calendario
 pages  | int           | Cantidad de páginas 
 next   | string (URL)  | URL de la página siguiente (si existe)
 prev   | string (URL)  | URL de la página anterior (si existe)

### Obtener todos los Calendarios



## Obtener Actividades por ID de curso

```sql
SELECT a.id_activity, a.name, a.mode, a.status, a.created_at, a.updated_at, c.description AS lesson, m.name AS module, 
CASE WHEN EXISTS (
  SELECT id_user
  FROM activity_student AS au
  WHERE id_activity = a.id_activity
)
THEN TRUE ELSE FALSE END AS winners
FROM activities AS a
INNER JOIN classes AS c
ON c.id_class = a.id_class
INNER JOIN modules AS m
ON m.id_module = c.id_module
WHERE id_course = 2

```
## Obtener Ganadores por ID de Actividad

```sql
SELECT u.id_user, u.name, u.last_name, u.middle_name 
FROM users AS u 
INNER JOIN activity_student AS au 
ON au.id_user = u.id_user 
WHERE au.status = true AND au.id_activity = $1;
```


CASE WHEN EXISTS (SELECT cu.id_user FROM course_student AS cu WHERE cu.id_user = u.id_user AND id_course = $1) THEN TRUE ELSE FALSE END AS enrolled 


## Patrón DAO

Se opto por utilizar RAW Queries por sobre algún ORM en node.js. En la comunidad se hicieron recomendaciones como Sequealize pero debido a la baja de rendimiento en general que producen los ORMs se opto por usar Raw Queries.
Como se menciona en un comienzo se trabajo con postgres y los manejadores dispnobiles en node.js son promise-postgres y node-postgres. En nuestro caso se utilizó node-postgres debido a la cantidad de descargas y mayor comunidad que tiene.
Un problema que se tuvo a la hora de crear los controlades del Backend es saber donde poner las consultas. En un comienzo se tuvo algo como lo siguiente.

<img src="https://i.imgur.com/2mQVuwT.jpg">

Como se puede observar, en casos donde las consultas se vuelven complejas esto llega a producir una especie de contaminación en nuestro código.
Para esta situación en la comunidad se recomendo:
+ usar algún ORM para abstraer las consultas.
+ Tener las consultas en archivos separados y realizar una carga al inicio. (no entendible)
+ usar una capa de Acceso a Datos o DAO para asi limpiar el controlador.
+ El patrón DAO se puede acompañar de una capa extra que ejecute las queries solamente, a este le enviariamos el objeto de conexion y el query