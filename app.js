const CLAVE_STORAGE = "diarioDeEstudio";

const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const rachaNumero = document.getElementById("racha");
const rachaTexto = document.getElementById("racha-texto");
const lista = document.getElementById("lista");

function fechaLocalYYYYMMDD(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function restarUnDia(fechaTexto) {
  const partes = fechaTexto.split("-");
  const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  fecha.setDate(fecha.getDate() - 1);
  return fechaLocalYYYYMMDD(fecha);
}

function formatearFecha(fechaTexto) {
  const partes = fechaTexto.split("-");
  const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function leerSesiones() {
  const texto = localStorage.getItem(CLAVE_STORAGE);
  if (!texto) {
    return [];
  }
  return JSON.parse(texto);
}

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesiones));
}

function calcularRacha(sesiones) {
  const diasConEstudio = {};
  for (let i = 0; i < sesiones.length; i++) {
    diasConEstudio[sesiones[i].fecha] = true;
  }

  const hoy = fechaLocalYYYYMMDD(new Date());
  const ayer = restarUnDia(hoy);

  let diaActual;
  if (diasConEstudio[hoy]) {
    diaActual = hoy;
  } else if (diasConEstudio[ayer]) {
    diaActual = ayer;
  } else {
    return 0;
  }

  let racha = 0;
  while (diasConEstudio[diaActual]) {
    racha = racha + 1;
    diaActual = restarUnDia(diaActual);
  }
  return racha;
}

function textoDeRacha(racha, sesiones) {
  if (racha === 0) {
    return "Empieza hoy para encender tu racha.";
  }

  const hoy = fechaLocalYYYYMMDD(new Date());
  const haySesionHoy = sesiones.some(function (sesion) {
    return sesion.fecha === hoy;
  });

  if (!haySesionHoy) {
    return "Sigue viva. Estudia hoy para no perderla.";
  }

  if (racha === 1) {
    return "1 día seguido. ¡Sigue así!";
  }

  return racha + " días seguidos. ¡Sigue así!";
}

function mostrarSesiones(sesiones) {
  lista.innerHTML = "";

  if (sesiones.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.textContent = "Todavía no hay sesiones.";
    lista.appendChild(vacio);
    return;
  }

  const ordenadas = sesiones.slice().sort(function (a, b) {
    if (a.fecha === b.fecha) {
      return b.id - a.id;
    }
    if (a.fecha < b.fecha) {
      return 1;
    }
    return -1;
  });

  for (let i = 0; i < ordenadas.length; i++) {
    const sesion = ordenadas[i];
    const item = document.createElement("li");
    item.className = "sesion";

    const fecha = document.createElement("p");
    fecha.className = "sesion-fecha";
    fecha.textContent = formatearFecha(sesion.fecha);

    const tema = document.createElement("p");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;

    const minutos = document.createElement("p");
    minutos.className = "sesion-minutos";
    minutos.textContent = sesion.minutos + " minutos";

    const borrar = document.createElement("button");
    borrar.type = "button";
    borrar.className = "borrar";
    borrar.textContent = "Borrar";
    borrar.addEventListener("click", function () {
      borrarSesion(sesion.id);
    });

    item.appendChild(fecha);
    item.appendChild(tema);
    item.appendChild(minutos);
    item.appendChild(borrar);
    lista.appendChild(item);
  }
}

function borrarSesion(id) {
  const acepta = window.confirm("¿Quieres borrar esta sesión?");
  if (!acepta) {
    return;
  }

  const sesiones = leerSesiones().filter(function (sesion) {
    return sesion.id !== id;
  });
  guardarSesiones(sesiones);
  pintarPantalla();
}

function pintarPantalla() {
  const sesiones = leerSesiones();
  const racha = calcularRacha(sesiones);
  rachaNumero.textContent = racha;
  rachaTexto.textContent = textoDeRacha(racha, sesiones);
  mostrarSesiones(sesiones);
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (!fecha || !tema || !(minutos > 0)) {
    return;
  }

  const sesiones = leerSesiones();
  sesiones.push({
    id: Date.now(),
    fecha: fecha,
    tema: tema,
    minutos: minutos,
  });
  guardarSesiones(sesiones);

  campoTema.value = "";
  campoMinutos.value = "";
  campoFecha.value = fechaLocalYYYYMMDD(new Date());
  pintarPantalla();
});

campoFecha.value = fechaLocalYYYYMMDD(new Date());
pintarPantalla();
