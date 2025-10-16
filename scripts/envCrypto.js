#!/usr/bin/env node

import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

const ENV_FILE = path.join(projectRoot, '.env');
const ENCRYPTED_FILE = path.join(projectRoot, '.env.encrypted');
const TEMPLATE_FILE = path.join(projectRoot, '.env.example');

// Crear interfaz de readline para input del usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para ocultar la entrada de contraseña
function hiddenQuestion(query) {
    return new Promise((resolve) => {
        const stdin = process.openStdin();
        process.stdout.write(query);
        
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        
        let password = '';
        
        stdin.on('data', function(ch) {
            ch = ch + '';
            
            switch(ch) {
                case '\n':
                case '\r':
                case '\u0004':
                    stdin.setRawMode(false);
                    stdin.removeAllListeners('data');
                    process.stdout.write('\n');
                    resolve(password);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u0008':
                case '\u007f':
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    password += ch;
                    process.stdout.write('*');
                    break;
            }
        });
    });
}

// Función para cifrar el archivo .env
async function encryptEnv() {
    try {
        // Verificar si existe el archivo .env
        if (!fs.existsSync(ENV_FILE)) {
            console.log('❌ No se encontró el archivo .env');
            return;
        }

        // Solicitar contraseña
        const password = await hiddenQuestion('🔐 Ingresa la contraseña para cifrar el archivo .env: ');
        
        if (!password) {
            console.log('❌ Contraseña requerida');
            return;
        }

        // Leer el contenido del archivo .env
        const envContent = fs.readFileSync(ENV_FILE, 'utf8');
        
        // Cifrar el contenido
        const encrypted = CryptoJS.AES.encrypt(envContent, password).toString();
        
        // Guardar el archivo cifrado
        fs.writeFileSync(ENCRYPTED_FILE, encrypted);
        
        // Crear archivo .env.example (sin valores sensibles)
        const exampleContent = envContent
            .split('\n')
            .map(line => {
                if (line.trim() && !line.startsWith('#')) {
                    const [key] = line.split('=');
                    return `${key}=your_value_here`;
                }
                return line;
            })
            .join('\n');
            
        fs.writeFileSync(TEMPLATE_FILE, exampleContent);
        
        console.log('✅ Archivo .env cifrado exitosamente');
        console.log(`📁 Archivo cifrado guardado en: ${ENCRYPTED_FILE}`);
        console.log(`📝 Template creado en: ${TEMPLATE_FILE}`);
        console.log('\n🔒 Ahora puedes eliminar el archivo .env original de forma segura');
        console.log('💡 Para descifrar usa: npm run env:decrypt');
        
    } catch (error) {
        console.error('❌ Error al cifrar:', error.message);
    }
}

// Función para descifrar el archivo .env
async function decryptEnv() {
    try {
        // Verificar si existe el archivo cifrado
        if (!fs.existsSync(ENCRYPTED_FILE)) {
            console.log('❌ No se encontró el archivo .env.encrypted');
            return;
        }

        // Solicitar contraseña
        const password = await hiddenQuestion('🔐 Ingresa la contraseña para descifrar el archivo .env: ');
        
        if (!password) {
            console.log('❌ Contraseña requerida');
            return;
        }

        // Leer el archivo cifrado
        const encryptedContent = fs.readFileSync(ENCRYPTED_FILE, 'utf8');
        
        // Intentar descifrar
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedContent, password);
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
            
            if (!decryptedText) {
                console.log('❌ Contraseña incorrecta');
                return;
            }
            
            // Guardar el archivo descifrado
            fs.writeFileSync(ENV_FILE, decryptedText);
            
            console.log('✅ Archivo .env descifrado exitosamente');
            console.log(`📁 Archivo guardado en: ${ENV_FILE}`);
            
        } catch (error) {
            console.log('❌ Error al descifrar. Verifica la contraseña.');
        }
        
    } catch (error) {
        console.error('❌ Error al descifrar:', error.message);
    }
}

// Función para mostrar ayuda
function showHelp() {
    console.log(`
🔐 UniReportes - Gestor de cifrado .env

Uso: node scripts/envCrypto.js [comando]

Comandos disponibles:
  encrypt    Cifra el archivo .env
  decrypt    Descifra el archivo .env.encrypted
  help       Muestra esta ayuda

Ejemplos:
  node scripts/envCrypto.js encrypt
  node scripts/envCrypto.js decrypt
  npm run env:encrypt
  npm run env:decrypt
`);
}

// Función principal
async function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'encrypt':
            await encryptEnv();
            break;
        case 'decrypt':
            await decryptEnv();
            break;
        case 'help':
        case '-h':
        case '--help':
            showHelp();
            break;
        default:
            console.log('❌ Comando no reconocido');
            showHelp();
            break;
    }
    
    rl.close();
    process.exit(0);
}

// Ejecutar función principal
main().catch(console.error);