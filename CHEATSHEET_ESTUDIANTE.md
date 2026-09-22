# ⚡ Cheatsheet del Estudiante: Protocolo Bus I2C & Pantalla OLED (UETS)

---

## 1. Convención de Commits Semánticos (Commitlint)
Para que el robot evaluador de GitHub Actions apruebe tu entrega con el **Check Verde ✅**, tus mensajes de commit deben respetar este formato:

```bash
git commit -m "tipo(alcance): descripcion en minusculas"
```

| Prefijo | Significado | Ejemplo Práctico de Aula |
| :--- | :--- | :--- |
| `feat:` | Nuevo reto completado | `git commit -m "feat(reto1): implementar scanner i2c en 0x3c"` |
| `fix:` | Corrección en código o conexiones | `git commit -m "fix(oled): agregar display.display para volcar buffer"` |
| `docs:` | Enlaces de screencast o documentación | `git commit -m "docs(readme): agregar enlace al screencast de 4 min"` |
| `refactor:` | Orden y modularidad sin cambiar lógica | `git commit -m "refactor: modularizar rutina post del sistema"` |

---

## 2. Bus Síncrono I2C: El Megáfono y los Números de Lista

El bus I2C permite conectar múltiples sensores usando solo **2 cables**:

* **SDA (Línea de Datos):** Por donde viaja la información (`GPIO21` en el ESP32).
* **SCL (Línea de Reloj):** El metrónomo síncrono que marca el compás (`GPIO22` en el ESP32).
* **El Número de Lista (Dirección `0x3C`):** Cada componente tiene un número de lista único. La pantalla OLED SSD1306 responde exclusivamente a la dirección **`0x3C`**.

### Código de Arduino para el Escáner I2C (`Wire.h`):
El escaneo ocurre en dos tiempos: primero se prepara el escenario y después se pasa lista, dirección por dirección.

1. **Abrir el canal de diagnóstico:** se inicia la comunicación con la computadora para poder leer los resultados en el Monitor Serial.
2. **Encender el bus:** se declaran las dos líneas físicas que compartirán los periféricos —la de datos (GPIO21) y la de reloj (GPIO22)— y se eleva la frecuencia del reloj al Modo Rápido (400 kHz) antes del primer intercambio.
3. **Recorrer las direcciones válidas:** el escáner visita una por una las 126 direcciones de 7 bits (de la 1 a la 126). En cada visita abre un turno hacia esa dirección y lee la respuesta del bus.
4. **Interpretar la confirmación:** si el periférico contesta con ACK, la dirección se lista como presente, se marca con una etiqueta especial cuando coincide con `0x3C` (la pantalla OLED) y el contador de periféricos avanza. Si nadie contesta, esa dirección se descarta y el contador no cambia.
5. **Cerrar el censo:** al terminar el recorrido se informa por el Monitor Serial cuántos periféricos respondieron en total.

> [!TIP]
> **Preguntas Clave para el Taller:**
> - **¿Cómo avanza el escáner?** En el bucle `for`, la variable `address` va sumando de 1 en 1 para tocar la puerta de cada dirección (del 1 al 126).
> - **¿Qué significa el cero?** Si `error == 0`, el sensor respondió con éxito (pulso ACK), diciendo: *«¡Presente, estoy conectado y listo!»*.
> - **Diagnóstico en banco:** Si el Monitor Serial reporta `Total perifericos: 0`, revisa en el protoboard que SDA esté en GPIO21, SCL en GPIO22, y que GND y 3.3V no estén flojos.

---

## 3. Pantalla OLED SSD1306: El Cuaderno Borrador vs la Pizarra Real

La pantalla de $128 \times 64$ tiene 8,192 píxeles monocromáticos ($1024\text{ Bytes}$ en memoria RAM).

* **El Cuaderno Borrador secreto:**  
  Cuando ejecutas `display.println("Hola");`, el ESP32 escribe en su memoria interna, pero la pantalla física sigue completamente negra.
* **La Pizarra Real:**  
  Para que aparezca en el vidrio físico, debes invocar la orden obligatoria: **`display.display();`**.

**Secuencia de encendido (concepto y orden de pasos):**

1. **Declarar las librerías necesarias:** el bus I2C, el motor gráfico y el controlador del panel.
2. **Construir el objeto de la pantalla** con sus cuatro parámetros clave: ancho, alto, referencia al bus y pin de reset (ver tabla siguiente).
3. **Arrancar el controlador:** se habilita la bomba de carga interna para elevar el voltaje y se indica la dirección del bus donde vive el panel (`0x3C`).
4. **Limpiar el borrador:** se vacía la memoria intermedia para no arrastrar píxeles de encendidos anteriores.
5. **Elegir el estilo del lápiz:** tamaño de letra, color y posición inicial del cursor (origen arriba a la izquierda).
6. **Escribir el contenido en el borrador:** un título de sistema y una línea divisoria horizontal.
7. **Volcar al vidrio real:** recién en este último paso la imagen sale de la memoria intermedia y aparece físicamente en la pantalla.

### 🔍 ¿Qué significa cada parámetro de `Adafruit_SSD1306 display(128, 64, &Wire, -1)`?

| Parámetro | Valor Típico | Significado Práctico en el Taller |
| :--- | :--- | :--- |
| **`SCREEN_WIDTH`** | `128` | **Ancho en píxeles:** 128 columnas de puntos luminosos. |
| **`SCREEN_HEIGHT`** | `64` | **Alto en píxeles:** 64 filas de puntos luminosos ($128 \times 64 = 8,192\text{ px}$). |
| **`&Wire`** | `&Wire` | **Bus I2C:** El ampersand (`&`) pasa la referencia directa al puerto I2C (SDA=21, SCL=22). |
| **`OLED_RESET`** | `-1` | **Sin pin de reset dedicado:** La pantalla de 4 pines no tiene cable de reset físico; `-1` evita gastar un pin del ESP32. |

> [!TIP]
> **¿Y qué hace `display.begin(SSD1306_SWITCHCAPVCC, 0x3C)`?**  
> * **`SSD1306_SWITCHCAPVCC`:** Activa la bomba de carga interna (*charge pump*) para elevar los 3.3V a ~7.5V y lograr encender físicamente los diodos OLED.  
> * **`0x3C`:** Dirección hexadecimal del periférico en el bus I2C (confirmada con el escáner del Reto 01).

> [!IMPORTANT]
> **Pregunta Clave:**  
> Si escribes en tu cuaderno borrador pero no levantas la hoja, ¿el profesor la ve? No. ¿Qué función en tu código de Arduino levanta la hoja hacia la pantalla? (`display.display();`).

---

## 4. Telemetría Modular: La Función `logBoot()` (El Sello de Aprobado)

Para no copiar y pegar 4 veces el mismo código al chequear componentes, usamos una función reusable con alineación dinámica:

**Secuencia de la rutina (concepto y orden de pasos):**

1. **Escribir el nombre del módulo** en la fila actual del borrador, sin avanzar de renglón.
2. **Reposicionar el cursor** en la misma fila pero en una columna fija a la derecha (X=95); se reutiliza la coordenada vertical actual para que los renglones no se encimen.
3. **Elegir la etiqueta de estado** según el valor booleano recibido: confirmación cuando el módulo superó su verificación, error cuando no.
4. **Volcar el borrador al vidrio** para que el renglón se vea y **pausar brevemente** la secuencia para que el ojo humano la siga.

> [!TIP]
> **Pregunta Clave:**  
> ¿Por qué usamos `display.getCursorY()` en lugar de un número fijo como `20`? (Para que cada nuevo módulo se imprima en su propio renglón automáticamente sin encimarse).

---

## 5. Rutina POST del Sistema: El Chequeo de Arranque

Al encenderse, el ESP32 ejecuta su auto-diagnóstico (Power-On Self-Test):

```text
┌────────────────────────┐
│ >> ESP32 SISTEMA <<    │  <- cabecera visual de arranque
├────────────────────────┤
│ ESP32 240MHz      [OK] │  <- un renglón de telemetría por
│ I2C @ 400kHz      [OK] │     subsistema, con el estado
│ OLED 0x3C         [OK] │     alineado a la derecha
│ Bateria 8.4V      [OK] │
├────────────────────────┤
│ >> SISTEMA LISTO <<    │  <- cierre de la rutina de arranque
└────────────────────────┘
```

> [!IMPORTANT]
> **Orden en `setup()`:**  
> 1. Iniciar Serial a 115200 bps.  
> 2. `initI2CBus()` (activar cables I2C).  
> 3. `scanI2CBus()` (comprobar que la pantalla responda en `0x3C`).  
> 4. `initDisplay()` (encender pantalla).  
> 5. `runSystemPOST()` (auto-diagnóstico en pantalla).

---

## 6. ⏱️ Límites Estrictos de Video & Penalizaciones por Exceso

| Entregable | Duración Máxima | Penalización por Exceso |
| :--- | :--- | :--- |
| **Short de Anticipación** | $\le 60\text{ segundos}$ (gracia máx. 65s) | **-0.50 pts** si supera los 65 segundos.<br>Si supera 90s se califica sobre 50%. |
| **Screencast Demostrativo** | 3 a 4 minutos (tope máx. 5:00 min) | **-1.00 pt** si supera los 5:00 minutos.<br>*(El docente califica estrictamente hasta el minuto 5:00)*. |

> [!CAUTION]
> **Regla de Oro en Ingeniería:** En una sustentación técnica, sobreextenderse denota falta de síntesis y complica la revisión docente. ¡Sé conciso, ve al grano y demuestra tu código en vivo!

---

## 7. 💡 Décimas Extra: Quizzes de Opción Múltiple en el Portal (+1.00 pt)

En el [Portal Web Oficial de la Semana 02](https://uets-st-portal.vgmiltonisaac.workers.dev/02-bus-i2c-oled/) tienes habilitados **10 Quizzes Interactivos (+0.10 pts c/u)** para ganar bonificación directa en tu aporte del taller durante las pausas activas de clase:

1. **¿Cuáles son los pines físicos del bus I2C por defecto en el ESP32?**  
   *Respuesta:* `SDA = GPIO21` (datos) y `SCL = GPIO22` (reloj).
2. **¿Por qué son indispensables las resistencias Pull-Up de $4.7\text{ k}\Omega$ en I2C?**  
   *Respuesta:* Al operar en drenador abierto (*Open-Drain*), mantienen las líneas en nivel alto pasivo ($3.3\text{ V}$) en reposo y evitan cortocircuitos cuando un chip aterriza la línea a Tierra ($0\text{ V}$).
3. **¿A qué velocidad opera el bus con `Wire.setClock(400000)`?**  
   *Respuesta:* Modo Rápido (*Fast Mode*) a $400\text{ kHz}$ ($400,000\text{ pulsos por segundo}$).
4. **¿Qué significa físicamente `Wire.endTransmission() == 0`?**  
   *Respuesta:* El esclavo jaló la línea SDA a nivel `LOW` ($0\text{ V} / \text{GND}$) en el 9° pulso de reloj SCL para emitir el pulso físico ACK (*"¡Presente y listo para recibir órdenes!"*).
5. **¿Qué ocurre si dos pantallas OLED en el mismo bus tienen la dirección `0x3C`?**  
   *Respuesta:* Colisión en el bus I2C: ambas intentan responder simultáneamente, corrompiendo la comunicación.
6. **¿Por qué usamos `-1` en `Adafruit_SSD1306 display(128, 64, &Wire, -1)`?**  
   *Respuesta:* Porque la pantalla OLED de 4 pines del taller no tiene cable de reset físico externo; al pasar `-1` evitamos reservar un GPIO del ESP32.
7. **¿Para qué sirve `SSD1306_SWITCHCAPVCC` en `display.begin(...)`?**  
   *Respuesta:* Activa la bomba de carga interna (*charge pump*) para elevar los $3.3\text{ V}$ a $\sim 7.5\text{ V}$ para iluminar físicamente los diodos orgánicos OLED.
8. **¿Por qué la pantalla física sigue apagada tras ejecutar `display.println("Hola")`?**  
   *Respuesta:* Porque `println()` solo dibuja en el borrador en memoria RAM interna ($1024\text{ Bytes}$). Es estrictamente obligatorio invocar **`display.display()`** para volcar la imagen por I2C a los píxeles reales.
9. **¿Por qué usamos `display.getCursorY()` en `logBoot()` antes de imprimir `[OK]`?**  
   *Respuesta:* Para posicionar el cursor en la columna derecha ($X=95$) respetando la misma fila vertical del módulo actual, evitando que las líneas de telemetría se encimen.
10. **¿Por qué no podemos llamar a `runSystemPOST()` antes de `initI2CBus()` en `setup()`?**  
    *Respuesta:* Porque intentaría enviar comandos a la pantalla antes de que el bus I2C y sus pines GPIO estén energizados e inicializados con `Wire.begin()`, provocando pantalla negra o congelamiento del bus.
