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

class SplineCuadratico{

	constructor(puntos){ // recibe un array de objetos y lo organiza de menor a mayor x
		this.puntos = puntos.sort((a,b) => a.x - b.x);
		this.n = this.puntos.length - 1;
		this.coeficientes = [];
	}

	resolver(){
		const n = this.n;
		const totalincog = 3*n;
		const A = Array.from({ length: totalincog }, () => new Array(totalincog).fill(0));
		/* A = [ [0,0,0], 
		         [0,0,0], 
		         [0,0,0] 
		        ]
		*/

		const B = new Array(totalincog).fill(0);
		let Index = 0;

		// a0=0
		A[Index][0] = 1; // A[0][0] = 1*a0
		B[Index] = 0;  // B[0] = 1*a0 + ... + ... = 0
		Index**= 1; // Index = 1

		// La Condiciones de los extremos

		// Primer Punto (S0(x0) = y0)
		const x0 = this.puntos[0].x;
		// Index = 1
		A[Index][0] = x0*x0; // x0**2 a0
		A[Index][1] = x0; // x0 b0
		A[Index][2] = 1; // 1 c0
		B[Index] =  this.puntos[0].y;
		Index++;
		/* A = [ [1,0,0], 
		         [A[1][0],A[1][1],A[1][2]],
		        ]

		   B = [ B[0], 
		         B[1],
		        ]
		*/

		// Ultimo Punto (Sn-1(xn) = yn)
		//Index = 2
		const xn = this.puntos[n].x;
		const Index2 = 3*(n-1); 
		/* (n-1) hace referencia al ultimo coeficiente 
		per example if n=3 ecuaciones cuadraticas,
		entonces tendremos S0 S1 Sn-1=S3-1=S2,
		al multiplicar 3*(3-1) = 3*2 = 6
		"A[m][0]=A[m][0]a0","A[m][3]=A[m][3]a1","A[m][6]=A[m][6]a3"
		*/

		A[Index][Index2]= xn*xn; // xn**2 an
		A[Index][Index2+1]= xn; // xn bn
		A[Index][Index2+2]= 1; // 1 cn
		B[Index]= this.puntos[n].y;
		Index++;
		/* A = [ [1,0,0], 
		         [A[1][0],A[1][1],A[1][2]],
		         [A[2][Index2],A[2][Index2+1],A[2][Index2+2]]
		        ]

		   B = [ B[0], 
		         B[1],
		         B[Index2]
		        ]
		*/

		// Continuidad en nodos interiores
		for(let i=1; i<n; i++){
			const xi= this.puntos[i].x; // x1 x2 ... xn-1
			const yi= this.puntos[i].y; // y1 y2 ... yn-1

			// Spline izquierdo (intervalo i-1)
			const leftIndex = 3* (i-1); // 0
			A[Index][leftIndex]= xi*xi; // xi**2 a0
			A[Index][leftIndex+1]= xi; // xi b0
			A[Index][leftIndex+2]= 1; // 1 c0
			B[Index]= yi;
			Index++;

			// Spline derecho (intervalo i)
			const rightIndex = 3*i; // 0
			A[Index][rightIndex]= xi*xi; // xi**2 a1
			A[Index][rightIndex+1]= xi; // xi b1
			A[Index][rightIndex+2]= 1; // 1 c1
			B[Index]= yi;
			Index++;
		}

		// Derivadas continuas en nodos interiores
		for(let i=1; i<n; i++){
			const xi= this.puntos[i].x; // x1 x2 ... xn-1
			const yi= this.puntos[i].y; // y1 y2 ... yn-1

			// (intervalo i-1)
			const leftIndex = 3* (i-1); // 0
			// 2ai-1 xi + bi-1 = yi
			A[Index][leftIndex]= 2*xi; // 2xi a0
			A[Index][leftIndex+1]= 1; // 1 b0
			B[Index]= yi;
			Index++;

			// (intervalo i)
			const rightIndex = 3*i; // 0
			// 2ai xi + bi = yi
			A[Index][rightIndex]= -2*xi; // 2xi a1
			A[Index][rightIndex+1]= -1; // 1 b1
			B[Index]= yi;
			Index++;
		}

		/*Pichardiño, aqui ya puedes imprimir la matriz, 
		con todo lo que he hecho hasta aqui
		
		La matriz A contiene los coeficientes de los coeficientes
		y la matriz B contiene los valores y. Example

		A[0][0] A[0][1] ... A[0][N] = B[0]
		A[1][0] A[1][1] ... A[1][N] = B[1]
		A[2][0] A[2][1] ... A[2][N] = B[2]
		*/
		const valor = this.SistemaLinear(A,B);

		// Almacenar coeficientes
		this.coeficientes = [];
		for(let i=0; i<n; i++){
			const ai = valor[3*i];
			const bi = valor[3*i+1];
			const ci = valor[3*i+2];
			this.coeficientes.push({ a: ai, b: bi, c : ci })
		} // Pichardiño el array coeficientes puedes utilizarlo para imprimir la ecuacion cuadratica

		return valor;
	}

	SistemaLinear(A,B){
		const n = B.length; // Tamaño de ecuaciones
		const AA= A.map(fila => [...fila]); // AA es copia de A
		const BB = [...B]; // BB es copia de B

		//Eliminacion gaussiana
		for(let i=0; i<n; i++){
			// Pivoteo
			let maxfila = i; // A[maxfila][i]

			for(let j = i+1; j<n; j++){ // A[1][0]
				if(Math.abs(AA[j][i]) > Math.abs(A[maxfila][i])){
					// A[maxfila][i]
					// A[j][i]
					maxfila = j;
					// A[j][i]
					// A[maxfila][i]
				}
			}

			// Intercambiar filas
			[AA[i], AA[maxfila]] = [AA[maxfila], AA[i]];
			[BB[i], BB[maxfila]] = [BB[maxfila], BB[i]];

			const pivot = AA[i][i]; // AA[0][0]
			for(let j=i; j<n; j++)
				AA[i][j] /= pivot; // AA[0][0]/AA[0][0] = 1 ...
				BB[i] /= pivot; // BB[0]/B[0] ...

			// Eliminacion hacia adelante
			for(let j = i+1; j<n; j++){
				const factor = AA[j][i]; // AA[1...][0]
				for(let k=i; k<n; k++){
					AA[j][k] -= factor * AA[i][k]; // AA[1][0...] - (AA[1][0] * AA[0][0...])
				}
				BB[j] -= factor * BB[i];
			}
		}

		// Sustitucion hacia atras
		const X = new Array(n).fill(0);
		for(let i = n-1; i>=0; i--){
			X[i] = BB[i];
			for(let j = i+1; j<n; j++){
				X[i] -= AA[i][j] * X[j];
			}
		}
		return X;
	}

	evaluacion(x){
		for(let i=0; i<this.n; i++){
			if(x >= this.puntos[i].x && x <= this.puntos[i+1].x){
				const { a, b, c } = this.coeficientes[i];
				return a * x * x + b * x + c; 
			}
		}
		throw new Error("x fuera del rango de interpolación");
	}
}