let rowCount = 2; 
document.addEventListener("DOMContentLoaded", () => {
    const morecor = document.getElementById("morecords");
    const coorContent = document.getElementById("tableContent"); 

    if (morecor && coorContent) {
        morecor.addEventListener("click", addCoor);

        function addCoor() {
            const newCoor = document.createElement("tr");
            newCoor.innerHTML = `
                <td><input type="number" id="x${rowCount}" placeholder="X${rowCount}"></td>
                <td><input type="number" id="y${rowCount}" placeholder="Y${rowCount}"></td>
            `;
            coorContent.appendChild(newCoor);
            rowCount++; 
        }
    } else {
        console.error("Required elements are missing in the DOM.");
    }
}); 

const lessCords = document.getElementById("lesscords");
lessCords.addEventListener("click", removeCoor);
function removeCoor() {
    const coorContent = document.getElementById("tableContent");
    if (coorContent && coorContent.rows.length > 2) { 
        coorContent.deleteRow(coorContent.rows.length - 1);  
        rowCount--; 
    } else {
        console.warn("Cannot remove more coordinates, at least two must remain.");
    } 
}

// Método de Spline Cuadrático

class SplineCuadratico {
    constructor(puntos) {
        this.puntos = puntos.sort((a, b) => a.x - b.x);
        this.n = this.puntos.length - 1;
        this.coeficientes = [];
    }

    resolver() {
        const n = this.n;
        const totalIncog = 3 * n;
        // Construcción de la matriz A y el vector B usando math.js
        let A = math.zeros(totalIncog, totalIncog)._data;
        let B = math.zeros(totalIncog)._data;
        let idx = 0;


        A[idx][0] = 1;
        B[idx] = 0;
        idx++;


        let x0 = this.puntos[0].x;
        A[idx][0] = x0 * x0;
        A[idx][1] = x0;
        A[idx][2] = 1;
        B[idx] = this.puntos[0].y;
        idx++;


        let xn = this.puntos[n].x;
        let last = 3 * (n - 1);
        A[idx][last] = xn * xn;
        A[idx][last + 1] = xn;
        A[idx][last + 2] = 1;
        B[idx] = this.puntos[n].y;
        idx++;


        for (let i = 1; i < n; i++) {
            let xi = this.puntos[i].x;
            let yi = this.puntos[i].y;

            let left = 3 * (i - 1);
            A[idx][left] = xi * xi;
            A[idx][left + 1] = xi;
            A[idx][left + 2] = 1;
            B[idx] = yi;
            idx++;

            let right = 3 * i;
            A[idx][right] = xi * xi;
            A[idx][right + 1] = xi;
            A[idx][right + 2] = 1;
            B[idx] = yi;
            idx++;
        }

        for (let i = 1; i < n; i++) {
            let xi = this.puntos[i].x;

            let left = 3 * (i - 1);
            A[idx][left] = 2 * xi;
            A[idx][left + 1] = 1;

            let right = 3 * i;
            A[idx][right] = -2 * xi;
            A[idx][right + 1] = -1;
            B[idx] = 0;
            idx++;
        }

        // Resolver el sistema con math.js
        const coef = math.lusolve(A, B).map(arr => arr[0]);
        this.coeficientes = [];
        for (let i = 0; i < n; i++) {
            this.coeficientes.push({
                a: coef[3 * i],
                b: coef[3 * i + 1],
                c: coef[3 * i + 2]
            });
        }

        return { A, B, coef: this.coeficientes };
    }

    evaluacion(x) {
        for (let i = 0; i < this.n; i++) {
            if (x >= this.puntos[i].x && x <= this.puntos[i + 1].x) {
                const { a, b, c } = this.coeficientes[i];
                return a * x * x + b * x + c;
            }
        }
        throw new Error("x fuera del rango de interpolación");
    }
}

document.getElementById("calcular").addEventListener("click", function() {
    const coorContent = document.getElementById("tableContent");
    const puntos = [];
    for (let i = 1; i < coorContent.rows.length; i++) {
        const xInput = coorContent.rows[i].querySelector('input[id^="x"]');
        const yInput = coorContent.rows[i].querySelector('input[id^="y"]');
        if (xInput && yInput) {
            const x = parseFloat(xInput.value);
            const y = parseFloat(yInput.value);
            if (!isNaN(x) && !isNaN(y)) {
                puntos.push({ x, y });
            }
        }
    }
    if (puntos.length < 3) {
        document.getElementById("resultadosSpline").innerHTML = "Debes ingresar al menos 3 puntos.";
        return;
    }
    try {
        const spline = new SplineCuadratico(puntos);
        const { A, B, coef } = spline.resolver();

        let resHtml = "<h3>Coeficientes de los tramos:</h3><ul>";
        coef.forEach((c, i) => {
            resHtml += `<li>P${i+1}(x) = ${c.a.toFixed(4)}x² + ${c.b.toFixed(4)}x + ${c.c.toFixed(4)}</li>`;
        });
        resHtml += "</ul>";
        document.getElementById("resultadosSpline").innerHTML = resHtml;


        let matHtml = `
<h3>Matriz del sistema:</h3>
<div class="matrix-scroll">
<table class="matrix-table"><thead><tr>`;


        for (let i = 0; i < coef.length; i++) {
            matHtml += `<th>a${i+1}</th><th>b${i+1}</th><th>c${i+1}</th>`;
        }
        matHtml += "<th>|</th><th>B</th></tr></thead><tbody>";

        let externos = [0, 1, 2];
        let internos = [];
        for (let i = 3; i < A.length; i++) internos.push(i);

        internos.forEach(i => {
            matHtml += "<tr>";
            matHtml += A[i].map(a => `<td>${a.toFixed(2)}</td>`).join("");
            matHtml += `<td class="matrix-barra">|</td><td>${B[i].toFixed(2)}</td>`;
            matHtml += "</tr>";
        });

        externos.forEach(i => {
            matHtml += "<tr>";
            matHtml += A[i].map(a => `<td>${a.toFixed(2)}</td>`).join("");
            matHtml += `<td class="matrix-barra">|</td><td>${B[i].toFixed(2)}</td>`;
            matHtml += "</tr>";
        });
 
        matHtml += "</tbody></table></div>";
        document.getElementById("matrizSpline").innerHTML = matHtml;

        // --- GRAFICAR EN GEOGEBRA ---
        if (window.ggbApplet && typeof window.ggbApplet.evalCommand === "function") {
            // Borra puntos y curvas anteriores
            try {
                for (let i = 1; i <= puntos.length; i++) window.ggbApplet.evalCommand(`Delete[A${i}]`);
                for (let i = 1; i <= coef.length; i++) window.ggbApplet.evalCommand(`Delete[f${i}]`);
            } catch (e) {}

            // Grafica los puntos ingresados
            puntos.forEach((p, i) => {
                window.ggbApplet.evalCommand(`A${i+1} = (${p.x}, ${p.y})`);
            });

            const colores = [
                "#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00",
                "#a65628", "#f781bf", "#999999", "#dede00", "#00ced1"
            ];

            // Grafica los segmentos de los splines con colores distintos
            coef.forEach((c, i) => {
                const xStart = puntos[i].x;
                const xEnd = puntos[i+1].x;
                let poly;
                if (c.a.toFixed(4) == 0 && c.b.toFixed(4) != 0) {
                poly = `${c.b}*x + ${c.c}`;
                } else if (c.b.toFixed(4) == 0 && c.a.toFixed(4) != 0) {
                 poly = `${c.a}*x^2 + ${c.c}`;
                } else if (c.a.toFixed(4) == 0 && c.b.toFixed(4) == 0) {
                poly = `${c.c}`; 
                } else {
                poly = `${c.a}*x^2 + ${c.b}*x + ${c.c}`;
                }
                window.ggbApplet.evalCommand(`f${i+1}(x) = If(x >= ${xStart} && x <= ${xEnd}, ${poly})`);
                window.ggbApplet.evalCommand(`SetColor[f${i+1}, "${colores[i % colores.length]}"]`);
                window.ggbApplet.evalCommand(`SetLineThickness[f${i+1}, 5]`);
            });
        } else {
            console.log("GeoGebra aún no está listo para graficar.");
        }
    } catch (err) {
        document.getElementById("resultadosSpline").innerHTML = "Error: " + err.message;
    } 
});

// Sidebar para version de telefono
document.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.querySelector('.side-bar');
    sidebar.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('expanded');
        }
    });
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target)) {
            sidebar.classList.remove('expanded');
        }
    });
}); 