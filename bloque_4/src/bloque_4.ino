// ============================================================================
// UETS SOPORTE TÉCNICO — SEMANA 02 — BLOQUE 4: RETO INTEGRADOR POST
// 3° Bachillerato Técnico en Informática (2026–2027)
// ============================================================================

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Constantes de configuración de Hardware
#define SERIAL_BAUD 115200
#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22
#define I2C_CLOCK_SPEED 400000
#define OLED_I2C_ADDR 0x3C
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET_PIN -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET_PIN);

// ----------------------------------------------------------------------------
// Este bloque es un proyecto independiente: no puede importar los bloques 1 a 3,
// así que las rutinas ya construidas se incluyen aquí como contexto del integrador.
// TU TRABAJO está marcado con los // TODO 4.x de más abajo.
// ----------------------------------------------------------------------------

// Escáner I2C (Reto 01)
int scanI2CBus() {
    int devicesFound = 0;
    Serial.println("\n[I2C] Pidiendo lista de asistencia en el bus...");
    for (byte address = 1; address < 127; address++) {
        Wire.beginTransmission(address);
        byte error = Wire.endTransmission();
        if (error == 0) {
            Serial.printf("[I2C] Presente: 0x%02X ", address);
            if (address == OLED_I2C_ADDR) {
                Serial.println("➔ [Pantalla OLED SSD1306] [OK]");
            } else {
                Serial.println("➔ [Periférico Detectado]");
            }
            devicesFound++;
        }
    }
    return devicesFound;
}

// Inicialización de Pantalla (Reto 02)
bool initDisplay() {
    if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDR)) {
        Serial.println("[OLED] ERROR CRÍTICO: No responde el display en 0x3C.");
        return false;
    }
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.display();
    return true;
}

// Cabecera visual (Reto 02)
void showBootHeader() {
    display.clearDisplay();
    display.setCursor(8, 0);
    display.println(">> ESP32 SISTEMA <<");
    display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
    display.setCursor(0, 14);
    display.display();
}

// Telemetría con alineación dinámica (Reto 03)
void logBoot(const char* moduleName, bool isOk) {
    display.print(moduleName);
    display.setCursor(95, display.getCursorY());
    if (isOk) {
        display.println("[OK]");
    } else {
        display.println("[ERR]");
    }
    display.display();
    delay(200);
}

// Mensaje de sistema operativo listo (Reto 03)
void showSystemReady() {
    display.drawLine(0, 52, 128, 52, SSD1306_WHITE);
    display.setCursor(10, 55);
    display.println(">> SISTEMA LISTO <<");
    display.display();
    Serial.println("\n[SISTEMA] Auto-diagnóstico superado con éxito. Estación operativa.");
}

// Rutina POST (Reto 04)
void runSystemPOST() {
    Serial.println("\n==========================================");
    Serial.println("   ESP32: POWER-ON SELF TEST (POST)       ");
    Serial.println("==========================================");

    // TODO 4.1: Mostrar la cabecera visual del sistema antes de diagnosticar.
    // Pista Conceptual: La cabecera es un bloque ya construido más arriba; pensá cuál de
    // esas rutinas dibuja el título y su línea divisoria.
    /* ESCRIBE TU CÓDIGO AQUÍ */

    // TODO 4.2: Reportar los 4 subsistemas de la estación (ESP32, bus I2C, pantalla y batería)
    // usando la rutina de telemetría reutilizable, todos en estado correcto.
    // Pista Conceptual: Una sola rutina sirve para los cuatro renglones; el nombre del módulo
    // y su estado se pasan como argumentos.
    /* ESCRIBE TU CÓDIGO AQUÍ */

    delay(500);

    // TODO 4.3: Cerrar el arranque mostrando la barra final de sistema listo.
    // Pista Conceptual: Es la otra rutina ya construida más arriba que cierra la secuencia.
    /* ESCRIBE TU CÓDIGO AQUÍ */
}

void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(1000);
    Serial.println("\n[BOOT] Arrancando Sistema Embebido ESP32 DevKit v4...");

    // Inicializar bus I2C
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
    Wire.setClock(I2C_CLOCK_SPEED);

    // TODO 4.4: Orquestar la secuencia de arranque: censar el bus, y solo si hay al menos
    // un periférico presente y la pantalla quedó operativa, lanzar la rutina POST.
    // Si algo falta, informar la falla por el Monitor Serie.
    // Pista Conceptual: Recordá que el censo devuelve un número y el arranque de la pantalla
    // devuelve un valor lógico: los dos tienen que estar bien para continuar.
    /* ESCRIBE TU CÓDIGO AQUÍ */
}

void loop() {
    delay(1000);
}
