document.addEventListener("DOMContentLoaded", () => {
    let segmentCount = 1;

    function reindexSegments() {
        const segments = document.querySelectorAll(".segment");
        segmentCount = segments.length;
        segments.forEach((segment, index) => {
            const segmentNumber = index + 1;
            segment.id = `segment-${segmentNumber}`;
            segment.querySelector("h2").textContent = `Segmento ${segmentNumber}`;
        });
    }

    document.getElementById("new-segment").addEventListener("click", () => {
        segmentCount++;
        const newSegment = document.createElement("div");
        newSegment.classList.add("segment");
        newSegment.id = `segment-${segmentCount}`;
        newSegment.innerHTML = `
            <h2>Segmento ${segmentCount}</h2>
            <div class="tableContent">
                <h1>Ingrese las coordenadas</h1>
                <p>Para calcular el spline cuadrático, ingrese las coordenadas de los puntos que desea interpolar.
                Puede <span class="azul">agregar</span> o <span class="rojo">eliminar</span> puntos según sea necesario.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Eje X</th>
                            <th>Eje Y</th>
                        </tr>
                    </thead>
                    <tbody class="tableContent">
                        <tr>
                            <td><input type="number" placeholder="X1"></td>
                            <td><input type="number" placeholder="Y1"></td>
                        </tr>
                        <tr>
                            <td><input type="number" placeholder="X2"></td>
                            <td><input type="number" placeholder="Y2"></td>
                        </tr>
                         <tr>
                            <td><input type="number" placeholder="X3"></td>
                            <td><input type="number" placeholder="Y3"></td>
                        </tr>
                    </tbody>
                </table>
                <div class="buttons">
                    <button class="MoreCoor" title="Agregar Coordenadas">+</button>
                    <button class="MinorCords" title="Eliminar Coordenadas">-</button>
                    <button class="Elim-Segmento" title="Eliminar Segmento">Eliminar Segmento</button>
                </div>
            </div>
        `;
        document.getElementById("segments-container").appendChild(newSegment);
    });

    document.getElementById("segments-container").addEventListener("click", (e) => {
        const target = e.target;
        const tableBody = target.closest(".tableContent")?.querySelector("tbody");

        if (target.classList.contains("MoreCoor") && tableBody) {
            const newRow = tableBody.insertRow();
            const rowCount = tableBody.rows.length;
            newRow.innerHTML = `
                <td><input type="number" placeholder="X${rowCount}"></td>
                <td><input type="number" placeholder="Y${rowCount}"></td>
            `;
        } else if (target.classList.contains("MinorCords") && tableBody) {
            if (tableBody.rows.length > 3) {
                tableBody.deleteRow(tableBody.rows.length - 1);
            } else {
                alert("Cada segmento debe tener al menos 3 puntos.");
            }
        } else if (target.classList.contains("delete-segment")) {
            const segmentsContainer = document.getElementById("segments-container");
            if (segmentsContainer.children.length > 1) {
                target.closest(".segment").remove();
                reindexSegments();
            } else {
                alert("No se puede eliminar el único segmento.");
            }
        }
    });

    class SplineCuadratico {
        constructor(puntos) {
            this.puntos = puntos.sort((a, b) => a.x - b.x);
            this.n = this.puntos.length - 1;
            this.coeficientes = [];
        }

        resolver() {
            const n = this.n;
            const totalIncog = 3 * n;
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
    }

    document.getElementById("calcular").addEventListener("click", function() {
        const segments = document.querySelectorAll(".segment");
        let allCoefs = [];
        let allPoints = [];
        let resHtml = "";
        let matHtml = "";
        let punto = 0;

        try {
            if (window.ggbApplet && typeof window.ggbApplet.evalCommand === "function") {
                window.ggbApplet.evalCommand('Delete(GetAllObjects())');
            }
        } catch (e) {
            console.error("Error clearing GeoGebra objects:", e);
        }

        segments.forEach((segment, segIndex) => {
            const puntos = [];
            const rows = segment.querySelectorAll("tbody tr");

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    const xInput = cells[0].querySelector('input[type="number"]');
                    const yInput = cells[1].querySelector('input[type="number"]');
                    if (xInput && yInput && xInput.value !== "" && yInput.value !== "") {
                        const x = parseFloat(xInput.value);
                        const y = parseFloat(yInput.value);
                        if (!isNaN(x) && !isNaN(y)) {
                            puntos.push({ x, y });
                        }
                    }
                }
            });

            if (puntos.length < 3) {
                resHtml += `<h3>Segmento ${segIndex + 1}:</h3><p class="rojo">Debe ingresar al menos 3 puntos válidos.</p>`;
                return;
            }

            try {
                puntos.sort((a, b) => a.x - b.x);
                allPoints.push(puntos);

                const spline = new SplineCuadratico(puntos);
                const { A, B, coef } = spline.resolver();
                allCoefs.push({coef, puntos});

                resHtml += `<h3>Coeficientes del Segmento ${segIndex + 1}:</h3><ul>`;
                coef.forEach((c, i) => {
                    resHtml += `<li>P${i+1}(x) = ${c.a.toFixed(4)}x² + ${c.b.toFixed(4)}x + ${c.c.toFixed(4)}</li>`;
                });
                resHtml += "</ul>";

                matHtml += `
                    <h3>Matriz del sistema del Segmento ${segIndex + 1}:</h3>
                    <div class="matrix-scroll">
                    <table class="matrix-table"><thead><tr>`;
                for (let i = 0; i < coef.length; i++) {
                    matHtml += `<th>a${i+1}</th><th>b${i+1}</th><th>c${i+1}</th>`;
                }
                matHtml += "<th>|</th><th>B</th></tr></thead><tbody>";

                for (let i = 0; i < A.length; i++) {
                    matHtml += "<tr>";
                    matHtml += A[i].map(a => `<td>${a.toFixed(2)}</td>`).join("");
                    matHtml += `<td class="matrix-barra">|</td><td>${B[i].toFixed(2)}</td>`;
                    matHtml += "</tr>";
                }
                matHtml += "</tbody></table></div>";

            } catch (err) {
                resHtml += `<h3>Segmento ${segIndex + 1}:</h3><p class="rojo">Error: ${err.message}</p>`;
            }
        });

        document.getElementById("resultadosSpline").innerHTML = resHtml;
        document.getElementById("matrizSpline").innerHTML = matHtml;

        if (window.ggbApplet && typeof window.ggbApplet.evalCommand === "function") {
            const colores = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628", "#f781bf"];

            allCoefs.forEach((data, segIndex) => {
                const { coef, puntos } = data;

                puntos.forEach((p) => {
                    punto++;
                    window.ggbApplet.evalCommand(`A${punto} = (${p.x}, ${p.y})`);
                });

                coef.forEach((c, i) => {
                    const xStart = puntos[i].x;
                    const xEnd = puntos[i + 1].x;
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
                    
                    window.ggbApplet.evalCommand(`f${segIndex}_${i+1}(x) = If(${xStart} <= x <= ${xEnd}, ${poly})`);
                    window.ggbApplet.evalCommand(`SetColor[f${segIndex}_${i+1}, "${colores[segIndex % colores.length]}"]`);
                    window.ggbApplet.evalCommand(`SetLineThickness[f${segIndex}_${i+1}, 5]`);
                });
            });
        }
    });
});
