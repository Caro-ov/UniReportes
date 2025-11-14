/* 
 * SCRIPT DE PRUEBA - DROPDOWN DE PERFIL Y NOTIFICACIONES
 * Copia y pega este código en la consola del navegador (F12 -> Console)
 * para verificar que todo funcione correctamente
 */

console.log('🔍 === DIAGNÓSTICO DEL SISTEMA ===');

// 1. Verificar que existen los elementos
console.log('\n📦 1. Verificando elementos del DOM...');
const btnPerfil = document.getElementById('dropdownPerfil');
const menuPerfil = document.getElementById('menuPerfil');
const btnNotificaciones = document.getElementById('btnNotificaciones');
const panelNotificaciones = document.getElementById('panelNotificaciones');

console.log('✓ Botón de perfil:', btnPerfil ? '✅ Encontrado' : '❌ NO ENCONTRADO');
console.log('✓ Menú de perfil:', menuPerfil ? '✅ Encontrado' : '❌ NO ENCONTRADO');
console.log('✓ Botón de notificaciones:', btnNotificaciones ? '✅ Encontrado' : '❌ NO ENCONTRADO');
console.log('✓ Panel de notificaciones:', panelNotificaciones ? '✅ Encontrado' : '❌ NO ENCONTRADO');

// 2. Verificar event listeners
console.log('\n🎯 2. Verificando event listeners...');
console.log('✓ NotificationManager existe:', typeof window.notificationManager !== 'undefined' ? '✅ SÍ' : '❌ NO');
console.log('✓ jQuery cargado:', typeof $ !== 'undefined' ? '✅ SÍ' : '❌ NO');

// 3. Verificar clases CSS
console.log('\n🎨 3. Verificando clases CSS...');
if (menuPerfil) {
    console.log('✓ Clases del menú desplegable:', menuPerfil.className);
    console.log('✓ ¿Tiene clase "mostrar"?', menuPerfil.classList.contains('mostrar') ? '✅ SÍ (VISIBLE)' : '⚪ NO (OCULTO)');
}

if (panelNotificaciones) {
    console.log('✓ Clases del panel notificaciones:', panelNotificaciones.className);
    console.log('✓ ¿Tiene clase "mostrar"?', panelNotificaciones.classList.contains('mostrar') ? '✅ SÍ (VISIBLE)' : '⚪ NO (OCULTO)');
}

// 4. Probar apertura manual del dropdown
console.log('\n🧪 4. Pruebas manuales disponibles:');
console.log('Ejecuta en consola:');
console.log('  - probarDropdownPerfil()  → Abre/cierra el dropdown de perfil');
console.log('  - probarNotificaciones()  → Abre/cierra el panel de notificaciones');
console.log('  - resetearTodo()          → Cierra todo');

window.probarDropdownPerfil = function() {
    const dropdown = document.querySelector('.user-dropdown, .dropdown-perfil');
    const menu = document.getElementById('menuPerfil');
    if (dropdown && menu) {
        dropdown.classList.toggle('open');
        menu.classList.toggle('mostrar');
        console.log('✅ Dropdown toggled. Estado:', menu.classList.contains('mostrar') ? 'ABIERTO' : 'CERRADO');
    } else {
        console.error('❌ No se encontró el dropdown');
    }
};

window.probarNotificaciones = function() {
    if (window.notificationManager) {
        window.notificationManager.togglePanel();
        console.log('✅ Panel de notificaciones toggled. Estado:', window.notificationManager.isPanelOpen ? 'ABIERTO' : 'CERRADO');
    } else {
        console.error('❌ NotificationManager no está disponible');
    }
};

window.resetearTodo = function() {
    // Cerrar dropdown
    const dropdown = document.querySelector('.user-dropdown, .dropdown-perfil');
    const menu = document.getElementById('menuPerfil');
    if (dropdown && menu) {
        dropdown.classList.remove('open');
        menu.classList.remove('mostrar');
    }
    
    // Cerrar notificaciones
    if (window.notificationManager) {
        window.notificationManager.closePanel();
    }
    
    console.log('✅ Todo cerrado');
};

// 5. Verificar z-index
console.log('\n📊 5. Verificando z-index...');
if (menuPerfil) {
    const zIndex = window.getComputedStyle(menuPerfil).zIndex;
    console.log('✓ Z-index del menú de perfil:', zIndex);
}
if (panelNotificaciones) {
    const zIndex = window.getComputedStyle(panelNotificaciones).zIndex;
    console.log('✓ Z-index del panel de notificaciones:', zIndex);
}

// 6. Verificar eventos jQuery
console.log('\n🔗 6. Verificando eventos jQuery...');
if (typeof $ !== 'undefined') {
    const events = $._data(document, 'events');
    if (events && events.click) {
        console.log('✓ Eventos de click registrados:', events.click.length);
        events.click.forEach((event, index) => {
            if (event.namespace) {
                console.log(`  ${index + 1}. Namespace: ${event.namespace}, Selector: ${event.selector || 'document'}`);
            }
        });
    } else {
        console.log('⚠️ No se encontraron eventos de click en document');
    }
}

console.log('\n✅ === DIAGNÓSTICO COMPLETADO ===');
console.log('Si ves errores arriba, cópialos y compártelos para ayudarte mejor.');
