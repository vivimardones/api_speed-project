# 📘 DOCUMENTO DE REGLAS DE NEGOCIO - Sistema de Gestión Deportiva

**Fecha:** 15 de Febrero, 2026  
**Proyecto:** API Speed Project  
**Repositorios:** 
- API: `vivimardones/api_speed-project`
- Frontend: `vivimardones/front_speed_project`

---

## 1. ROLES DEL SISTEMA

### 1.1 Roles Base (5 tipos)

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| **Administrador** | Configuración y gestión completa de la app | Acceso total al sistema |
| **Dirigente** | Gestión de un club específico | Validar deportistas, modificar datos protegidos, inscribir a campeonatos, autorizar tutores, inactivar usuarios |
| **Deportista** | Usuario atleta del sistema | Ver perfil, solicitar inscripción a apoderado |
| **Apoderado** | Responsable de deportistas menores | Gestionar deportistas a cargo, crear logins para menores, resetear contraseñas |
| **Deportista-Apoderado** | Rol combinado | Permisos de deportista + apoderado |

### 1.2 Reglas de Roles

✅ **Los roles son dinámicos y pueden cambiar:**
- Deportista → Apoderado
- Deportista → Deportista-Apoderado  
- Apoderado → Deportista-Apoderado
- Apoderado → (sin rol) si deja de tener deportistas a cargo

✅ **Asignación de roles:**
- Al crear `login` → usuario "standard" (sin rol definido)
- Al crear `usuario` → se define el rol según las acciones:
  - Si agrega deportista → rol `apoderado`
  - Si se inscribe como deportista → rol `deportista`
  - Si hace ambas → rol `deportista-apoderado`

---

## 2. IDENTIFICADORES (RUT/PASAPORTE)

### 2.1 Tipos de Identificadores

| Tipo | Descripción | Validaciones |
|------|-------------|--------------|
| `RUT` | RUT chileno definitivo | Obligatorio para chilenos, NO se puede cambiar (solo por error con validación de dirigente) |
| `PASAPORTE` | Pasaporte extranjero | Para extranjeros sin RUT |
| `RUT_PROVISORIO` | RUT temporal | Para extranjeros con RUT temporal |
| `IDENTIFICADOR_EXTRANJERO` | Documento del país de origen | Si no tiene RUT ni RUT_PROVISORIO |

### 2.2 Reglas de Identificadores

✅ **Obligatorio:** Todo usuario DEBE tener un identificador (campo no puede estar vacío)

✅ **Formato RUT chileno:**
- Input del usuario: `12.345.678-9`
- Almacenamiento: `12345678` (sin puntos, guion ni dígito verificador)

✅ **Cambio de identificador:**
- De `RUT_PROVISORIO` → `RUT` definitivo: **Permitido** (una sola vez)
- De `RUT` definitivo → otro: **NO permitido** (excepto error validado por dirigente)

✅ **Validación:** El sistema debe validar formato y unicidad del identificador

---

## 3. REGLAS POR EDAD

### 3.1 Menores de 10 años

| ¿Puede? | Respuesta |
|---------|-----------|
| Tener login | ❌ NO |
| Tener correo propio | ❌ NO |
| Ser registrado en `usuarios` | ✅ SÍ (por apoderado) |
| Tener rol | ✅ SÍ (solo `deportista`) |
| Tener apoderado | ✅ **OBLIGATORIO** |

**Flujo de registro:**
1. Apoderado (logueado) accede a su perfil
2. Crea usuario deportista menor de 10
3. Relación de apoderado se crea automáticamente
4. **NO** se crea registro en `login`

### 3.2 Entre 10 y 17 años

| ¿Puede? | Respuesta |
|---------|-----------|
| Tener login | ✅ SÍ (opcional) |
| Tener correo propio | ✅ SÍ (si tiene login) |
| Iniciar sesión | ✅ SÍ (si tiene login) |
| Inscribirse como deportista | ❌ NO (solo apoderado puede) |
| Cambiar contraseña | ✅ SÍ |
| Tener apoderado | ✅ **OBLIGATORIO** |
| Solicitar inscripción | ✅ SÍ (desde su perfil) |

**Opciones de login:**
- **Opción A:** Apoderado crea login y correo para el deportista
- **Opción B:** Deportista NO tiene login, se gestiona 100% por apoderado

**Permisos del apoderado sobre el deportista:**
- Ver toda la información
- Modificar todos los datos
- Resetear contraseña del deportista
- Gestionar inscripciones

### 3.3 18 años en adelante

| ¿Puede? | Respuesta |
|---------|-----------|
| Tener login | ✅ **OBLIGATORIO** |
| Tener correo propio | ✅ **OBLIGATORIO** |
| Tener apoderado | ❌ NO (se libera automáticamente) |
| Ver datos públicos de otros | ✅ SÍ |
| Ser apoderado de otros | ✅ SÍ (si tiene menores a cargo) |

**Liberación automática:**
- Al iniciar sesión, se verifica edad
- Si cumplió 18 años:
  - Sistema notifica al apoderado
  - Relaciones de apoderado se finalizan automáticamente
  - Historial se mantiene registrado

**Excepción (discapacidad/dificultad):**
- Deportista debe enviar solicitud al dirigente
- Dirigente aprueba manualmente
- Apoderado continúa activo

---

## 4. APODERADOS Y RELACIONES

### 4.1 Requisitos para ser Apoderado

✅ **Edad mínima:** 18 años  
✅ **Se convierte en apoderado cuando:** tiene al menos 1 deportista menor a cargo  
✅ **Deja de ser apoderado cuando:** no tiene deportistas menores a cargo

### 4.2 Cantidad de Apoderados

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cuántos apoderados puede tener un deportista? | **Máximo 2** |
| ¿Cuántos deportistas puede tener un apoderado? | **Sin límite** (deben ser sus hijos) |
| ¿Puede haber apoderado suplente? | ❌ NO |

### 4.3 Tipos de Relación

| Tipo | Requiere Aprobación |
|------|-------------------|
| `PADRE` | Automática |
| `MADRE` | Automática |
| `TUTOR` | ✅ **Requiere validación de dirigente** |

### 4.4 Cambio de Apoderado

**Proceso:**
1. Nuevo apoderado busca al deportista
2. Envía solicitud de apoderado
3. **Apoderado actual debe aceptar**
4. Si acepta → cambio efectivo
5. Si rechaza → cambio bloqueado

**Reglas:**
- Puede tener ambos apoderados simultáneamente (máximo 2)
- Si un apoderado se da de baja y hay deportistas menores → **OBLIGATORIO** asignar otro

### 4.5 Validación del Dirigente

**Casos que requieren intervención del dirigente:**
- Autorizar relación de `TUTOR`
- Inscribir apoderado a deportista (si no son padre/madre)
- Aprobar cambio de RUT por error
- Aprobar continuidad de apoderado para mayor de 18 con dificultad

---

## 5. FLUJOS DE REGISTRO

### 5.1 Mayor de 10 años se registra

```
1. Usuario crea login (correo + password + fecha nacimiento)
   ├─ Se crea registro en `login` con rol "standard"
   └─ Sistema valida: edad ≥ 10
   
2. Usuario completa datos en `usuarios`
   ├─ Nombres, apellidos, RUT, teléfono, etc.
   └─ Define su rol (deportista/apoderado/ambos)

3. Si se inscribe como DEPORTISTA:
   ├─ Debe solicitar a un apoderado que lo inscriba
   └─ NO puede completar inscripción solo

4. Si se inscribe como APODERADO:
   ├─ Solo es válido si tiene/tendrá deportistas a cargo
   └─ Puede agregar deportistas menores
```

### 5.2 Apoderado registra menor de 10 años

```
1. Apoderado inicia sesión
   
2. Desde su perfil → "Agregar Deportista"

3. Completa datos del menor:
   ├─ Nombres, apellidos, RUT, fecha nacimiento, teléfono emergencia
   └─ NO se crea login (menor de 10)

4. Se crea registro en `usuarios` con:
   ├─ loginId: NULL (no tiene login)
   └─ rol: "deportista"

5. Se crea relación en `relaciones_apoderado`:
   ├─ deportistaId → usuario menor
   ├─ apoderadoId → apoderado actual
   └─ activo: true
```

### 5.3 Apoderado crea login para menor (10-17 años)

```
1. Apoderado selecciona deportista a cargo (10-17 años)

2. Opción: "Crear login para deportista"

3. Apoderado ingresa:
   ├─ Correo único para el deportista
   └─ Password inicial

4. Sistema crea registro en `login`:
   ├─ correo
   ├─ password (hash)
   ├─ fechaNacimiento (del usuario existente)
   └─ rol: "deportista"

5. Sistema actualiza `usuarios`:
   └─ loginId → ID del nuevo login

6. Deportista ahora puede iniciar sesión
```

### 5.4 Mayor de 18 se registra como Apoderado-Deportista

```
1. Crea login (correo + password + fecha nacimiento)

2. Completa datos en `usuarios`

3. Se inscribe como DEPORTISTA → rol: "deportista"

4. Agrega un deportista menor:
   ├─ Se crea relación de apoderado
   └─ Rol cambia a: "deportista-apoderado"
```

---

## 6. VALIDACIONES DE DATOS

### 6.1 RUT Chileno

| Campo | Validación |
|-------|-----------|
| **Formato de entrada** | `12.345.678-9` o `12345678-9` |
| **Almacenamiento** | `12345678` (sin puntos, guion, ni dígito verificador) |
| **Unicidad** | Debe ser único en el sistema |
| **Cambio** | NO permitido (excepto error validado por dirigente) |

### 6.2 Correo Electrónico

| Validación | Descripción |
|-----------|-------------|
| **Formato** | Validar formato válido (regex) |
| **Existencia** | Validar que el correo sea válido (verificación real) |
| **Unicidad** | **OBLIGATORIA** - No se puede repetir |
| **Obligatorio** | Solo para usuarios con login |

### 6.3 Teléfono

| Campo | Validación |
|-------|-----------|
| **Formato** | Chileno: `+56912345678` |
| **Obligatorio** | Sí (todos los deportistas) |
| **Tipo** | Teléfono de emergencia |

### 6.4 Nombres y Apellidos

| Campo | Obligatorio | Caracteres Permitidos |
|-------|-------------|---------------------|
| `primerNombre` | ✅ Sí | Letras, tildes, ñ |
| `segundoNombre` | ❌ Opcional | Letras, tildes, ñ |
| `tercerNombre` | ❌ Opcional | Letras, tildes, ñ |
| `apellidoPaterno` | ✅ Sí | Letras, tildes, ñ |
| `apellidoMaterno` | ✅ Sí | Letras, tildes, ñ |

**No hay validación de longitud máxima/mínima** (se asume razonable)

---

## 7. ESTADOS DE USUARIO

### 7.1 Estados Posibles

| Estado | Significado | ¿Puede iniciar sesión? |
|--------|-------------|----------------------|
| `activo` | Usuario habilitado | ✅ Sí |
| `inactivo` | Usuario con problemas | ❌ No |

### 7.2 Reglas de Estados

✅ **Cambio de estado:**
- Solo `dirigente` puede cambiar a `inactivo`
- Motivo: Problemas con el club

✅ **Reactivación:**
- Usuario `inactivo` debe enviar mensaje/solicitud al dirigente
- Dirigente aprueba/rechaza reactivación

✅ **Impacto:**
- Usuario `inactivo` NO puede hacer login
- Apoderado NO puede gestionar si está inactivo
- Deportista inactivo NO puede participar en eventos

---

## 8. COLECCIÓN DEPORTISTAS

### 8.1 Relación con Usuarios

✅ **Regla:** Cuando un `usuario` se define con rol `deportista` o `deportista-apoderado`, se debe crear un registro en la colección `deportistas`

### 8.2 Datos de Deportistas (preliminar)

- Club al que pertenece
- Serie
- Categoría
- *(Definir más adelante con mayor profundidad)*

---

## 9. PROCESO DE MAYORÍA DE EDAD

### 9.1 Verificación

**Momento:** Al iniciar sesión

**Proceso:**
```
1. Usuario inicia login

2. Sistema calcula edad actual

3. SI edad >= 18 Y requiereApoderado == true:
   ├─ Finalizar relaciones de apoderado activas
   ├─ Enviar notificación a apoderado(es)
   ├─ Mostrar mensaje al deportista
   └─ Mantener registro histórico
```

### 9.2 Notificaciones

**Al deportista:**
- "¡Felicidades! Ya eres mayor de edad. Tu cuenta es independiente."

**Al apoderado:**
- "Tu deportista [Nombre] ha cumplido 18 años y ya no requiere apoderado."
- Si deportista NO tiene login: "Debes crear un correo para que pueda acceder independientemente."

### 9.3 Restricciones post-liberación

❌ **Apoderado NO puede:**
- Modificar datos del deportista mayor
- Resetear su contraseña
- Gestionar inscripciones
- Tomar decisiones por él

✅ **Se mantiene:**
- Historial de relación apoderado-deportista
- Registro de todas las acciones pasadas

---

## 10. PERMISOS Y PRIVACIDAD

### 10.1 Apoderado sobre Deportista Menor

| Acción | ¿Permitido? |
|--------|-------------|
| Ver toda la información | ✅ Sí |
| Modificar todos los datos | ✅ Sí |
| Resetear contraseña | ✅ Sí |
| Gestionar inscripciones | ✅ Sí |
| Ver historial de actividades | ✅ Sí |

### 10.2 Deportista sobre sus Datos

| Edad | Puede cambiar contraseña | Puede modificar datos | Puede ver apoderados |
|------|------------------------|---------------------|-------------------|
| < 10 años | ❌ No tiene login | ❌ No | ❌ No accede al sistema |
| 10-17 años | ✅ Sí | ❌ No (solo apoderado) | ✅ Sí |
| ≥ 18 años | ✅ Sí | ✅ Sí | ✅ Sí (historial) |

### 10.3 Visibilidad Pública

✅ **Mayores de 18 años pueden ver:**
- Datos públicos de todos los deportistas
- Información de club, categoría, serie
- Resultados de campeonatos

---

## 📋 RESUMEN DE REGLAS CRÍTICAS

| # | Regla | Crítico |
|---|-------|---------|
| 1 | Menores de 10 NO tienen login | 🔴 |
| 2 | Entre 10-17 login es OPCIONAL | 🟡 |
| 3 | 18+ login es OBLIGATORIO | 🔴 |
| 4 | RUT definitivo NO se puede cambiar | 🔴 |
| 5 | Correo es único en el sistema | 🔴 |
| 6 | Máximo 2 apoderados por deportista | 🔴 |
| 7 | Apoderado debe tener 18+ años | 🔴 |
| 8 | Cambio de apoderado requiere aceptación del actual | 🟡 |
| 9 | Tutor requiere validación de dirigente | 🟡 |
| 10 | Liberación automática a los 18 años | 🔴 |
| 11 | Solo apoderado puede inscribir deportista menor | 🔴 |
| 12 | Dirigente valida inscripción de deportistas | 🟡 |

---

## 📊 MODELO DE COLECCIONES FIRESTORE

### Colección: `login`
```typescript
{
  id: string (auto-generado)
  correo: string (único)
  password: string (hash bcrypt)
  fechaNacimiento: string (ISO 8601)
  rol: 'standard' | 'deportista' | 'apoderado' | 'deportista-apoderado' | 'dirigente' | 'administrador'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Colección: `usuarios`
```typescript
{
  id: string (auto-generado)
  loginId: string | null (FK a login, null para menores de 10)
  primerNombre: string
  segundoNombre: string
  tercerNombre?: string (opcional)
  apellidoPaterno: string
  apellidoMaterno: string
  telefono: string (formato +56912345678)
  tipoIdentificador: 'RUT' | 'PASAPORTE' | 'RUT_PROVISORIO' | 'IDENTIFICADOR_EXTRANJERO'
  numeroIdentificador: string (único, sin formato)
  rut?: string (solo para almacenar el formato limpio)
  estado: 'activo' | 'inactivo'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Colección: `deportistas`
```typescript
{
  id: string (auto-generado)
  usuarioId: string (FK a usuarios)
  clubId: string (FK a clubes)
  serieId: string
  categoriaId: string
  // ... más campos específicos de deportistas
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Colección: `relaciones_apoderado`
```typescript
{
  id: string (auto-generado)
  deportistaId: string (FK a usuarios)
  apoderadoId: string (FK a usuarios)
  tipoRelacion: 'PADRE' | 'MADRE' | 'TUTOR'
  esApoderadoPrincipal: boolean
  activo: boolean
  fechaInicio: string (ISO 8601)
  fechaFin?: string (ISO 8601, cuando se libera)
  aprobadoPorDirigente?: boolean (solo para TUTOR)
  dirigenteId?: string (quien aprobó)
  observaciones?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Colección: `solicitudes_apoderado`
```typescript
{
  id: string (auto-generado)
  deportistaId: string
  apoderadoActualId: string
  apoderadoNuevoId: string
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  tipoRelacion: 'PADRE' | 'MADRE' | 'TUTOR'
  mensaje?: string
  respuestaApoderado?: string
  fechaSolicitud: Timestamp
  fechaRespuesta?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 🔄 CASOS DE USO PRINCIPALES

### CU-01: Registro de Mayor de 18 años
**Actor:** Usuario nuevo (mayor de 18)  
**Precondición:** Ninguna  
**Flujo Principal:**
1. Usuario accede a página de registro
2. Ingresa correo, password, fecha de nacimiento
3. Sistema valida edad ≥ 18
4. Sistema crea registro en `login`
5. Usuario completa datos personales (nombres, RUT, teléfono)
6. Sistema crea registro en `usuarios`
7. Usuario puede iniciar sesión

### CU-02: Apoderado registra menor de 10 años
**Actor:** Apoderado (logueado)  
**Precondición:** Apoderado tiene cuenta activa  
**Flujo Principal:**
1. Apoderado accede a "Agregar Deportista"
2. Ingresa datos del menor (sin correo)
3. Sistema valida edad < 10
4. Sistema crea registro en `usuarios` (loginId: null)
5. Sistema crea relación en `relaciones_apoderado`
6. Apoderado puede gestionar al deportista

### CU-03: Apoderado crea login para deportista (10-17 años)
**Actor:** Apoderado  
**Precondición:** Deportista entre 10-17 años a cargo, sin login  
**Flujo Principal:**
1. Apoderado selecciona deportista
2. Selecciona "Crear login"
3. Ingresa correo y password
4. Sistema valida correo único
5. Sistema crea registro en `login`
6. Sistema actualiza `usuarios.loginId`
7. Deportista puede iniciar sesión

### CU-04: Cambio de apoderado
**Actor:** Nuevo apoderado, Apoderado actual, Deportista  
**Precondición:** Deportista tiene 1 apoderado activo  
**Flujo Principal:**
1. Nuevo apoderado busca deportista
2. Envía solicitud de apoderado
3. Sistema crea registro en `solicitudes_apoderado`
4. Sistema notifica a apoderado actual
5. Apoderado actual revisa y acepta
6. Sistema actualiza/crea relación en `relaciones_apoderado`
7. Sistema notifica a todos los involucrados

### CU-05: Liberación automática a los 18 años
**Actor:** Sistema, Deportista, Apoderado  
**Precondición:** Deportista cumplió 18 años  
**Flujo Principal:**
1. Deportista inicia sesión
2. Sistema calcula edad
3. Sistema detecta edad ≥ 18
4. Sistema finaliza relaciones de apoderado activas
5. Sistema envía notificaciones
6. Si deportista NO tiene login → notifica a apoderado para crearlo
7. Sistema muestra mensaje de liberación

---

## 🧪 ESCENARIOS DE PRUEBA

### Escenario 1: Validación de edad para login
```
DADO que un usuario intenta registrarse
CUANDO ingresa una fecha de nacimiento que indica edad < 10
ENTONCES el sistema debe rechazar la creación de login
Y mostrar mensaje "Los menores de 10 años no pueden tener login propio"
```

### Escenario 2: Correo duplicado
```
DADO que existe un usuario con correo "juan@example.com"
CUANDO otro usuario intenta registrarse con el mismo correo
ENTONCES el sistema debe rechazar el registro
Y mostrar mensaje "Este correo ya está registrado"
```

### Escenario 3: Máximo 2 apoderados
```
DADO que un deportista tiene 2 apoderados activos
CUANDO un tercer apoderado intenta enviar solicitud
ENTONCES el sistema debe rechazar la solicitud
Y mostrar mensaje "El deportista ya tiene el máximo de apoderados (2)"
```

### Escenario 4: Cambio de RUT definitivo
```
DADO que un usuario tiene tipoIdentificador: 'RUT'
CUANDO intenta cambiar su numeroIdentificador
ENTONCES el sistema debe rechazar el cambio
Y mostrar mensaje "El RUT definitivo no puede ser modificado. Contacta a un dirigente si hay un error"
```

### Escenario 5: Actualización de RUT provisorio a definitivo
```
DADO que un usuario tiene tipoIdentificador: 'RUT_PROVISORIO'
CUANDO actualiza a tipoIdentificador: 'RUT' con nuevo número
ENTONCES el sistema debe permitir el cambio
Y registrar en el historial el cambio de identificador
```

---

## 📞 CONTACTOS Y RESPONSABLES

**Desarrollador Backend:** [A completar]  
**Desarrollador Frontend:** [A completar]  
**Product Owner:** [A completar]  
**QA/Tester:** [A completar]

---

## 📝 HISTORIAL DE CAMBIOS

| Fecha | Versión | Cambios | Autor |
|-------|---------|---------|-------|
| 2026-02-15 | 1.0 | Documento inicial aprobado | GitHub Copilot + saintrey |

---

## ✅ APROBACIONES

- [ ] Product Owner
- [ ] Tech Lead
- [ ] Backend Developer
- [ ] Frontend Developer
- [ ] QA Lead

---

**Fin del documento**