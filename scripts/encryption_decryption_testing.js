var CryptoJS = require("crypto-js");
 
var secret = "My Secret Passphrase";
var data = JSON.stringify({ "temperature": "24.0", "humidity": "47.0", "time": "2022-02-08T17:06:40.410Z" });
 
var encrypted = CryptoJS.AES.encrypt(data, secret, { mode: CryptoJS.mode.ECB });
console.log("Encrypted data: " + encrypted.toString());
 
var decrypted = CryptoJS.AES.decrypt(encrypted, secret, { mode: CryptoJS.mode.ECB });
 
console.log("Decrypted data: " + decrypted.toString(CryptoJS.enc.Utf8));
