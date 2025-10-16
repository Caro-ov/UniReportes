document.addEventListener('DOMContentLoaded', () => {
  // Mostrar mensajes de error si vienen en la URL
  const params = new URLSearchParams(window.location.search);
  const err = params.get('error');
  if (err) {
    const msg = {
      missing: 'Por favor ingresa correo y contraseña.',
      invalid: 'Correo o contraseña incorrectos.',
      server: 'Ocurrió un error. Intenta de nuevo más tarde.'
    }[err] || 'Ocurrió un error. Intenta nuevamente.';

    // Crear un pequeño banner de error
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#fee2e2;color:#991b1b;padding:12px 16px;border-radius:8px;margin-bottom:12px;border:1px solid #fecaca;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;';
    banner.textContent = msg;

    const contenedor = document.querySelector('.contenedor-form');
    if (contenedor) contenedor.prepend(banner);
  }
});
