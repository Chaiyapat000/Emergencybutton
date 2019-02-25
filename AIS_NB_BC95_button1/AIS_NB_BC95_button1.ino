#include "AIS_NB_BC95.h"

const int button=2;
const int led=7;
String apnName = "devkit.nb";

String serverIP = "35.198.196.233"; // Your Server IP
String serverPort = "41235"; // Your Server Port

String udpData = "HelloWorld";

AIS_NB_BC95 AISnb;

const long interval = 5000;  //millisecond
unsigned long previousMillis = 0;
long ID=0;
long cnt = 0;
String test_mass="button1";
int value=0;
int buttonstate =0;

void setup()
{ 
  AISnb.debug = true;
  
  Serial.begin(9600);
  pinMode(button,INPUT);
  pinMode(led,OUTPUT);
  AISnb.setupDevice(serverPort);

  String ip1 = AISnb.getDeviceIP();  
  delay(1000);
  
  pingRESP pingR = AISnb.pingIP(serverIP);
  previousMillis = millis();

}
void loop()
{ 
  digitalWrite(led,HIGH);
  delay(200);
  unsigned long currentMillis = millis();
  buttonstate=digitalRead(button);
  //Serial.println("---startbuttonstate");
  //Serial.println(buttonstate);
  //Serial.println("---endbuttonstate");
   
  if(buttonstate==HIGH)
    { 
      
      value=1; 
      digitalWrite(led,LOW);    
      //Send data in HexString     
      //udpDataHEX = AISnb.str2HexStr(udpData);
      //UDPSend udp = AISnb.sendUDPmsg(serverIP, serverPort, udpDataHEX);
      //previousMillis = currentMillis;
      String test_massage="{\"ID\":\""+String(test_mass)+"\",\"data\":\""+String(value)+"\"}";
     
      // Send data in String 
      UDPSend udp = AISnb.sendUDPmsgStr(serverIP, serverPort, test_massage);
      UDPReceive resp = AISnb.waitResponse();
  
    }else
    {
      Serial.println("-----downstate----");
      value=0;
    } 
    //UDPReceive resp = AISnb.waitResponse();
    
}
