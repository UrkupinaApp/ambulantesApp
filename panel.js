document.addEventListener('DOMContentLoaded', () => {
    const altaLink = document.querySelector('a[href="#alta"]');
    const formContainer = document.getElementById('form-container');

    altaLink.addEventListener('click', () => {
        formContainer.innerHTML = `
            <div class="card p-4 shadow">
                <h2>Registro de Vendedor Ambulante</h2>
                <form id="altaForm">
                    <div class="mb-3">
                        <label for="nombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="nombre" required>
                    </div>
                    <div class="mb-3">
                        <label for="apellido" class="form-label">Apellido</label>
                        <input type="text" class="form-control" id="apellido" required>
                    </div>
                    <div class="mb-3">
                        <label for="dni" class="form-label">DNI</label>
                        <input type="text" class="form-control" id="dni" required>
                    </div>
                    <div class="mb-3">
                        <label for="fecha" class="form-label">Fecha de Alta</label>
                        <input type="date" class="form-control" id="fecha" required>
                    </div>
                    <div class="mb-3" id="foto-section">
                        <label for="foto" class="form-label">Foto</label>
                        <button type="button" class="btn btn-secondary" id="capturarFoto">Tomar Foto</button>
                        <video id="video" width="320" height="240" autoplay style="display: none;"></video>
                        <canvas id="canvas" width="320" height="240" style="display: none;"></canvas>
                        <img id="fotoPreview" style="display: none; width: 320px; height: 240px; margin-top: 10px;" />
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="submit" class="btn btn-primary">Registrar</button>
                        <button type="button" class="btn btn-danger" id="generarCredencial">Generar Credencial</button>
                    </div>
                </form>
            </div>
        `;

        iniciarCapturaFoto();

        const altaForm = document.getElementById('altaForm');
        const generarCredencialButton = document.getElementById('generarCredencial');

        altaForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // Aquí va el código para manejar la lógica de registro
            alert('Formulario enviado para registro.'); // Mensaje de prueba para el botón de registrar
        });

        generarCredencialButton.addEventListener('click', () => {
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const dni = document.getElementById('dni').value;
            const fecha = document.getElementById('fecha').value;
            const fotoPreview = document.getElementById('fotoPreview');
            const imageDataUrl = fotoPreview.src;

            if (!nombre || !apellido || !dni || !fecha || !imageDataUrl) {
                alert('Por favor, completa todos los campos y captura una foto antes de generar la credencial.');
                return;
            }

            generarPDF(nombre, apellido, dni, fecha, imageDataUrl);
        });
    });

    function iniciarCapturaFoto() {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const captureButton = document.getElementById('capturarFoto');
        const fotoPreview = document.getElementById('fotoPreview');

        captureButton.addEventListener('click', async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    video.srcObject = stream;
                    video.style.display = 'block';

                    await new Promise((resolve) => {
                        video.onloadedmetadata = () => {
                            video.play();
                            resolve();
                        };
                    });

                    captureButton.addEventListener('click', () => {
                        const context = canvas.getContext('2d');
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageDataUrl = canvas.toDataURL('image/png');
                        fotoPreview.src = imageDataUrl;
                        fotoPreview.style.display = 'block';
                        video.style.display = 'none';
                        stream.getTracks().forEach(track => track.stop()); // Detener la cámara

                        alert('La foto se tomó correctamente.');
                    });
                } catch (error) {
                    alert('No se pudo acceder a la cámara.');
                    console.error('Error al acceder a la cámara:', error);
                }
            } else {
                alert('Tu navegador no soporta acceso a la cámara.');
            }
        });
    }

    function generarPDF(nombre, apellido, dni, fecha, imageDataUrl) {
        const { jsPDF } = window.jspdf;
        const logoPath = '/assets/logo_64.png'; // Asegúrate de que esta ruta sea correcta

        const doc = new jsPDF('landscape', 'mm', [120, 54]);

        const img = new Image();
        img.src = logoPath;
        img.onload = () => {
            doc.addImage(img, 'PNG', 10, 5, 30, 12); // Agregar el logo al PDF

            // Generar el código QR
            const qrData = `Nombre: ${nombre}, Apellido: ${apellido}, DNI: ${dni}, Fecha: ${fecha}`;
            const qrCodeCanvas = document.createElement('canvas');
            QRCode.toCanvas(qrCodeCanvas, qrData, () => {
                const qrImageDataUrl = qrCodeCanvas.toDataURL('image/png');
                doc.addImage(qrImageDataUrl, 'PNG', 10, 20, 25, 25); // Agregar el QR al PDF

                // Agregar un fondo blanco antes de la imagen de la foto
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(90, 12, 25, 30, 3, 3, 'F');

                // Agregar la foto del usuario
                doc.addImage(imageDataUrl, 'PNG', 92, 12, 25, 30);

                // Agregar el texto
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text('Detalles del Vendedor', 40, 20);

                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text(`Nombre: ${nombre}`, 40, 27);
                doc.text(`Apellido: ${apellido}`, 40, 34);
                doc.text(`DNI: ${dni}`, 40, 41);
                doc.text(`Fecha de Alta: ${fecha}`, 40, 48);

                // Descargar el PDF
                console.log("Generando y descargando el PDF...");
                doc.save('credencial_ambulante.pdf');
            });
        };

        img.onerror = () => {
            console.error('Error al cargar la imagen del logo.');
            alert('Hubo un problema al cargar la imagen del logo.');
        };
    }
});
