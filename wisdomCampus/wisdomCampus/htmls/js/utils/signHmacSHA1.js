//将发送请求时的参数，进行签名


var signHmacSHA1=(function(mod){
	mod.sign=function(message,value,callback){
		console.log('dddddddd');
			require.config({
				baseUrl:"",
				waitSeconds:5,
				paths:{
					'crypto-js':"../js/lib/crypto-js/crypto-js"
				}
			});
			var encrypted='';
			require(['crypto-js'], function (CryptoJS) {
				console.log('ssssssssss');
				encrypted=CryptoJS.HmacSHA1(message,value).toString(CryptoJS.enc.Base64);
				callback(encrypted);
			});
	};
	return mod;
})(signHmacSHA1||{})