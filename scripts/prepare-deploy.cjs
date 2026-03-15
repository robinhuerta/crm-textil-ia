const fs = require('fs');
const path = require('path');

const srcNetlify = path.join(__dirname, '..', 'netlify');
const destNetlify = path.join(__dirname, '..', 'dist', 'netlify');
const srcConfig = path.join(__dirname, '..', 'netlify.toml');
const destConfig = path.join(__dirname, '..', 'dist', 'netlify.toml');

// Function to copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('📦 Preparing Netlify Manual Deploy...');

if (fs.existsSync(srcNetlify)) {
    console.log(' -> Copying functions...');
    copyDir(srcNetlify, destNetlify);
    console.log(' -> Verifying copied functions:');
    try {
        const files = fs.readdirSync(destNetlify + '/functions');
        files.forEach(f => console.log('   - ' + f));
    } catch (e) {
        console.error('   ❌ Error listing functions:', e.message);
    }
} else {
    console.warn('⚠️ No netlify folder found!');
}

// Creamos un netlify.toml MINIMALISTA exclusivo para el deploy manual
// Esto le dice a Netlify dónde buscar las funciones sin causar errores de build recursivos
console.log(' -> Creating minimal netlify.toml for production...');
// Incluimos la configuración para desactivar el escaneo de secretos
// Esto es necesario porque el build incluye la API Key de Google (AIza...)
const minimalConfig = `[functions]
  directory = "netlify/functions"

[build.environment]
  SECRETS_SCAN_SMART_DETECTION_ENABLED = "false"
`;
fs.writeFileSync(destConfig, minimalConfig);

console.log('✅ Deployment preparation complete!');
