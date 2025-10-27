document.addEventListener('DOMContentLoaded', () => {
  // Limpiar flag de logout cuando se llega a la página de login
  sessionStorage.removeItem('logout_flag');
  
  // Mostrar mensajes de error si vienen en la URL
  const params = new URLSearchParams(window.location.search);
  const err = params.get('error');
  if (err) {
    const msg = {
      missing: 'Por favor ingresa todos los campos requeridos.',
      invalid: 'Código, correo o contraseña incorrectos.',
      server: 'Ocurrió un error. Intenta de nuevo más tarde.',
      codigo_invalido: 'El código debe tener exactamente 10 dígitos (ej: 2024123456).'
    }[err] || 'Ocurrió un error. Intenta nuevamente.';

    // Crear un pequeño banner de error
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#fee2e2;color:#991b1b;padding:12px 16px;border-radius:8px;margin-bottom:12px;border:1px solid #fecaca;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;';
    banner.textContent = msg;

    const contenedor = document.querySelector('.contenedor-form');
    if (contenedor) contenedor.prepend(banner);
  }

  // Validación del código de estudiante
  const codigoInput = document.getElementById('student-id');
  const formulario = document.querySelector('.formulario-login');
  
  // Validación en tiempo real del código
  if (codigoInput) {
    codigoInput.addEventListener('input', function() {
      // Solo permitir números
      this.value = this.value.replace(/[^0-9]/g, '');
      
      // Limitar a 10 caracteres máximo
      if (this.value.length > 10) {
        this.value = this.value.substring(0, 10);
      }
      
      // Remover estilos de error previos
      this.classList.remove('input-error');
      const errorMsg = this.parentElement.parentElement.querySelector('.mensaje-error');
      if (errorMsg) {
        errorMsg.remove();
      }
      
      // Validar longitud
      if (this.value.length > 0 && this.value.length !== 10) {
        mostrarErrorCampo(this, 'El código debe tener exactamente 10 dígitos');
      }
    });
  }
  
  // Validación al enviar el formulario
  if (formulario) {
    formulario.addEventListener('submit', function(e) {
      let hayErrores = false;
      
      // Validar código
      if (codigoInput) {
        const codigo = codigoInput.value.trim();
        if (!codigo) {
          mostrarErrorCampo(codigoInput, 'El código es requerido');
          hayErrores = true;
        } else if (!/^\d{10}$/.test(codigo)) {
          mostrarErrorCampo(codigoInput, 'El código debe tener exactamente 10 dígitos');
          hayErrores = true;
        }
      }
      
      // Validar email
      const emailInput = document.getElementById('email-address');
      if (emailInput) {
        const email = emailInput.value.trim();
        if (!email) {
          mostrarErrorCampo(emailInput, 'El correo electrónico es requerido');
          hayErrores = true;
        } else if (!isValidEmail(email)) {
          mostrarErrorCampo(emailInput, 'Ingresa un correo electrónico válido');
          hayErrores = true;
        }
      }
      
      // Validar contraseña
      const passwordInput = document.getElementById('password');
      if (passwordInput) {
        const password = passwordInput.value.trim();
        if (!password) {
          mostrarErrorCampo(passwordInput, 'La contraseña es requerida');
          hayErrores = true;
        }
      }
      
      if (hayErrores) {
        e.preventDefault();
      }
    });
  }
  
  // Función para mostrar errores en campos individuales
  function mostrarErrorCampo(input, mensaje) {
    input.classList.add('input-error');
    
    // Remover mensaje de error previo
    const errorPrevio = input.parentElement.parentElement.querySelector('.mensaje-error');
    if (errorPrevio) {
      errorPrevio.remove();
    }
    
    // Crear nuevo mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mensaje-error';
    errorDiv.style.cssText = 'color:#dc2626;font-size:0.875rem;margin-top:4px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;';
    errorDiv.textContent = mensaje;
    
    input.parentElement.parentElement.appendChild(errorDiv);
  }
  
  // Función para validar email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
