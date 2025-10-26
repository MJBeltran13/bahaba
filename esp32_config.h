/*
 * ESP32 Configuration File
 * Copy this file and rename to config.h
 * Update the values below for your setup
 */

#ifndef ESP32_CONFIG_H
#define ESP32_CONFIG_H

// WiFi Configuration
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// API Configuration
#define API_URL "https://bahaba-a4a2e-default-rtdb.firebaseio.com/readings.json"
#define GATE_ID "north"  // Options: "north", "south", "east"

// Hardware Configuration
#define TRIG_PIN 5
#define ECHO_PIN 18
#define DHT_PIN 4
#define DHT_TYPE DHT22

// Timing Configuration
#define READING_INTERVAL 30000  // 30 seconds in milliseconds
#define WIFI_TIMEOUT 20000      // 20 seconds WiFi connection timeout

// Water Level Thresholds (in inches)
#define LOW_THRESHOLD 8.0
#define MEDIUM_THRESHOLD 13.0
#define HIGH_THRESHOLD 20.0

// Sensor Configuration
#define MAX_DISTANCE 30.0       // Maximum distance sensor can measure (cm)
#define SENSOR_HEIGHT 30.0      // Height of sensor above water surface (cm)

// Debug Configuration
#define SERIAL_BAUD 115200
#define DEBUG_MODE true

#endif
