// ============================================================================
// UETS SOPORTE TÉCNICO — SEMANA 02 — BLOQUE 1: ESCÁNER DE BUS I2C
// 3° Bachillerato Técnico en Informática (2026–2027)
// ============================================================================

#include <Arduino.h>
#include <Wire.h>

#define SERIAL_BAUD 115200
#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22
#define I2C_CLOCK_SPEED 400000 // 400 kHz (Modo Rápido)
#define OLED_I2C_ADDR 0x3C     // Dirección física esperada de la pantalla OLED

void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(1000);
    Serial.println("\n========================================================");
    Serial.println("  [BLOQUE 1] ESCÁNER DE DIRECCIONES DE HARDWARE I2C     ");
    Serial.println("========================================================");

    // TODO 1.1: Inicializar el bus I2C en los pines SDA y SCL del ESP32.
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

    // TODO 1.2: Configurar la velocidad del reloj a 400kHz (Modo Rápido).
    Wire.setClock(I2C_CLOCK_SPEED);

    Serial.println("[I2C] Bus configurado en SDA:GPIO21, SCL:GPIO22 a 400kHz.\n");
    Serial.println("--- INICIANDO BARRIDO DE DIRECCIONES (0x01 .. 0x7E) ---");

    int devicesFound = 0;

    // TODO 1.3: Recorrer las direcciones válidas de 7 bits (del 1 al 126).
    for (byte address = 1; address < 127; address++) {

        // TODO 1.4: Tocar la puerta del periférico:
        Wire.beginTransmission(address);
        byte error = Wire.endTransmission();

        // TODO 1.5: Evaluar la respuesta del periférico:
        if (error == 0) {
            Serial.printf("[I2C] Dispositivo detectado en: 0x%02X ", address);
            if (address == OLED_I2C_ADDR) {
                Serial.println("➔ [Display OLED SSD1306] [OK]");
            } else {
                Serial.println("➔ [Periférico Desconocido]");
            }
            devicesFound++;
        }
    }

    if (devicesFound == 0) {
        Serial.println("[I2C] ❌ No se detectaron dispositivos en el bus.");
        Serial.println("[DIAGNÓSTICO] Revisa que SDA esté en GPIO21, SCL en GPIO22, 3V3 y GND.");
    } else {
        Serial.printf("\n--- BARRIDO FINALIZADO: %d dispositivo(s) encontrado(s) ---\n", devicesFound);
    }
}

void loop() {
    // El escaneo de hardware se ejecuta una sola vez al encender.
    delay(1000);
}