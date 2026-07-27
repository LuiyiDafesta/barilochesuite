# Guía y Protocolo Oficial de Despliegue en Ferozo PHP Hosting

Este documento detalla el procedimiento exacto para desarrollar, compilar, subir cambios al repositorio de GitHub y sincronizar con el hosting de **Ferozo**.

---

## 🏗️ Arquitectura de la Carpeta

```text
BarilocheSuite/
├── _source/                  # Proyecto React 19 + TypeScript + Vite (Entorno de desarrollo)
├── assets/                   # Bundles CSS/JS compilados generados por Vite en la raíz
├── .htaccess                 # Reglas de Apache / Ferozo para enrutamiento SPA y scripts PHP
├── contact.php               # Endpoint PHP para formularios de contacto
├── upload.php                # Proxy PHP con firma AWS S3 V4 para subida a Backblaze B2
├── README_DESPLIEGUE.md      # Este manual de despliegue
├── index.html                # HTML estático compilado en la raíz
└── favicon.ico / logo.png    # Recursos estáticos públicos
```

---

## 🔄 Flujo de Trabajo y Despliegue (Paso a Paso)

### 1. Desarrollo Local y Cambios de Código
Todos los cambios de código fuente (componentes, rutas, datos, estilos) deben realizarse dentro de la carpeta `_source/`:

```bash
cd _source
npm install   # (solo si agregaste paquetes nuevos)
npm run dev   # probar en servidor de desarrollo local
```

### 2. Compilación del Proyecto a la Raíz
Una vez finalizados los cambios, compila el proyecto **dentro de `_source`**. Gracias a la configuración en `vite.config.ts` (`outDir: '../'`), la compilación generará automáticamente `index.html` y la carpeta `assets/` en la raíz del repositorio:

```bash
cd _source
npm run build
```

### 3. Subir Cambios a GitHub
Desde la raíz principal del proyecto (`BarilocheSuite/`), agrega todos los cambios (código en `_source/` y archivos compilados/PHP en la raíz), realiza el commit y sube a GitHub:

```bash
git add -A
git commit -m "feat/fix: descripción clara del cambio"
git push origin main
```

**Repositorio GitHub**: `https://github.com/LuiyiDafesta/barilochesuite.git`

---

## 🌐 Sincronización en el Servidor Ferozo (Git Pull)

Para actualizar el sitio en producción en Ferozo:

1. **Vía SSH en Ferozo**:
   Accede por SSH a la carpeta raíz de tu dominio/subdominio (`public_html` o directorio correspondiente):
   ```bash
   cd public_html
   git pull origin main
   ```

2. **Vía Panel de Git de Ferozo / CPanel**:
   Si usas la herramienta de sincronización de Git integrada en Ferozo:
   - Haz clic en **"Pull / Sincronizar"** desde la rama `main`.

---

## ⚡ Verificaciones Post-Despliegue

- **SPA Routing**: `.htaccess` redirige automáticamente rutas como `/reservar`, `/admin`, `/galeria` a `index.html`.
- **Formularios PHP**: `contact.php` procesa envíos vía POST sin interferencias de mod_rewrite.
- **Subida de Fotos/Videos (Backblaze B2)**: `upload.php` recibe archivos desde `/admin/galeria` y los almacena en el bucket `Barilochesuite` (`s3.us-west-004.backblazeb2.com`), guardando el registro en Supabase.
- **Permisos de Archivos en Ferozo**:
  - Archivos: `644`
  - Carpetas: `755`
  - `.htaccess`: `644`
