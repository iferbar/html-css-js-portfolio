// ========================
// VARIABLES GLOBALES
// ========================

let controls = document.querySelector(".controls"); // Referencia al contenedor con los botones de la calculadora
let pantalla = document.getElementById("pantalla"); // Referencia al input donde se muestra el resultado o las operaciones
let botonOnOff = document.getElementById("botonOnOff"); // Referencia al botón que enciende/apaga la calculadora
let botones = document.querySelectorAll(".controls button"); // Referencia a todos los botones dentro del contenedor de clase "controls"
let historial = document.getElementById("historial"); // Referencia al contenedor donde se muestra el historial de operaciones
let acaboDeCalcular = false; // Variable que nos ayuda a saber si justo antes se hizo una operación
let estaEncendida = false; // Variable que indica si la calculadora está encendida o no

// ========================
// MANEJADOR DE EVENTOS
// ========================

// Se escucha cualquier clic dentro del contenedor de botones
controls.addEventListener("click", function (event) {
    let action = event.target.getAttribute("data-action"); // Obtenemos el tipo de acción que tiene cada botón mediante un atributo personalizado
    let valor = event.target.innerText; // Obtenemos el texto que tiene el botón clicado (el número, símbolo, etc.)
    if (!action) return; // Si no hay acción definida (por ejemplo, clic fuera de un botón), salimos de la función

    switch (
        action // Según el tipo de acción ejecutamos un bloque distinto
    ) {
        case "digito":
            if (acaboDeCalcular) {
                // Si justo antes hicimos una operación, empezamos de cero con el nuevo número
                pantalla.value = valor;
                acaboDeCalcular = false;
            } else {
                // Si no, simplemente añadimos el nuevo número al final del valor actual
                pantalla.value += valor;
            }
            break;
        case "operador":
            let ultimo = pantalla.value.slice(-1); // Último carácter introducido

            if (pantalla.value === "") break; // No dejamos añadir operadores si la pantalla está vacía

            if ("+-*/%".includes(ultimo)) break; // No permitir dos operadores seguidos
            if (acaboDeCalcular) {
                acaboDeCalcular = false; // Se sigue con el resultado anterior
            }
            pantalla.value += valor;
            break;
        case "borrar":
            pantalla.value = ""; // Vaciar completamente la pantalla
            break;
        case "borrarUltimo":
            pantalla.value = pantalla.value.slice(0, -1); // Quita el último carácter
            break;
        case "cambiarSigno":
            pantalla.value = parseFloat(pantalla.value) * -1; // Convierte el valor actual en negativo o positivo
            if (pantalla.value === "") break;
            acaboDeCalcular = true; // Tratamos este cambio como un "resultado"
            break;
        case "elevarCuadrado":
            let valorCuadrado = parseFloat(pantalla.value); // Se convierte el contenido de la pantalla en número
            if (pantalla.value === "") break; // Si la pantalla está vacía, no hace nada
            let resultadoCuadrado = formatearResultado(
                Math.pow(valorCuadrado, 2)
            ); // Se calcula el cuadrado y se formatea el resultado
            pantalla.value = resultadoCuadrado; // Se actualiza la pantalla con el nuevo valor
            agregarAHistorial(`${valorCuadrado}²`, resultadoCuadrado); // Se guarda la operación en el historial
            acaboDeCalcular = true; // Se indica que se acaba de realizar un cálculo
            break;
        case "raizCuadrada":
            let valorRaiz = parseFloat(pantalla.value); // Se obtiene el número actual
            if (pantalla.value === "") break; // Si la pantalla está vacía, se detiene
            let resultadoRaiz = formatearResultado(Math.sqrt(valorRaiz)); // Se calcula la raíz cuadrada
            pantalla.value = resultadoRaiz; // Se muestra el resultado
            agregarAHistorial(`√${valorRaiz}`, resultadoRaiz); // Se guarda en el historial
            acaboDeCalcular = true; // Se marca que se acaba de calcular
            break;
        case "porcentaje":
            pantalla.value += "%";
            break;
        case "calcular":
            try {
                //Usar "try" ya que el código que puede generar un error
                let operacion = pantalla.value; // Guarda la operación que el usuario ha escrito

                if (operacion.includes("%")) {
                    // Si incluye un %, lo procesamos antes
                    let partes = operacion.split("%");
                    if (partes.length === 2) {
                        // Solo si hay exactamente dos partes, lo interpretamos como "porcentaje de número"
                        let porcentaje = parseFloat(partes[0]);
                        let base = parseFloat(partes[1]);

                        if (!isNaN(porcentaje) && !isNaN(base)) {
                            let resultado = formatearResultado(
                                (porcentaje / 100) * base
                            );
                            pantalla.value = resultado;

                            // Añadimos al historial
                            let listaHistorial =
                                document.getElementById("listaHistorial");
                            let nuevoItem = document.createElement("li");
                            nuevoItem.textContent = `${porcentaje}% de ${base} = ${resultado}`;
                            listaHistorial.appendChild(nuevoItem);
                            acaboDeCalcular = true;
                            break; // Salimos del switch para evitar pasar por el eval
                        }
                    }
                }

                let resultado = eval(operacion); // Evalúa el string como expresión matemática
                resultado = formatearResultado(resultado); // Se formatea el resultado final
                pantalla.value = resultado; // Muestra el resultado en pantalla

                // Solo se añade al historial si la operación incluye operadores válidos
                if (/[+\-*/]/.test(operacion)) {
                    let listaHistorial =
                        document.getElementById("listaHistorial");
                    let nuevoItem = document.createElement("li");
                    nuevoItem.textContent = `${operacion} = ${resultado}`;
                    listaHistorial.appendChild(nuevoItem); // Añade la operación al historial
                }
                acaboDeCalcular = true; // Marca que se ha hecho un cálculo para controlar el flujo después
            } catch (error) {
                //Usar "catch" para  atrapar y manejar cualquier error
                pantalla.value = "Error"; // Muestra error si eval falla (entrada inválida)
            }
            break;
    }
});

// Invierte el estado (true ⇄ false) y llama a una función para actualizar el estado de la calculadora
botonOnOff.addEventListener("click", function () {
    estaEncendida = !estaEncendida; // Cambia el estado de encendido/apagado
    actualizarEstadoCalculadora(); // Actualiza la interfaz y funcionalidad
});

// ========================
// FUNCIONES
// ========================

// Esta función controla todo lo que debe pasar cuando se enciende o apaga la calculadora
function actualizarEstadoCalculadora() {
    if (estaEncendida) {
        pantalla.value = ""; // Limpia el input
        botonOnOff.textContent = "OFF"; // El botón cambia a OFF, porque ahora está encendida
        pantalla.setAttribute("placeholder", "0"); // Muestra "0" como placeholder

        botones.forEach((boton) => {
            if (boton !== botonOnOff) {
                boton.disabled = false; // Activa los botones
            }
        });

        historial.style.display = "block"; // Muestra el historial
        calculadora__wrapped.style.justifyContent = " space-around"; // Cambia la alineacion de los bloques de calculadora e historial
    } else {
        pantalla.value = ""; // Limpia el input
        botonOnOff.textContent = "ON"; // El botón cambia a ON, porque ahora está apagada
        pantalla.setAttribute("placeholder", "Off"); // Indica que está apagada con el mensaje de off en el input
        listaHistorial.innerHTML = ""; // Borra el historial de operaciones

        botones.forEach((boton) => {
            if (boton !== botonOnOff) {
                boton.disabled = true; // Desactiva todos los botones menos el de encendido
            }
        });
        historial.style.display = "none"; // Oculta el historial
        calculadora__wrapped.style.justifyContent = "center"; // Cambia la alineacion de los bloques de calculadora e historial
    }
}

// Esta función redondea un número a solo dos decimales, pero solo si no es un número entero
function formatearResultado(numero) {
    if (Number.isInteger(numero)) {
        return numero; // Si el número no tiene decimales, se devuelve tal cual
    } else {
        return parseFloat(numero.toFixed(2)); // Si tiene decimales, se redondea a 2 cifras
    }
}

// Esta función agrega una línea al historial cada vez que se realiza una operación
function agregarAHistorial(operacion, resultado) {
    let listaHistorial = document.getElementById("listaHistorial"); // Referencia a la lista <ul> donde se colocan las operaciones
    let nuevoItem = document.createElement("li"); // Crea un nuevo ítem de lista
    nuevoItem.textContent = `${operacion} = ${resultado}`; // Agrega el contenido de operación y resultado
    listaHistorial.appendChild(nuevoItem); // Lo añade al final de la lista
}

// Espera a que el documento HTML esté completamente cargado y luego ajusta el estado inicial de la calculadora
window.addEventListener("DOMContentLoaded", actualizarEstadoCalculadora);
