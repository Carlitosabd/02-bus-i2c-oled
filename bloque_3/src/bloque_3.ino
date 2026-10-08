// ============================================================================
// UETS SOPORTE TÉCNICO — SEMANA 02 — BLOQUE 3: TELEMETRÍA CON logBoot()
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

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET_PIN);

// Función modular reutilizable para imprimir módulos con estado alineado
void logBoot(const char* moduleName, bool isOk) {
    // TODO 3.1: Imprimir el nombre del módulo en la posición actual del cursor:
    display.print(moduleName);

    // TODO 3.2: Alinear el estado a la derecha en la columna X=95 sin alterar la fila Y actual.
    display.setCursor(95, display.getCursorY());

    // TODO 3.3: Según el valor de isOk (true/false), imprimir "[OK]" o "[ERR]":
    if (isOk) {
        display.println("[OK]");
    } else {
        display.println("[ERR]");
    }

    // TODO 3.4: Volcar los cambios del buffer al vidrio físico y pausar 200ms para efecto visual:
    display.display();
    delay(200);
}

void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(1000);
    Serial.println("\n[BLOQUE 3] Demostración de Telemetría logBoot()...");

    Wire.begin(21, 22);

    if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDR)) {
        Serial.println("[OLED] ERROR: Pantalla no detectada.");
        while (true);
    }

    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    
    // Cabecera
    display.setCursor(8, 0);
    display.println(">> ESP32 SISTEMA <<");
    display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
    display.setCursor(0, 14); // Deja el cursor listo en la primera fila de datos
    display.display();

    // TODO 3.5: Probar la función logBoot() con dos módulos de prueba:
    logBoot("ESP32 Core", true);
    logBoot("Sensor I2C", true);

    Serial.println("[BLOQUE 3] Telemetría renderizada correctamente.");
}

void loop() {
    delay(1000);
}