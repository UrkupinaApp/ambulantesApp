document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita el envío del formulario por defecto

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const payload = {
            username,
            password,
            caja: 'z'
        };

        try {
            console.log('Enviando solicitud:', payload); // Para verificar el objeto enviado
            const response = await fetch('https://xn--urkupia-9za.store/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('Respuesta OK:', response);
                window.location.href = '/panel.html';
            } else {
                console.log('Respuesta fallida:', response);
                alert('Login failed: Invalid username or password.');
            }
        } catch (error) {
            console.error('Error al hacer fetch:', error);
            alert('An error occurred while trying to log in. Please try again later.');
        }
    });
});
