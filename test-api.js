// Script de prueba para verificar que las APIs funcionan
console.log('🧪 Iniciando pruebas de API...');

async function probarAPIs() {
    const baseURL = 'http://localhost:3001';
    
    try {
        // Probar endpoint de test
        console.log('\n📡 Probando endpoint de test...');
        const testRes = await fetch(`${baseURL}/test`);
        const testData = await testRes.json();
        console.log('✅ Test endpoint:', testData);
        
        // Probar endpoint de categorías
        console.log('\n📡 Probando endpoint de categorías...');
        const catRes = await fetch(`${baseURL}/api/categories`);
        const catData = await catRes.json();
        console.log('✅ Categorías encontradas:', catData.data?.length || 0);
        if (catData.data?.length > 0) {
            console.log('📋 Primera categoría:', catData.data[0]);
        }
        
        // Probar endpoint de objetos (si hay categorías)
        if (catData.data?.length > 0) {
            console.log('\n📡 Probando endpoint de objetos...');
            const firstCatId = catData.data[0].id_categoria;
            const objRes = await fetch(`${baseURL}/api/objects/categoria/${firstCatId}`);
            const objData = await objRes.json();
            console.log(`✅ Objetos para categoría ${firstCatId}:`, objData.data?.length || 0);
        }
        
        console.log('\n🎉 Todas las pruebas completadas exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

probarAPIs();