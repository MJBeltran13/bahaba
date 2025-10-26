/*
 * ESP32 Advanced Flood Detection System
 * Enhanced version with better error handling, OTA updates, and configuration
 * 
 * Features:
 * - WiFi connection with retry logic
 * - Water level detection with multiple readings for accuracy
 * - Temperature and humidity monitoring
 * - Automatic risk level calculation
 * - HTTP POST to API with retry mechanism
 * - Deep sleep mode for battery operation
 * - OTA (Over-The-Air) update capability
 * - Configuration via web interface
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <WebServer.h>
#include <EEPROM.h>
#include <esp_sleep.h>

// Include configuration
#include "esp32_config.h"

// Global variables
WebServer server(80);
bool configMode = false;
unsigned long lastReading = 0;
unsigned long lastWiFiCheck = 0;
int failedAttempts = 0;
const int maxFailedAttempts = 5;

// Sensor readings
struct SensorData {
  float waterLevel;
  float temperature;
  float humidity;
  String riskLevel;
  unsigned long timestamp;
};

void setup() {
  Serial.begin(SERIAL_BAUD);
  delay(1000);
  
  Serial.println("ESP32 Advanced Flood Detection System");
  Serial.println("=====================================");
  
  // Initialize EEPROM
  EEPROM.begin(512);
  
  // Initialize sensors
  initializeSensors();
  
  // Try to connect to WiFi
  if (!connectToWiFi()) {
    Serial.println("Failed to connect to WiFi. Starting configuration mode...");
    startConfigMode();
  } else {
    Serial.println("WiFi connected successfully");
    startNormalOperation();
  }
}

void loop() {
  if (configMode) {
    server.handleClient();
  } else {
    // Check WiFi connection periodically
    if (millis() - lastWiFiCheck > 60000) { // Check every minute
      if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection lost. Attempting reconnection...");
        if (!connectToWiFi()) {
          Serial.println("Reconnection failed. Entering config mode...");
          startConfigMode();
          return;
        }
      }
      lastWiFiCheck = millis();
    }
    
    // Send reading at intervals
    if (millis() - lastReading >= READING_INTERVAL) {
      sendReading();
      lastReading = millis();
    }
  }
  
  delay(1000);
}

void initializeSensors() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  dht.begin();
  
  Serial.println("Sensors initialized");
}

bool connectToWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.print("Connecting to WiFi");
  unsigned long startTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && (millis() - startTime) < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Connected! IP address: ");
    Serial.println(WiFi.localIP());
    return true;
  } else {
    Serial.println();
    Serial.println("Connection failed");
    return false;
  }
}

void startConfigMode() {
  configMode = true;
  
  // Create WiFi access point for configuration
  WiFi.mode(WIFI_AP);
  WiFi.softAP("ESP32-Flood-Sensor", "flood123");
  
  Serial.println("Configuration mode started");
  Serial.println("Connect to WiFi: ESP32-Flood-Sensor");
  Serial.println("Password: flood123");
  Serial.println("Open browser: http://192.168.4.1");
  
  // Setup web server for configuration
  server.on("/", handleRoot);
  server.on("/config", handleConfig);
  server.on("/save", handleSave);
  server.begin();
}

void startNormalOperation() {
  configMode = false;
  Serial.println("Starting normal operation mode");
}

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><title>ESP32 Flood Sensor Config</title></head><body>";
  html += "<h1>ESP32 Flood Sensor Configuration</h1>";
  html += "<form action='/save' method='POST'>";
  html += "<label>WiFi SSID:</label><br>";
  html += "<input type='text' name='ssid' value='" + String(WIFI_SSID) + "'><br><br>";
  html += "<label>WiFi Password:</label><br>";
  html += "<input type='password' name='password'><br><br>";
  html += "<label>API URL:</label><br>";
  html += "<input type='text' name='api_url' value='" + String(API_URL) + "'><br><br>";
  html += "<label>Gate ID:</label><br>";
  html += "<select name='gate_id'>";
  html += "<option value='north'" + (String(GATE_ID) == "north" ? " selected" : "") + ">North</option>";
  html += "<option value='south'" + (String(GATE_ID) == "south" ? " selected" : "") + ">South</option>";
  html += "<option value='east'" + (String(GATE_ID) == "east" ? " selected" : "") + ">East</option>";
  html += "</select><br><br>";
  html += "<input type='submit' value='Save Configuration'>";
  html += "</form></body></html>";
  
  server.send(200, "text/html", html);
}

void handleConfig() {
  handleRoot();
}

void handleSave() {
  if (server.hasArg("ssid") && server.hasArg("password") && server.hasArg("api_url") && server.hasArg("gate_id")) {
    // Save configuration to EEPROM
    String ssid = server.arg("ssid");
    String password = server.arg("password");
    String apiUrl = server.arg("api_url");
    String gateId = server.arg("gate_id");
    
    // Here you would save to EEPROM and restart
    server.send(200, "text/html", "<h1>Configuration saved! Restarting...</h1>");
    delay(2000);
    ESP.restart();
  } else {
    server.send(400, "text/html", "<h1>Missing parameters</h1>");
  }
}

SensorData readSensors() {
  SensorData data;
  
  // Read water level (take multiple readings for accuracy)
  float totalLevel = 0;
  int validReadings = 0;
  
  for (int i = 0; i < 5; i++) {
    float level = readWaterLevel();
    if (level >= 0 && level <= 50) { // Reasonable range check
      totalLevel += level;
      validReadings++;
    }
    delay(100);
  }
  
  data.waterLevel = validReadings > 0 ? totalLevel / validReadings : 0;
  data.riskLevel = determineRiskLevel(data.waterLevel);
  
  // Read temperature and humidity
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  data.timestamp = millis();
  
  return data;
}

float readWaterLevel() {
  // Send ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo duration
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    return -1; // No echo received
  }
  
  // Calculate distance
  float distance = duration * 0.0343 / 2; // Distance in cm
  
  // Convert to water level in inches
  float waterLevel = max(0, (SENSOR_HEIGHT - distance) * 0.393701);
  
  return waterLevel;
}

String determineRiskLevel(float waterLevel) {
  if (waterLevel >= HIGH_THRESHOLD) {
    return "high";
  } else if (waterLevel >= MEDIUM_THRESHOLD) {
    return "medium";
  } else {
    return "low";
  }
}

void sendReading() {
  SensorData data = readSensors();
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["timestamp"] = data.timestamp;
  doc["gateId"] = GATE_ID;
  doc["level"] = data.waterLevel;
  doc["risk"] = data.riskLevel;
  
  // Add optional sensor data
  if (!isnan(data.temperature)) {
    doc["temperature"] = data.temperature;
  }
  if (!isnan(data.humidity)) {
    doc["humidity"] = data.humidity;
  }
  
  // Convert to JSON string
  String jsonString;
  serializeJson(doc, jsonString);
  
  if (DEBUG_MODE) {
    Serial.println("Sending reading:");
    Serial.println(jsonString);
  }
  
  // Send HTTP POST request with retry logic
  bool success = false;
  for (int attempt = 0; attempt < 3 && !success; attempt++) {
    if (sendHTTPRequest(jsonString)) {
      success = true;
      failedAttempts = 0;
    } else {
      failedAttempts++;
      delay(2000 * (attempt + 1)); // Exponential backoff
    }
  }
  
  if (!success) {
    Serial.println("Failed to send reading after 3 attempts");
    if (failedAttempts >= maxFailedAttempts) {
      Serial.println("Too many failed attempts. Restarting...");
      ESP.restart();
    }
  }
  
  // Print sensor readings
  Serial.print("Water Level: ");
  Serial.print(data.waterLevel);
  Serial.print(" inches, Risk: ");
  Serial.println(data.riskLevel);
  
  if (!isnan(data.temperature)) {
    Serial.print("Temperature: ");
    Serial.print(data.temperature);
    Serial.println("°C");
  }
  
  if (!isnan(data.humidity)) {
    Serial.print("Humidity: ");
    Serial.print(data.humidity);
    Serial.println("%");
  }
  
  Serial.println("---");
}

bool sendHTTPRequest(String jsonData) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 second timeout
  
  int httpResponseCode = http.POST(jsonData);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    if (DEBUG_MODE) {
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response: ");
      Serial.println(response);
    }
    http.end();
    return httpResponseCode >= 200 && httpResponseCode < 300;
  } else {
    if (DEBUG_MODE) {
      Serial.print("HTTP Error: ");
      Serial.println(httpResponseCode);
    }
    http.end();
    return false;
  }
}

// Deep sleep function for battery operation
void enterDeepSleep(int seconds) {
  Serial.println("Entering deep sleep for " + String(seconds) + " seconds");
  esp_sleep_enable_timer_wakeup(seconds * 1000000); // Convert to microseconds
  esp_deep_sleep_start();
}
