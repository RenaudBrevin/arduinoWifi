#include <BleGamepad.h>

const int buttonPin = 4;    // Pin où le bouton est connecté
const int potentiometerPin = 34; // Pin où le potentiomètre est connecté
BleGamepad bleGamepad("Manette", "Arduino", 100); // Renomme l'appareil Bluetooth

int lastPotentiometerValue = 0;  // Variable pour stocker la dernière valeur envoyée
const int threshold = 50;        // Seuil de différence pour envoyer la nouvelle valeur

void setup() {
  // Configuration du bouton comme entrée
  pinMode(buttonPin, INPUT_PULLUP);  // Utilisation de INPUT_PULLUP pour éviter un bouton flottant
  
  // Initialisation du BLE Gamepad
  bleGamepad.begin();
}

void loop() {
  // Lecture de l'état du bouton
  int buttonState = digitalRead(buttonPin);
  
  // Vérification si le bouton est appuyé (état LOW, car INPUT_PULLUP signifie que l'état par défaut est HIGH)
  if (buttonState == LOW) {
    if (bleGamepad.isConnected()) {
      // Envoyer la commande de "jump" (par exemple, en appuyant sur un bouton spécifique)
      bleGamepad.press(BUTTON_1);
      delay(100);  // Petit délai pour simuler un appui
      bleGamepad.release(BUTTON_1);
    }
    
    // Attendre que le bouton soit relâché pour éviter des multiples envois pour un seul appui
    while (digitalRead(buttonPin) == LOW) {
      delay(100);  // Petit délai pour la détection de rebond
    }
  }

  // Lecture de la valeur du potentiomètre
  int potentiometerValue = analogRead(potentiometerPin);
  
  // Vérification de la différence avec la dernière valeur envoyée
  if (abs(potentiometerValue - lastPotentiometerValue) > threshold) {
    if (bleGamepad.isConnected()) {
      // Map la valeur du potentiomètre (0-4095) à la plage de valeurs des axes (-32768 à 32767)
      //int sendValue = map(potentiometerValue, 0, 4095, -32768, 32767);
      bleGamepad.setX(potentiometerValue); // Mettre à jour l'axe X du joystick
      bleGamepad.sendReport();
      
      // Mise à jour de la dernière valeur envoyée
      lastPotentiometerValue = potentiometerValue;
    }
  }
  
  delay(10); // Petit délai pour éviter une boucle trop rapide
}
