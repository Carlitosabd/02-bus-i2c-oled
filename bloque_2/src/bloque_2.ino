// ============================================================================
// UETS SOPORTE TÉCNICO — SEMANA 02 — BLOQUE 2: INICIALIZACIÓN OLED & CABECERA
// 3° Bachillerato Técnico en Informática (2026–2027)
// ============================================================================

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET_PIN -1
#define OLED_I2C_ADDR 0x3C
#define SERIAL_BAUD 115200

// Instanciación del objeto display con sus 4 parámetros:
// (Ancho, Alto, Puntero al Bus Wire, Pin de Reset)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET_PIN);

void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(1000);
    Serial.println("\n[BLOQUE 2] Inicializando Pantalla OLED SSD1306...");

    // Inicializamos el bus I2C en los pines por defecto del ESP32 (SDA=21, SCL=22)
    Wire.begin(21, 22);

    // TODO 2.1: Arrancar la pantalla activando la bomba de carga interna (charge pump)
    // pasando la constante SSD1306_SWITCHCAPVCC y la dirección 0x3C.
    // Pregunta Guía: ¿Qué hace la bomba de carga con el voltaje de 3.3V?
    // Pista de Hardware: El panel necesita que su circuito elevador interno genere el voltaje de trabajo; si no se habilita, la pantalla queda apagada aunque el bus responda.

    Serial.println("[OLED] Pantalla SSD1306 inicializada [OK]");

    // TODO 2.2: Construir la cabecera visual en el buffer RAM:
    // Pista Conceptual: Todo dibujo ocurre primero en una memoria intermedia; ordená los trazos (fondo, color, tamaño, posición, texto y línea divisoria) pensando en qué debe quedar visible al final.
    /* ESCRIBE TU CÓDIGO AQUÍ */

    // TODO 2.3: ¡LA ORDEN MÁGICA!
    // Pregunta Clave: Si solo escribiste en la memoria RAM, ¿por qué la pantalla sigue negra?
    // ¿Qué orden vuelca el buffer hacia los píxeles físicos del vidrio?
    // Pista Conceptual: Mientras no exista una orden de volcado, la pantalla seguirá negra aunque el buffer ya tenga el dibujo.

    Serial.println("[OLED] Cabecera visual renderizada exitosamente.");
}

void loop() {
    delay(1000);
}
