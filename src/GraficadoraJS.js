const buttonCoor = document.getElementById('buttonCoor');
buttonCoor.addEventListener('click', calcularCoordenadas);

function calcularCoordenadas() {  
    const inputCoordenadasElement = document.getElementById('coordenadas');
    const resultadoElement = document.getElementById('resultado');
    const inputCoordenadas = inputCoordenadasElement.value;
    let nombreCoordenada = document.getElementById('name').value;

    resultadoElement.textContent = '';
    resultadoElement.classList.remove('error');

    if (inputCoordenadas.trim() === '') {
        resultadoElement.textContent = 'Por favor, ingresa algunas coordenadas.';
        resultadoElement.classList.add('error'); 
        return; 
    }  

    const numeros = inputCoordenadas.split(',').map(str => {
        const cleanedStr = str.trim().replace(/,/g, '.');
        return parseFloat(cleanedStr);
    });
 
    const coordenadasValidas = numeros.filter(num => !isNaN(num));

    if (coordenadasValidas.length < 2) {
        inputCoordenadasElement.style.border = '2px solid red'; 
        resultadoElement.textContent = 'Por favor, ingresa al menos dos coordenadas válidas.';
        resultadoElement.classList.add('error');
        return;
    }

    if (nombreCoordenada.trim() === '') {
        nombreCoordenada = 'Punto'; // Default name if none provided  
    }

    if (coordenadasValidas.length > 0) {
        inputCoordenadasElement.style.border = '2px solid green'; 
        console.log("Coordenadas ingresadas:", coordenadasValidas);
        const nombreCoordenadaUpper = nombreCoordenada.toUpperCase();
        const coordenadaString = `${nombreCoordenadaUpper}=(${coordenadasValidas[0]},${coordenadasValidas[1]})`;
        resultadoElement.textContent = coordenadaString;
        resultadoElement.style.color = 'blue';
        evalInput(coordenadaString); // Call evalInput to show the coordinate in GeoGebra
        console.log("Coordenada generada:", coordenadaString); 
    } else {
        resultadoElement.textContent = 'No se ingresaron coordenadas válidas. Asegúrate de usar números y puntos para decimales.';
        resultadoElement.classList.add('error');  
    }
}  

