document.addEventListener('DOMContentLoaded', () => {
    const functionInput = document.getElementById('functionInput');
    const x0Input = document.getElementById('x0Input');
    const x1Input = document.getElementById('x1Input');
    const toleranceInput = document.getElementById('toleranceInput');
    const maxIterationsInput = document.getElementById('maxIterationsInput');
    const calculateButton = document.getElementById('calculateButton');
    const resultOutput = document.getElementById('resultOutput');
    const iterationsList = document.getElementById('iterationsList');

    calculateButton.addEventListener('click', calculateSecant);
 
    function calculateSecant() {
        const funcStr = functionInput.value;
        console.log("Graficando función:", funcStr); 
        let x0 = parseFloat(x0Input.value);
        let x1 = parseFloat(x1Input.value);
        const tolerance = parseFloat(toleranceInput.value);
        const maxIterations = parseInt(maxIterationsInput.value);
        const decimalPlaces = currentSegmentValue;

        iterationsList.innerHTML = ''; 
        resultOutput.textContent = 'Calculando...';

        let node;
        try {
            node = math.parse(funcStr);
            const testScope = { x: 0 }; 
            node.evaluate(testScope);
        } catch (error) {
            resultOutput.textContent = `Error en la función: ${error.message}. Asegúrate de usar sintaxis válida (ej. 'x^2', 'sin(x)'), etc.`;
            return;
        }

        // Método de la Secante 
        let x_prev = x0;
        let x_curr = x1;
        let x_next;
        let iteration = 0;
        let fx_prev, fx_curr;
        let approxXs = []; 

        try {
            while (iteration < maxIterations) {
                fx_prev = node.evaluate({ x: x_prev });
                fx_curr = node.evaluate({ x: x_curr });
                approxXs.push(x_curr);

                if (Math.abs(fx_curr - fx_prev) < 1e-12) {
                    resultOutput.textContent = `Error: División por cero o valores muy cercanos en la iteración ${iteration + 1}. Posiblemente f(x_prev) ≈ f(x_curr).`;
                    break;
                }

                x_next = x_curr - fx_curr * (x_curr - x_prev) / (fx_curr - fx_prev);
 
                // Calcular el error porcentual relativo si no es la primera iteración
                let errorPorcentual = '';
                if (iteration > 0) {
                    errorPorcentual = `, Error: ${Math.abs((x_curr - x_prev) / x_curr * 100).toFixed(decimalPlaces)}%`; 
                }

                const iterationLi = document.createElement('li');
                iterationLi.textContent = `Iteración ${iteration + 1}: x(i-1) = ${x_curr.toFixed(decimalPlaces)}, f(xi-1) = ${fx_curr.toFixed(decimalPlaces)}, x = ${x_next.toFixed(decimalPlaces)}${errorPorcentual}`;
                iterationsList.appendChild(iterationLi);

                if (Math.abs(x_next - x_curr) < tolerance || Math.abs(node.evaluate({ x: x_next })) < tolerance) { 
                    resultOutput.textContent = `Raíz aproximada encontrada: ${x_next.toFixed(decimalPlaces)} en ${iteration + 1} iteraciones.`;
                    approxXs.push(x_next);
                    break;
                }

                x_prev = x_curr;
                x_curr = x_next;
                iteration++;

                if (iteration >= maxIterations) {
                    resultOutput.textContent = `Máximo de iteraciones (${maxIterations}) alcanzado. La raíz aproximada es: ${x_next.toFixed(decimalPlaces)}`;
                }
            }
            console.log("Valores de approxXs:", approxXs); 
        } catch (error) {
            resultOutput.textContent = `Error durante el cálculo: ${error.message}. Revisa los valores de entrada o la función.`;
        }
 
        // Graficar los puntos aproximados en GeoGebra
        try {
            let node = math.parse(functionInput.value);
            approxXs.forEach((x, i) => {
                let y = node.evaluate({ x: x });
                window.ggbApplet.evalCommand(`A${i+1} = (${x}, ${y})`);
            });
        } catch (e) {
            console.log("Error al graficar los puntos en GeoGebra:", e);
        }
 
        // Enviar la función a GeoGebra
        if (window.ggbApplet && typeof window.ggbApplet.evalCommand === "function") {
            try {
                window.ggbApplet.evalCommand('Delete[f]');
            } catch (e) {}
            try {
                window.ggbApplet.evalCommand(`f(x) = ${funcStr}`);
            } catch (e) {
                console.log("Error al enviar la función a GeoGebra:", e);
            }
        } else {
            console.log("GeoGebra aún no está listo para graficar.");
        }
    }
});

// Función para actualizar el valor mostrado junto a los sliders estándar
        function updateRangeValue(rangeId, valueId) {
            const rangeInput = document.getElementById(rangeId);
            const valueSpan = document.getElementById(valueId);
            valueSpan.textContent = rangeInput.value;
        }

        // --- Lógica para la barra segmentada interactiva ---
        const maxSegments = 15;
        const minSegments = 1; 
        let currentSegmentValue = 7;
        let isDraggingSegmentedBar = false;

        function createSegmentedBar() {
            const segmentedContainer = document.getElementById('progress-segmented-visual');
            const thumb = document.getElementById('segmented-thumb');
            segmentedContainer.innerHTML = '';
            segmentedContainer.appendChild(thumb);

            for (let i = 0; i < maxSegments; i++) {
                const segment = document.createElement('div');
                segment.classList.add('progress-segment');
                segmentedContainer.insertBefore(segment, thumb); 
            }
            updateSegmentedProgressVisual(currentSegmentValue); 
        }

        function updateSegmentedProgressVisual(value) {
            currentSegmentValue = Math.max(minSegments, Math.min(maxSegments, value)); 
            const segments = document.querySelectorAll('#progress-segmented-visual .progress-segment');
            const valueSpan = document.getElementById('value4');
            const thumb = document.getElementById('segmented-thumb');

            segments.forEach((segment, index) => {
                if (index < currentSegmentValue) {
                    segment.classList.add('active');
                } else {
                    segment.classList.remove('active');
                }
            });

            valueSpan.textContent = currentSegmentValue;
            thumb.textContent = currentSegmentValue;

            const containerWidth = segments[0].offsetWidth * maxSegments;
            const positionRatio = (currentSegmentValue - minSegments) / (maxSegments - minSegments);
            const thumbWidth = thumb.offsetWidth;
            let thumbLeft = (currentSegmentValue - 0.5) * (segments.length > 0 ? segments[0].offsetWidth : 0);
            thumbLeft = Math.max(thumbWidth / 2, Math.min(containerWidth - thumbWidth / 2, thumbLeft));
            thumb.style.left = `${(thumbLeft / containerWidth) * 100}%`;
        }

        // Función para manejar el arrastre (mouse y touch)
        function handleDrag(event) {
            if (!isDraggingSegmentedBar) return;
            event.preventDefault(); 

            const segmentedContainer = document.getElementById('progress-segmented-visual');
            const containerRect = segmentedContainer.getBoundingClientRect();
            let clientX = event.clientX;

            if (event.touches && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
            }

            const offsetX = clientX - containerRect.left;
            const containerWidth = containerRect.width;

            const segmentUnitWidth = containerWidth / maxSegments;
            let newValue = Math.round(offsetX / segmentUnitWidth);

            newValue = Math.max(minSegments, Math.min(maxSegments, newValue));

            if (newValue !== currentSegmentValue) {
                updateSegmentedProgressVisual(newValue);
            }
        }

        // Eventos para el arrastre
        document.addEventListener('DOMContentLoaded', () => {
            createSegmentedBar(); 

            const segmentedContainer = document.getElementById('progress-segmented-visual');

            segmentedContainer.addEventListener('mousedown', (e) => {
                isDraggingSegmentedBar = true;
                segmentedContainer.classList.add('dragging'); 
                handleDrag(e); 
            });

            document.addEventListener('mousemove', handleDrag);

            document.addEventListener('mouseup', () => {
                isDraggingSegmentedBar = false;
                segmentedContainer.classList.remove('dragging'); // Volver al cursor normal
            });

            segmentedContainer.addEventListener('touchstart', (e) => {
                isDraggingSegmentedBar = true;
                segmentedContainer.classList.add('dragging');
                handleDrag(e);
            }, { passive: false });

            document.addEventListener('touchmove', handleDrag, { passive: false });

            document.addEventListener('touchend', () => {
                isDraggingSegmentedBar = false;
                segmentedContainer.classList.remove('dragging');
            });

            window.addEventListener('resize', () => {
                updateSegmentedProgressVisual(currentSegmentValue);
            });
        });