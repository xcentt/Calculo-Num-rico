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