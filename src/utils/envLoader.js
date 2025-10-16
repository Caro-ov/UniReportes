import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(path.dirname(__dirname));

const ENV_FILE = path.join(projectRoot, '.env');
const ENCRYPTED_FILE = path.join(projectRoot, '.env.encrypted');

/**
 * Carga las variables de entorno desde el archivo cifrado
 * @param {string} password - Contraseña para descifrar
 * @returns {Object} Variables de entorno parseadas
 */
export function loadEncryptedEnv(password) {
    try {
        // Si existe .env normal, usarlo directamente
        if (fs.existsSync(ENV_FILE)) {
            console.log('🔓 Usando archivo .env existente');
            return parseEnvFile(fs.readFileSync(ENV_FILE, 'utf8'));
        }

        // Si no existe .env pero sí .env.encrypted, intentar descifrar
        if (fs.existsSync(ENCRYPTED_FILE)) {
            console.log('🔐 Descifrando archivo .env.encrypted...');
            
            const encryptedContent = fs.readFileSync(ENCRYPTED_FILE, 'utf8');
            const decrypted = CryptoJS.AES.decrypt(encryptedContent, password);
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
            
            if (!decryptedText) {
                throw new Error('Contraseña incorrecta para descifrar .env');
            }
            
            console.log('✅ Archivo .env descifrado exitosamente');
            return parseEnvFile(decryptedText);
        }

        throw new Error('No se encontró archivo .env ni .env.encrypted');
        
    } catch (error) {
        console.error('❌ Error cargando variables de entorno:', error.message);
        throw error;
    }
}

/**
 * Parse del contenido del archivo .env
 * @param {string} content - Contenido del archivo .env
 * @returns {Object} Variables de entorno parseadas
 */
function parseEnvFile(content) {
    const env = {};
    
    content.split('\n').forEach(line => {
        line = line.trim();
        
        // Ignorar líneas vacías y comentarios
        if (!line || line.startsWith('#')) {
            return;
        }
        
        // Buscar el primer = para dividir clave y valor
        const equalIndex = line.indexOf('=');
        if (equalIndex === -1) {
            return;
        }
        
        const key = line.substring(0, equalIndex).trim();
        let value = line.substring(equalIndex + 1).trim();
        
        // Remover comillas si existen
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        
        env[key] = value;
    });
    
    return env;
}

/**
 * Carga las variables de entorno y las establece en process.env
 * @param {string} password - Contraseña para descifrar (opcional)
 */
export function setupEnv(password = null) {
    try {
        let envVars;
        
        // Si se proporciona contraseña, intentar cargar archivo cifrado
        if (password) {
            envVars = loadEncryptedEnv(password);
        } else if (fs.existsSync(ENV_FILE)) {
            // Si existe .env normal, usarlo
            console.log('🔓 Cargando archivo .env');
            envVars = parseEnvFile(fs.readFileSync(ENV_FILE, 'utf8'));
        } else {
            console.log('⚠️ No se encontró archivo .env - usando variables de entorno del sistema');
            return;
        }
        
        // Establecer variables en process.env
        Object.keys(envVars).forEach(key => {
            if (!process.env[key]) {
                process.env[key] = envVars[key];
            }
        });
        
        console.log(`✅ Variables de entorno cargadas (${Object.keys(envVars).length} variables)`);
        
    } catch (error) {
        console.error('❌ Error configurando variables de entorno:', error.message);
        process.exit(1);
    }
}

export default {
    loadEncryptedEnv,
    setupEnv,
    parseEnvFile
};