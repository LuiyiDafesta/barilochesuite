# Guía de Despliegue en Ferozo PHP Hosting

Este repositorio está estructurado para trabajar cómodamente en un hosting tradicional PHP/Apache como **Ferozo**.

## Estructura del Proyecto

```text
BarilocheSuite/
├── _source/                  # Proyecto React/Vite completo en TypeScript
├── assets/                   # JS/CSS compilados generados por Vite en la raíz
├── .htaccess                 # Configuración de URLs amigables (SPA rewrite)
├── contact.php               # Procesador de envíos de formularios en PHP
├── index.html                # HTML estático compilado listo para servidor
├── favicon.ico / logo.png    # Recursos multimedia públicos
└── README_DESPLIEGUE.md
```

## Flujo de Trabajo

### 1. Desarrollo Local
Para realizar cambios en la aplicación web:
```bash
cd _source
npm install   # o bun install
npm run dev   # iniciar servidor de desarrollo
```

### 2. Generación del Build para Producción
Para compilar los cambios y actualizar la raíz listos para Ferozo:
```bash
cd _source
npm run build
```
Esto compilará los archivos e insertará automáticamente los assets actualizados y el `index.html` en la raíz del proyecto.

### 3. Despliegue en Ferozo
Sincronice el contenido completo del directorio raíz (incluyendo `_source/`, `assets/`, `index.html`, `.htaccess`, `contact.php`) con su carpeta `public_html` o subdominio en Ferozo via FTP/SFTP o Git Sync.
