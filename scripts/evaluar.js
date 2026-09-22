#!/usr/bin/env node
/**
 * ============================================================================
 * EVALUADOR PEDAGÓGICO DE CÓDIGO — SOPORTE TÉCNICO UETS (2026–2027)
 * Validador modular por reto y global para la Semana 02 (Bus I2C & OLED)
 * ============================================================================
 * Uso:
 *   node scripts/evaluar.js      -> Evalúa todos los bloques (pnpm test / pnpm run test:all)
 *   node scripts/evaluar.js 1    -> Evalúa solo el Reto 01 (pnpm run start:01)
 *   node scripts/evaluar.js 2    -> Evalúa solo el Reto 02 (pnpm run start:02)
 *   node scripts/evaluar.js 3    -> Evalúa solo el Reto 03 (pnpm run start:03)
 *   node scripts/evaluar.js 4    -> Evalúa solo el Reto 04 (pnpm run start:04)
 *
 * REGLA DE ORO DE ESTE EVALUADOR
 * ----------------------------------------------------------------------------
 * Solo se evalúa CÓDIGO EJECUTABLE. Los comentarios se descartan antes de
 * analizar. Motivo: el andamiaje pedagógico describe las funciones esperadas
 * en comentarios ("Preguntas Guía"), y si se analizaran los comentarios, un
 * archivo SIN resolver aprobaría todos los chequeos. Este evaluador mide
 * trabajo real del estudiante, no la presencia de pistas docentes.
 * ----------------------------------------------------------------------------
 * Un bloque se considera COMPLETADO cuando el código real cumple los 4
 * criterios técnicos del bloque. Dejar el marcador /* ESCRIBE TU CÓDIGO AQUÍ *\/
 * NO resta puntaje (es una advertencia de limpieza), pero tampoco lo otorga.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const targetArg = process.argv[2] ? process.argv[2].trim().toLowerCase() : 'all';
const targetBlock = targetArg === 'all' || !['1', '2', '3', '4'].includes(targetArg) ? null : parseInt(targetArg, 10);

// Colores ANSI
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

const MARCADOR_ANDAMIAJE = 'ESCRIBE TU CÓDIGO AQUÍ';

function leerArchivo(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Descarta comentarios de bloque y de línea para analizar únicamente el código
 * real. Se protege "://" para no romper URLs dentro de cadenas.
 */
function soloCodigo(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/** Cuenta cuántos marcadores de andamiaje quedaron sin borrar (solo informativo). */
function marcadoresRestantes(src) {
  return src.split(MARCADOR_ANDAMIAJE).length - 1;
}

/**
 * Devuelve el CUERPO de una función, apareando llaves. Se usa para exigir llamadas
 * reales dentro de una rutina: sin esto, basta con que el nombre de la función
 * aparezca declarado o definido en cualquier parte para que el criterio pase.
 */
function cuerpoDe(codigo, nombre) {
  const m = new RegExp(`\\b${nombre}\\s*\\([^)]*\\)\\s*\\{`, 'i').exec(codigo);
  if (!m) return '';
  let i = m.index + m[0].length;
  const inicio = i;
  let profundidad = 1;
  while (i < codigo.length && profundidad > 0) {
    const ch = codigo[i];
    if (ch === '{') profundidad++;
    else if (ch === '}') profundidad--;
    i++;
  }
  return codigo.slice(inicio, i - 1);
}

let violaciones = [];
function checkForbidden(content, file) {
  if (/c\+\+/i.test(content)) {
    violaciones.push(`Archivo '${file}' contiene 'C++'. Usar siempre 'código de Arduino'.`);
  }
  if (/baymax/i.test(content)) {
    violaciones.push(`Archivo '${file}' contiene 'Baymax'. Usar nomenclatura neutral 'Sistema Embebido ESP32'.`);
  }
  if (/socr[aá]t/i.test(content)) {
    violaciones.push(`Archivo '${file}' contiene jerga 'socrática'. Usar 'Preguntas Guía' o 'Preguntas de Pizarra'.`);
  }
}

/** Evalúa el código real de un bloque y devuelve su puntaje. */
function evaluarCodigoReal(relPath, nombreReto, criterios) {
  console.log(`${c.bold}${nombreReto}${c.reset}`);
  const original = leerArchivo(relPath);
  if (!original) {
    console.log(`  ${c.red}✖ Archivo '${relPath}' no encontrado.${c.reset}`);
    return 0;
  }

  const codigo = soloCodigo(original);
  checkForbidden(codigo, relPath);

  const resultados = criterios(codigo);
  const aprobados = resultados.filter(r => r.ok).length;
  const completado = aprobados === resultados.length;

  if (completado) {
    console.log(`  ${c.green}${c.bold}ESTADO: ¡RETO COMPLETADO! (1.00 / 1.00 pt)${c.reset}`);
  } else {
    console.log(`  ${c.yellow}${c.bold}ESTADO: EN PROCESO / PENDIENTE (${aprobados}/${resultados.length} criterios · 0.00 / 1.00 pt)${c.reset}`);
  }

  resultados.forEach(r => {
    console.log(`    ${r.ok ? c.green + '✔' : c.yellow + '✖'} ${r.msg}${c.reset}`);
  });

  const pendientes = marcadoresRestantes(original);
  if (pendientes > 0) {
    console.log(`    ${c.magenta}ℹ ${pendientes} marcador(es) 'ESCRIBE TU CÓDIGO AQUÍ' sin borrar. No afecta tu nota, pero limpia el archivo.${c.reset}`);
  }

  return completado ? 1.0 : 0.0;
}

// Encabezado
console.log(`\n${c.bold}${c.cyan}======================================================================${c.reset}`);
if (targetBlock) {
  console.log(`${c.bold}${c.cyan} 🤖 REPORTE DE RETO INDIVIDUAL — RETO 0${targetBlock} (SOPORTE TÉCNICO UETS)     ${c.reset}`);
} else {
  console.log(`${c.bold}${c.cyan} 🤖 REPORTE PEDAGÓGICO DE ENTREGA — SOPORTE TÉCNICO UETS (3° BGU)    ${c.reset}`);
  console.log(`${c.bold}${c.cyan}    Semana 02: Protocolo Bus I2C, Scanner y Pantalla OLED SSD1306     ${c.reset}`);
}
console.log(`${c.bold}${c.cyan}======================================================================${c.reset}\n`);

let totalPuntos = 0;
let bloquesCompletados = 0;

// ----------------------------------------------------------------------------
// EVALUACIÓN BLOQUE 1
// ----------------------------------------------------------------------------
function evaluarBloque1() {
  const p = evaluarCodigoReal('bloque_1/src/bloque_1.ino', '🟢 Reto 01: Escáner de Direcciones de Hardware I2C (0x3C)', (codigo) => {
    const hasWireBegin = /Wire\.begin\s*\(\s*(21|I2C_SDA_PIN)\s*,\s*(22|I2C_SCL_PIN)\s*\)/i.test(codigo) || /Wire\.begin\s*\(/i.test(codigo);
    const hasWireClock = /Wire\.setClock\s*\(\s*(400000|I2C_CLOCK_SPEED)\s*\)/i.test(codigo);
    const hasTransmission = /Wire\.beginTransmission\s*\(/i.test(codigo) && /Wire\.endTransmission\s*\(/i.test(codigo);
    const hasAckCheck = /error\s*==\s*0/i.test(codigo) || /Wire\.endTransmission\s*\(\s*\)\s*==\s*0/i.test(codigo);
    const hasOledAddr = /0x3C/i.test(codigo) || /OLED_I2C_ADDR/i.test(codigo);
    return [
      { ok: hasWireBegin, msg: hasWireBegin ? 'El bus quedó inicializado con los pines de datos y de reloj.' : 'Falta inicializar el bus declarando los pines de datos (SDA) y de reloj (SCL).' },
      { ok: hasWireClock, msg: hasWireClock ? 'Frecuencia del bus elevada a Modo Rápido (400 kHz).' : 'Falta elevar la frecuencia del bus al Modo Rápido (400 kHz).' },
      { ok: hasTransmission, msg: hasTransmission ? 'Ciclo de consulta por dirección completo (abrir turno y leer respuesta).' : 'Falta el ciclo de consulta: abrir el turno hacia una dirección y leer la respuesta del bus.' },
      { ok: (hasAckCheck && hasOledAddr), msg: (hasAckCheck && hasOledAddr) ? 'Confirmación del periférico y dirección esperada 0x3C evaluadas.' : 'Falta validar la confirmación del periférico y compararla con la dirección esperada 0x3C.' }
    ];
  });
  registrar(p);
  if (targetBlock === 1) guiaWokwi(1, 'bloque_1', 'Abre el Monitor Serial (115200 bps) y comprueba que detecte 0x3C [OK].');
}

// ----------------------------------------------------------------------------
// EVALUACIÓN BLOQUE 2
// ----------------------------------------------------------------------------
function evaluarBloque2() {
  const p = evaluarCodigoReal('bloque_2/src/bloque_2.ino', '🟡 Reto 02: Inicialización Pantalla OLED SSD1306 & Cabecera Visual', (codigo) => {
    const hasBeginOled = /display\.begin\s*\(\s*SSD1306_SWITCHCAPVCC\s*,\s*(0x3C|OLED_I2C_ADDR)\s*\)/i.test(codigo) || /display\.begin/i.test(codigo);
    const hasClear = /display\.clearDisplay\s*\(\s*\)/i.test(codigo);
    const hasTitle = /display\.(print|println)\s*\(\s*.*ESP32/i.test(codigo);
    const hasLine = /display\.drawLine\s*\(/i.test(codigo);
    const hasDisplayCall = /display\.display\s*\(\s*\)/i.test(codigo);
    return [
      { ok: hasBeginOled, msg: hasBeginOled ? 'Pantalla arrancada habilitando su bomba de carga interna.' : 'Falta arrancar la pantalla habilitando su bomba de carga interna en la dirección 0x3C.' },
      { ok: hasClear, msg: hasClear ? 'Memoria intermedia (buffer RAM) limpiada antes de dibujar.' : 'Falta limpiar la memoria intermedia (buffer RAM) antes de dibujar.' },
      { ok: (hasTitle && hasLine), msg: (hasTitle && hasLine) ? 'Cabecera visual y línea divisoria dibujadas en el buffer.' : 'Falta dibujar la cabecera visual y su línea divisoria horizontal.' },
      { ok: hasDisplayCall, msg: hasDisplayCall ? 'Volcado del buffer al vidrio físico ejecutado.' : '¡ALERTA! Falta la orden de volcado: el dibujo quedó solo en RAM y la pantalla seguirá negra.' }
    ];
  });
  registrar(p);
  if (targetBlock === 2) guiaWokwi(2, 'bloque_2', 'Verifica que aparezca el título >> ESP32 SISTEMA << con su línea horizontal.');
}

// ----------------------------------------------------------------------------
// EVALUACIÓN BLOQUE 3
// ----------------------------------------------------------------------------
function evaluarBloque3() {
  const p = evaluarCodigoReal('bloque_3/src/bloque_3.ino', '🔵 Reto 03: Telemetría Modular con logBoot()', (codigo) => {
    const hasLogBootDef = /void\s+logBoot\s*\(/i.test(codigo);
    const hasCursorY = /display\.getCursorY\s*\(\s*\)/i.test(codigo);
    const hasRightCol = /display\.setCursor\s*\(\s*(95|90|100|85)\s*,\s*display\.getCursorY\s*\(\s*\)\s*\)/i.test(codigo);
    const hasStatusLabels = /\[OK\]/i.test(codigo) && /\[ERR\]/i.test(codigo);
    const hasRefreshInLog = /display\.display\s*\(\s*\)/i.test(codigo);
    return [
      { ok: hasLogBootDef, msg: hasLogBootDef ? 'Función modular de telemetría definida (recibe nombre y estado).' : 'Falta definir la función modular de telemetría, con parámetros de nombre de módulo y estado.' },
      { ok: (hasCursorY && hasRightCol), msg: (hasCursorY && hasRightCol) ? 'Alineación del estado a la columna derecha sin cambiar de fila.' : 'Falta alinear el estado a la columna derecha conservando la fila actual del cursor.' },
      { ok: hasStatusLabels, msg: hasStatusLabels ? 'Etiquetas [OK] y [ERR] impresas según el estado booleano.' : 'Falta imprimir la etiqueta de confirmación [OK] o de error [ERR] según el booleano recibido.' },
      { ok: hasRefreshInLog, msg: hasRefreshInLog ? 'Volcado del buffer al vidrio dentro de la rutina de telemetría.' : 'Falta volcar el buffer al vidrio dentro de la rutina, para que el renglón se vea.' }
    ];
  });
  registrar(p);
  if (targetBlock === 3) guiaWokwi(3, 'bloque_3', 'Comprueba que las etiquetas [OK] queden ordenadas en columna derecha.');
}

// ----------------------------------------------------------------------------
// EVALUACIÓN BLOQUE 4
// ----------------------------------------------------------------------------
function evaluarBloque4() {
  const p = evaluarCodigoReal('bloque_4/src/bloque_4.ino', '🟣 Reto 04: Desafío Integrador POST Completo', (codigo) => {
    // Solo cuentan las LLAMADAS dentro del cuerpo de cada rutina. Un prototipo o una
    // definición de la función no aprueba el criterio.
    const post = cuerpoDe(codigo, 'runSystemPOST');
    const setup = cuerpoDe(codigo, 'setup');
    const llamadasLogBoot = (post.match(/logBoot\s*\(/gi) || []).length;

    const hasPostRoutine = /showBootHeader\s*\(\s*\)/i.test(post);
    const hasSubsystems = llamadasLogBoot >= 4;
    const hasSystemReady = /showSystemReady\s*\(\s*\)/i.test(post);
    const hasSetupOrchestration = /scanI2CBus\s*\(\s*\)/i.test(setup) && /initDisplay\s*\(\s*\)/i.test(setup) && /runSystemPOST\s*\(\s*\)/i.test(setup);
    return [
      { ok: hasPostRoutine, msg: hasPostRoutine ? 'Cabecera visual invocada dentro de la rutina POST.' : 'Falta invocar la cabecera visual dentro de la rutina POST (TODO 4.1).' },
      { ok: hasSubsystems, msg: hasSubsystems ? 'Los 4 subsistemas (ESP32, I2C, OLED y Batería) reportados por telemetría.' : `Faltan renglones de telemetría dentro del POST: se esperan 4 subsistemas y hay ${llamadasLogBoot} (TODO 4.2).` },
      { ok: hasSystemReady, msg: hasSystemReady ? 'Cierre de sistema listo invocado dentro de la rutina POST.' : 'Falta el cierre de sistema listo dentro de la rutina POST (TODO 4.3).' },
      { ok: hasSetupOrchestration, msg: hasSetupOrchestration ? 'Secuencia de arranque enlazada dentro de setup().' : 'Falta enlazar dentro de setup() el censo del bus, el arranque de pantalla y la llamada al POST (TODO 4.4).' }
    ];
  });
  registrar(p);
  if (targetBlock === 4) guiaWokwi(4, 'bloque_4', 'Observa la secuencia completa de arranque y el mensaje >> SISTEMA LISTO <<.');
}

function registrar(puntaje) {
  if (puntaje > 0) {
    bloquesCompletados++;
    totalPuntos += puntaje;
  }
}

function guiaWokwi(n, carpeta, paso) {
  console.log(`\n${c.bold}💡 Guía Rápida para Simular Reto 0${n} en Wokwi:${c.reset}`);
  console.log(`   1. Abre ${c.cyan}${carpeta}/diagram.json${c.reset} en VS Code.`);
  console.log(`   2. Presiona ${c.cyan}F1${c.reset} ➔ escribe ${c.cyan}Wokwi: Start Simulator${c.reset}.`);
  console.log(`   3. ${paso}\n`);
}

// ----------------------------------------------------------------------------
// EJECUCIÓN SEGÚN ARGUMENTO
// ----------------------------------------------------------------------------
if (targetBlock === 1) {
  evaluarBloque1();
} else if (targetBlock === 2) {
  evaluarBloque2();
} else if (targetBlock === 3) {
  evaluarBloque3();
} else if (targetBlock === 4) {
  evaluarBloque4();
} else {
  evaluarBloque1();
  console.log();
  evaluarBloque2();
  console.log();
  evaluarBloque3();
  console.log();
  evaluarBloque4();

  // Resumen global
  console.log(`\n${c.bold}======================================================================${c.reset}`);
  console.log(`${c.bold}📋 RESUMEN FORMATIVO DE CALIFICACIÓN TÉCNICA (BLOQUE A):${c.reset}`);
  console.log(`   • Bloques completados al 100%: ${bloquesCompletados} de 4`);
  console.log(`   • Puntaje estimado de Código/Wokwi: ${totalPuntos.toFixed(2)} / 4.00 pts`);

  if (violaciones.length > 0) {
    console.log(`\n${c.red}${c.bold}⚠️ ALERTA DE REGLAS INSTITUCIONALES INCUMPLIDAS:${c.reset}`);
    violaciones.forEach(v => console.log(`   ${c.red}✖ ${v}${c.reset}`));
  } else {
    console.log(`   • Reglas institucionales UETS: ${c.green}100% Cumplidas (Cero términos prohibidos)${c.reset}`);
  }

  console.log(`\n${c.bold}🕊️ DIRECTIVA DE ENTREGA PARCIAL SALESIANA:${c.reset}`);
  if (bloquesCompletados === 4) {
    console.log(`   ${c.green}🎉 ¡Felicitaciones! Has completado los 4 bloques. Tu código está listo para PR.${c.reset}`);
  } else if (bloquesCompletados > 0) {
    console.log(`   ${c.cyan}ℹ️ Tienes ${bloquesCompletados} bloque(s) completado(s). Si la clase terminó, ¡haz commit y PR!${c.reset}`);
    console.log(`   ${c.cyan}   Graba tu video screencast explicando lo que lograste para asegurar tus 5.0 pts orales.${c.reset}`);
  } else {
    console.log(`   ${c.yellow}ℹ️ Aún no se detecta código propio en los bloques. Completa los // TODO: guiándote con el Cheatsheet.${c.reset}`);
  }
  console.log(`${c.bold}======================================================================\n${c.reset}`);
}

if (violaciones.length > 0) {
  process.exit(1);
}
process.exit(0);
