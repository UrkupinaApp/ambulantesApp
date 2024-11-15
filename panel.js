document.addEventListener('DOMContentLoaded', () => {
    const altaLink = document.querySelector('a[href="#alta"]');
    const vendedoresLink = document.querySelector('a[href="#ambulantes"]');
    const formContainer = document.getElementById('form-container');

    // Función para cargar contenido según el hash
    function cargarContenido(hash) {
        formContainer.innerHTML = ''; // Limpiar el contenedor
        if (hash === '#alta' || hash === '') {
            // Mostrar el formulario de alta
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
            iniciarCapturaFoto(); // Iniciar la funcionalidad de captura de foto
            configurarAltaForm();  // Configurar el formulario de alta
        } else if (hash === '#ambulantes') {
            cargarVendedores(); // Cargar la lista de vendedores
        } else if (hash === '#reportes') {
            formContainer.innerHTML = `
                <div class="card p-4 shadow">
                    <h2>Reportes</h2>
                    <p>Sección de reportes en construcción.</p>
                </div>
            `;
        }
    }

    // Cargar la sección de "Alta" por defecto
    cargarContenido('#alta');

    // Event listeners para los enlaces de la barra lateral
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const hash = link.getAttribute('href');
            cargarContenido(hash);
            // Marcar enlace como activo
            document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Configuración del formulario de alta
    function configurarAltaForm() {
        const altaForm = document.getElementById('altaForm');
        const generarCredencialButton = document.getElementById('generarCredencial');

        altaForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evitar el comportamiento predeterminado del formulario

            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const dni = document.getElementById('dni').value;
            const fechaAlta = document.getElementById('fecha').value;
            const fotoPreview = document.getElementById('fotoPreview').src;

            if (!nombre || !apellido || !dni || !fechaAlta || !fotoPreview) {
                alert('Por favor, completa todos los campos y captura una foto antes de registrar.');
                return;
            }

            try {
                const response = await fetch(fotoPreview);
                const blob = await response.blob();
                const formData = new FormData();

                formData.append('foto', blob, `foto_${dni}.png`);
                formData.append('nombre', nombre);
                formData.append('apellido', apellido);
                formData.append('dni', dni);
                formData.append('fecha_alta', fechaAlta);

                const res = await fetch('https://xn--urkupia-9za.store/api/vendedores', {
                    method: 'POST',
                    body: formData,
                });

                const data = await res.text();
                if (res.ok) {
                    alert('Registro completado exitosamente.');
                    console.log('Datos del servidor:', data);
                } else {
                    alert(`Error al registrar: ${data}`);
                }
            } catch (error) {
                console.error('Error al enviar la información:', error);
                alert('Ocurrió un error al registrar. Intenta de nuevo.');
            }
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
    }

    // Función para cargar la lista de vendedores
    async function cargarVendedores() {
        try {
            const response = await fetch('https://xn--urkupia-9za.store/api/vendedores/get');
            if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);

            const vendedores = await response.json();
            formContainer.innerHTML = `
                <div class="card p-4 shadow">
                    <h2>Lista de Vendedores Ambulantes</h2>
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead class="thead-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>DNI</th>
                                    <th>Fecha de Alta</th>
                                    <th>Foto</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${vendedores.map(vendedor => `
                                    <tr>
                                        <td>${vendedor.id}</td>
                                        <td>${vendedor.nombre}</td>
                                        <td>${vendedor.apellido}</td>
                                        <td>${vendedor.dni}</td>
                                        <td>${vendedor.fecha_alta}</td>
                                        <td>
                                            <img src="https://xn--urkupia-9za.store${vendedor.foto_path}" alt="Foto de ${vendedor.nombre}" width="90" height="50">
                                        </td>
                                        <td>
                                            <button class="btn btn-warning btn-sm edit-button" data-id="${vendedor.id}" data-nombre="${vendedor.nombre}" data-apellido="${vendedor.apellido}" data-dni="${vendedor.dni}" data-fecha="${vendedor.fecha_alta}">Editar</button>
                                            <button class="btn btn-danger btn-sm delete-button" data-id="${vendedor.id}">Eliminar</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            document.querySelectorAll('.edit-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const { id, nombre, apellido, dni, fecha } = event.target.dataset;
                    mostrarPopupEditar(id, nombre, apellido, dni, fecha);
                });
            });

            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const id = event.target.dataset.id;
                    mostrarPopupEliminar(id);
                });
            });
        } catch (error) {
            console.error('Error al obtener los vendedores:', error);
            formContainer.innerHTML = `
                <div class="alert alert-danger">
                    Ocurrió un error al cargar la lista de vendedores. Por favor, inténtalo nuevamente más tarde.
                </div>
            `;
        }
    }

    // Funciones auxiliares para editar y eliminar vendedores
    function mostrarPopupEditar(id, nombre, apellido, dni, fecha) {
        const popup = document.createElement('div');
        popup.classList.add('popup-overlay');
        popup.innerHTML = `
            <div class="popup">
                <h3>Editar Vendedor</h3>
                <form id="editarForm">
                    <div class="mb-3">
                        <label for="nombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="editNombre" value="${nombre}" required>
                    </div>
                    <div class="mb-3">
                        <label for="apellido" class="form-label">Apellido</label>
                        <input type="text" class="form-control" id="editApellido" value="${apellido}" required>
                    </div>
                    <div class="mb-3">
                        <label for="dni" class="form-label">DNI</label>
                        <input type="text" class="form-control" id="editDni" value="${dni}" required>
                    </div>
                    <div class="mb-3">
                        <label for="fecha" class="form-label">Fecha de Alta</label>
                        <input type="date" class="form-control" id="editFecha" value="${fecha}" required>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="submit" class="btn btn-success">Guardar</button>
                        <button type="button" class="btn btn-secondary" id="cancelarEditar">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(popup);

        document.getElementById('cancelarEditar').addEventListener('click', () => {
            popup.remove();
        });

        document.getElementById('editarForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const updatedData = {
                nombre: document.getElementById('editNombre').value,
                apellido: document.getElementById('editApellido').value,
                dni: document.getElementById('editDni').value,
                fecha_alta: document.getElementById('editFecha').value,
            };

            try {
                const response = await fetch(`https://xn--urkupia-9za.store/api/vendedores/update/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData),
                });

                if (response.ok) {
                    alert('Vendedor actualizado correctamente.');
                    popup.remove();
                    vendedoresLink.click(); // Refrescar la lista
                } else {
                    alert('Error al actualizar el vendedor.');
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
            }
        });
    }

    function mostrarPopupEliminar(id) {
        const popup = document.createElement('div');
        popup.classList.add('popup-overlay');
        popup.innerHTML = `
            <div class="popup">
                <h3>¿Estás seguro de eliminar este vendedor?</h3>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-danger" id="confirmarEliminar">Eliminar</button>
                    <button class="btn btn-secondary" id="cancelarEliminar">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);

        document.getElementById('cancelarEliminar').addEventListener('click', () => {
            popup.remove();
        });

        document.getElementById('confirmarEliminar').addEventListener('click', async () => {
            try {
                const response = await fetch(`https://xn--urkupia-9za.store/api/vendedores/delete/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    alert('Vendedor eliminado correctamente.');
                    popup.remove();
                    vendedoresLink.click(); // Refrescar la lista
                } else {
                    alert('Error al eliminar el vendedor.');
                }
            } catch (error) {
                console.error('Error al eliminar:', error);
            }
        });
    }

    // Funciones auxiliares de captura de foto y generación de PDF
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
        const logoPath = '/assets/logo_64.png';

        const doc = new jsPDF('landscape', 'mm', [120, 54]);

        const img = new Image();
        img.src = logoPath;
        img.onload = () => {
            doc.addImage(img, 'PNG', 10, 5, 30, 12);

            const qrData = `Nombre: ${nombre}, Apellido: ${apellido}, DNI: ${dni}, Fecha: ${fecha}`;
            const qrCodeCanvas = document.createElement('canvas');
            QRCode.toCanvas(qrCodeCanvas, qrData, () => {
                const qrImageDataUrl = qrCodeCanvas.toDataURL('image/png');
                doc.addImage(qrImageDataUrl, 'PNG', 10, 20, 25, 25);

                doc.setFillColor(255, 255, 255);
                doc.roundedRect(90, 12, 25, 30, 3, 3, 'F');

                doc.addImage(imageDataUrl, 'PNG', 92, 12, 25, 30);

                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text('Detalles del Vendedor', 40, 20);

                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text(`Nombre: ${nombre}`, 40, 27);
                doc.text(`Apellido: ${apellido}`, 40, 34);
                doc.text(`DNI: ${dni}`, 40, 41);
                doc.text(`Fecha de Alta: ${fecha}`, 40, 48);

                doc.save('credencial_ambulante.pdf');
            });
        };

        img.onerror = () => {
            console.error('Error al cargar la imagen del logo.');
            alert('Hubo un problema al cargar la imagen del logo.');
        };
    }
});
