/*
 * ESP32 Flood Detection System - Firebase Version
 * Sends water level readings directly to Firebase Realtime Database
 * 
 * Hardware Requirements:
 * - ESP32 Dev Board
 * - Ultrasonic Sensor (HC-SR04) for water level detection
 * - Optional: DHT22 for temperature/humidity
 * 
 * Connections:
 * - HC-SR04 VCC -> 3.3V
 * - HC-SR04 GND -> GND
 * - HC-SR04 Trig -> GPIO 5
 * - HC-SR04 Echo -> GPIO 18
 * - DHT22 VCC -> 3.3V
 * - DHT22 GND -> GND
 * - DHT22 Data -> GPIO 4
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Firebase Configuration
const char* firebaseUrl = "https://bahaba-a4a2e-default-rtdb.firebaseio.com/readings.json";
const char* gateId = "north"; // Change to "south" or "east" for different gates

// Hardware Configuration
#define TRIG_PIN 5
#define ECHO_PIN 18
#define DHT_PIN 4
#define DHT_TYPE DHT22

// Sensor objects
DHT dht(DHT_PIN, DHT_TYPE);

// Timing
unsigned long lastReading = 0;
const unsigned long readingInterval = 30000; // Send reading every 30 seconds

// Water level thresholds (in inches)
const float LOW_THRESHOLD = 8.0;
const float MEDIUM_THRESHOLD = 13.0;
const float HIGH_THRESHOLD = 20.0;

void setup() {
  Serial.begin(115200);
  
  // Initialize sensors
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  dht.begin();
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("ESP32 Flood Detection System - Firebase Version");
  Serial.println("Firebase URL: " + String(firebaseUrl));
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
    return;
  }
  
  // Check if it's time for a new reading
  if (millis() - lastReading >= readingInterval) {
    sendReadingToFirebase();
    lastReading = millis();
  }
  
  delay(1000); // Small delay to prevent overwhelming the system
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Connected to WiFi. IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("Failed to connect to WiFi");
  }
}

float readWaterLevel() {
  // Send ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo duration
  long duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calculate distance (speed of sound = 343 m/s)
  float distance = duration * 0.0343 / 2; // Distance in cm
  
  // Convert to water level in inches
  // Assuming sensor is mounted 30cm above water surface
  float waterLevel = max(0, (30.0 - distance) * 0.393701); // Convert cm to inches
  
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

void sendReadingToFirebase() {
  // Read water level
  float waterLevel = readWaterLevel();
  String riskLevel = determineRiskLevel(waterLevel);
  
  // Read temperature and humidity (optional)
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Create JSON payload for Firebase
  DynamicJsonDocument doc(1024);
  doc["timestamp"] = millis(); // You might want to use actual timestamp
  doc["gateId"] = gateId;
  doc["level"] = waterLevel;
  doc["risk"] = riskLevel;
  
  // Add optional sensor data
  if (!isnan(temperature)) {
    doc["temperature"] = temperature;
  }
  if (!isnan(humidity)) {
    doc["humidity"] = humidity;
  }
  
  // Convert to JSON string
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Sending reading to Firebase:");
  Serial.println(jsonString);
  
  // Send HTTP POST request to Firebase
  HTTPClient http;
  http.begin(firebaseUrl);
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Firebase Response Code: ");
    Serial.println(httpResponseCode);
    Serial.print("Response: ");
    Serial.println(response);
  } else {
    Serial.print("Firebase HTTP Error: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
  
  // Print sensor readings
  Serial.print("Water Level: ");
  Serial.print(waterLevel);
  Serial.print(" inches, Risk: ");
  Serial.println(riskLevel);
  
  if (!isnan(temperature)) {
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println("°C");
  }
  
  if (!isnan(humidity)) {
    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println("%");
  }
  
  Serial.println("---");
}
