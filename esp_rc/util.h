const char ssid[]="esp_rc_proto";
const char pass[]="sazanka_";
const char html[]=
"<!DOCTYPE html>\
<html lang='ja'>\
<head>\
	<meta charset='UTF-8'>\
	<title>esp_rc_proto</title>\
	<meta name='viewport' content='width=device-width,initial-scale=1'>\
</head>\
<body>\
	<style>\
		:root{background-color:#222;}\
		form{text-align:center;}\
		input{font-size:xx-large;margin:16px;}\
	</style>\
	<form method='get'>\
		<input type='submit' name='fl' value='左前'>\
		<input type='submit' name='f_' value='前'>\
		<input type='submit' name='fr' value='右前'><br>\
		<input type='submit' name='s_' value='停止'><br>\
		<input type='submit' name='bl' value='左後'>\
		<input type='submit' name='b_' value='後'>\
		<input type='submit' name='br' value='右後'>\
	</form>\
</body>\
</html>";

#define I1 18
#define I2 19
#define I3 17
#define I4 16

#define PWM_FREQ 1000.0
#define PWM_BIT 8
#define PWM_MAX 256
//PWM_MAX=2^PWM_BIT
//2^16=65536
