#include <WiFi.h>
#include <ArduinoOTA.h>

#define I1PWM 0
#define I2PWM 1
#define I3PWM 2
#define I4PWM 3
#include "util.h"
const IPAddress ip(192,168,4,1);
const IPAddress subnet(255, 255, 255, 0);
WiFiServer server(80);

void setup(){
	Serial.begin(115200);
	delay(100);

	// softAP
	WiFi.mode(WIFI_AP_STA);
	WiFi.softAPConfig(ip,ip,subnet);
	WiFi.softAP(ssid,pass);
	IPAddress myIP=WiFi.softAPIP();
	Serial.print("SSID: ");Serial.println(ssid);
	Serial.print("PASS: ");Serial.println(pass);
	Serial.print("APIP: ");Serial.println(myIP);
	server.begin();
	Serial.println("Server start!");
/*PACKAGE BUG? does not work after first OTA
	// OTA	https://web.is.tokushima-u.ac.jp/wp/blog/2018/04/12/esp32-arduino-softapでotaプログラム書き込み/
	ArduinoOTA.setPassword("sazanka_");
	ArduinoOTA
		.onStart([](){Serial.print("Start updating ");Serial.println(ArduinoOTA.getCommand()==U_FLASH?"sketch":"filesystem");})
		.onEnd([](){Serial.println("\nEnd");})
		.onProgress([](unsigned int progress, unsigned int total){Serial.printf("Progress: %u%%\r",(progress/(total/100)));})
		.onError([](ota_error_t error){
			if(error==OTA_AUTH_ERROR)Serial.println("Auth Error");
			else if(error==OTA_BEGIN_ERROR)Serial.println("Begin Error");
			else if(error==OTA_CONNECT_ERROR)Serial.println("Connect Error");
			else if(error==OTA_RECEIVE_ERROR)Serial.println("Receive Error");
			else if(error==OTA_END_ERROR)Serial.println("End Error");
		});
	ArduinoOTA.begin();
*/
	ledcSetup(I1PWM,PWM_FREQ,PWM_BIT);ledcAttachPin(I1,I1PWM);
	ledcSetup(I2PWM,PWM_FREQ,PWM_BIT);ledcAttachPin(I2,I2PWM);
	ledcSetup(I3PWM,PWM_FREQ,PWM_BIT);ledcAttachPin(I3,I3PWM);
	ledcSetup(I4PWM,PWM_FREQ,PWM_BIT);ledcAttachPin(I4,I4PWM);
}

void loop() {
	//ArduinoOTA.handle();

	//http://samuiui.com/2019/06/27/esp32-wroom-32-wifi-でタンクを遠隔操作/
	//http://mukujii.sakura.ne.jp/esp2.html
	WiFiClient client=server.available();
	if(client){
		String currentLine="";
		Serial.println("Client Connected.");
		while(client.connected()){
			if(client.available()){
				char c=client.read();
				Serial.write(c);
				if(c=='\n'){
					if(currentLine.length()==0){
						client.println("HTTP/1.1 200 OK");
						client.println("Content-type:text/html");
						client.println();
						client.print(html);
						client.println();
						break;
					}else{
						currentLine="";
					}
				}else if(c!='\r'){
					currentLine+=c;
				}

				if(currentLine.endsWith("GET /?f_")){
					ledcWrite(I1PWM,0);ledcWrite(I2PWM,PWM_MAX*6/8);
					ledcWrite(I3PWM,0);ledcWrite(I4PWM,PWM_MAX*6/8);
				}
				if(currentLine.endsWith("GET /?fl")){
					ledcWrite(I1PWM,0);ledcWrite(I2PWM,PWM_MAX*4/8);
					ledcWrite(I3PWM,0);ledcWrite(I4PWM,PWM_MAX*6/8);
				}
				if(currentLine.endsWith("GET /?fr")){
					ledcWrite(I1PWM,0);ledcWrite(I2PWM,PWM_MAX*6/8);
					ledcWrite(I3PWM,0);ledcWrite(I4PWM,PWM_MAX*4/8);
				}
				if(currentLine.endsWith("GET /?b_")){
					ledcWrite(I1PWM,PWM_MAX*6/8);ledcWrite(I2PWM,0);
					ledcWrite(I3PWM,PWM_MAX*6/8);ledcWrite(I4PWM,0);
				}
				if(currentLine.endsWith("GET /?bl")){
					ledcWrite(I1PWM,PWM_MAX*4/8);ledcWrite(I2PWM,0);
					ledcWrite(I3PWM,PWM_MAX*6/8);ledcWrite(I4PWM,0);
				}
				if(currentLine.endsWith("GET /?br")){
					ledcWrite(I1PWM,PWM_MAX*6/8);ledcWrite(I2PWM,0);
					ledcWrite(I3PWM,PWM_MAX*4/8);ledcWrite(I4PWM,0);
				}

				if(currentLine.endsWith("GET /?s_")){
					ledcWrite(I1PWM,0);ledcWrite(I2PWM,0);
					ledcWrite(I3PWM,0);ledcWrite(I4PWM,0);
				}
			}
		}
		client.stop();
		Serial.println("Client Disconnected.");
	}
}
