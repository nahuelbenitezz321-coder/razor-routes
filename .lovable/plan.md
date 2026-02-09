

# JR Barbería - App de Gestión (PWA)

## Visión General
App PWA de gestión integral para barberías con diseño oscuro y moderno, optimizada para celular. Incluye sistema multiusuario con roles (dueño/barbero), gestión de servicios, clientes, caja y estadísticas.

## Fase 1: Fundamentos y Diseño
- **Tema oscuro estilo barbería** con colores negro, gris oscuro y acentos plateados/dorados
- **Layout mobile-first** con navegación inferior (tabs)
- **Logo JR** integrado en la app
- **Configuración PWA** para instalación en Android

## Fase 2: Backend y Autenticación (Lovable Cloud)
- **Base de datos** con tablas: barberías, perfiles, servicios, clientes, trabajos, gastos, cierres de caja, códigos de invitación, roles de usuario
- **Registro de barbería**: nombre, teléfono, dirección, logo. El primer usuario es DUEÑO
- **Sistema de invitación**: el dueño genera códigos para que barberos se registren
- **Login** con email y contraseña
- **Roles**: dueño (acceso total) y barbero (solo sus trabajos)
- **Seguridad RLS**: cada barbería solo ve sus propios datos

## Fase 3: Gestión de Servicios
- CRUD de servicios (nombre, precio, duración)
- Solo el dueño puede crear/editar/eliminar servicios

## Fase 4: Gestión de Barberos
- Lista de barberos de la barbería
- Configuración de comisión (porcentaje o monto fijo) por barbero
- Historial de trabajos por barbero

## Fase 5: Gestión de Clientes
- Registro de clientes (nombre, teléfono, notas)
- Historial de visitas y servicios por cliente
- Búsqueda rápida de clientes

## Fase 6: Trabajos y Caja
- **Registrar trabajo**: seleccionar barbero, cliente, servicio(s) → calcula ingreso y comisión automáticamente
- **Registro de gastos** manuales
- **Cierre de caja diario**: resumen de ingresos, gastos, comisiones y ganancia neta
- **Resumen semanal y mensual**

## Fase 7: Estadísticas
- Ingresos por día, semana y mes (gráficos)
- Servicios más realizados
- Rendimiento por barbero
- Dashboard visual para el dueño

## Fase 8: PWA y Offline
- Manifest y service worker para instalación en Android
- Caché de datos básicos para uso offline parcial
- Página de instalación con instrucciones

## Pantallas principales
1. **Login / Registro** - Con opción de crear barbería o unirse con código
2. **Dashboard** - Resumen del día (solo dueño ve todo)
3. **Nuevo Trabajo** - Flujo rápido: barbero → cliente → servicio → confirmar
4. **Servicios** - Lista y gestión
5. **Clientes** - Lista, búsqueda e historial
6. **Caja** - Ingresos, gastos, cierre diario
7. **Estadísticas** - Gráficos y métricas
8. **Configuración** - Datos de barbería, barberos, códigos de invitación

