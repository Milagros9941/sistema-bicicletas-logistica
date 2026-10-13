# Documento Descriptivo del Negocio - Sistema de Bicicletas Compartidas

## 1. Contexto de la Empresa
La empresa opera un servicio de transporte urbano de bicicletas compartidas en la región. Permite a los ciudadanos registrarse, asociar medios de pago, retirar bicicletas de estaciones habilitadas, realizar trayectos y devolverlas en estaciones de destino. Enfrenta desafíos logísticos críticos de desbalance de flota entre estaciones (saturación y desabastecimiento) y mantenimiento preventivo de unidades.

## 2. Actores y Roles
- **Usuario / Cliente:** Se registra con DNI y nombre, gestiona sus tarjetas (marca y últimos 4 dígitos), realiza retiros y devoluciones de bicicletas, y consulta sus viajes activos o históricos.
- **Operario Técnico:** Consulta las tareas asignadas, marca su ejecución y actualiza el estado de las bicicletas (disponible, en uso, en mantenimiento).
- **Administrador:** Gestiona el alta de nuevas estaciones, bicicletas, operarios y supervisa los indicadores operativos globales.

## 3. Datos del Negocio (Entidades y Relaciones)
El modelo se compone de 7 entidades principales basadas en el MER actualizado:
- **Estacion:** codigo (PK), direccion, capacidad_maxima.
- **Usuario:** dni (PK), nombre.
- **Operario:** legajo (PK), nombre.
- **Bicicleta:** numero_serie (PK), estado, codigo_estacion (FK a Estacion).
- **Medio_pago:** dni_usuario (PK, FK a Usuario), id_medio_pago (PK compuesta), marca, ultimos4.
- **Viaje:** id_viaje (PK), dni_usuario, id_medio_pago, numero_serie, codigo_est_origen, codigo_est_destino (NULL), fecha_hora_inicio, fecha_hora_fin (NULL).
- **Tarea_mantenimiento:** id_tarea (PK), fecha, descripcion, estado, codigo_estacion, legajo_operario.

## 4. Funciones Logísticas
1. **Redistribución de Flota:** Monitoreo del estado de ocupación de las estaciones para planificar traslados de bicicletas y evitar saturación o desabastecimiento.
2. **Gestión de Mantenimiento:** Control del ciclo de vida de la bicicleta y asignación de tareas técnicas a operarios.
3. **Cuadro de Mando (KPIs):** Análisis de la duración de viajes, frecuencias de uso por estación y rotación de unidades.

## 5. Reglas del Negocio
- Una bicicleta o un usuario no pueden estar en dos viajes simultáneos en curso.
- La capacidad máxima física de una estación no puede ser superada por bicicletas disponibles o en mantenimiento.
- Los viajes deben estar asociados obligatoriamente a un medio de pago válido perteneciente al mismo usuario que viaja.
- El destino y la hora de fin de un viaje son opcionales pero deben registrarse juntos al cerrar el servicio.

## 6. Requisitos Técnicos
- Aplicación web interactiva conectada a una base de datos PostgreSQL alojada en **Supabase** mediante `@supabase/supabase-js`, pensada para su publicación en **Vercel**.
