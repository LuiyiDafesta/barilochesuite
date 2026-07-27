# Guía y Protocolo Oficial de Despliegue en Ferozo PHP Hosting

Este documento detalla el procedimiento exacto para desarrollar, compilar, subir cambios al repositorio de GitHub y mantener la sincronización automática con el hosting de **Ferozo**.

---

## ⚠️ REGLA DE ORO DE AUTOMATIZACIÓN (MANDATORIO)

> [!IMPORTANT]
> **Al finalizar cada tarea o cambio solicitado por el usuario, el asistente ejecutará de forma automática y obligatoria la siguiente secuencia:**
> 1. `git add -A` (Staging de todos los cambios)
> 2. `git commit -m "..."` (Commit con la descripción del cambio)
> 3. `git push origin main` (Subir al repositorio de GitHub)
> 4. `git pull origin main` (Sincronizar y confirmar el estado actualizado)

---

## 🏗️ Arquitectura de la Carpeta

```text
BarilocheSuite/
├── _source/                  # Proyecto React 19 + TypeScript + Vite (Entorno de desarrollo)
├── assets/                   # Bundles CSS/JS compilados generados por Vite en la raíz
├── .htaccess                 # Reglas de Apache / Ferozo para enrutamiento SPA y scripts PHP
├── contact.php               # Endpoint PHP para formularios de contacto
├── upload.php                # Proxy PHP con firma AWS S3 V4 para subida a Backblaze B2
├── README_DESPLIEGUE.md      # Manual de despliegue oficial
├── index.html                # HTML estático compilado en la raíz
└── favicon.ico / logo.png    # Recursos estáticos públicos
```

---

## 🔄 Flujo de Trabajo y Despliegue

### 1. Desarrollo Local y Cambios de Código
Todos los cambios de código fuente (componentes, rutas, datos, servicios) deben realizarse dentro de la carpeta `_source/`:

```bash
cd _source
npm install   # (si hay nuevas dependencias)
npm run dev   # servidor de desarrollo local
```

### 2. Compilación del Proyecto a la Raíz
Compilar el proyecto dentro de `_source`. La salida se generará en la raíz del proyecto:

```bash
cd _source
npm run build
```

### 3. Sincronización Automática
Desde la raíz del proyecto:

```bash
git add -A
git commit -m "feat/fix: descripción del cambio"
git push origin main
git pull origin main
```

**Repositorio GitHub**: `https://github.com/LuiyiDafesta/barilochesuite.git`

---

## 🌐 Sincronización en el Servidor Ferozo

Para actualizar el sitio en producción en Ferozo:

1. **Vía SSH en Ferozo**:
   En la carpeta raíz de tu dominio/subdominio (`public_html` o directorio correspondiente):
   ```bash
   git pull origin main
   ```

2. **Vía Webhook / Git Sync en Ferozo**:
   Si Ferozo está conectado a GitHub, cada `git push` actualizará automáticamente el sitio en vivo.
