//
//document.write('<script src="../js/lib/RSA/Barrett.js"><\/script>');
//document.write('<script src="../js/lib/RSA/BigInt.js"><\/script>');
//document.write('<script src="../js/lib/RSA/RSA.js"><\/script>');
//document.write('<script src="../js/utils/RSAEncrypt.js"><\/script>');
//document.write('<script src="../js/lib/crypto-js/require.js"><\/script>');
//document.write('<script src="../js/utils/signHmacSHA1.js"><\/script>');
//document.write('<script src="../js/lib/jquery.js"><\/script>');
//document.write('<script src="../js/utils/sortSign.js"><\/script>');
//document.write('<script src="../js/utils/myStorage.js"><\/script>');
//document.write('<script src="../js/utils/storageKeyName.js"><\/script>');

function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return(c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};

//url,
//encryData,需要加密的字段
//commonData,不需要加密的对象
//flag,0表示不需要合并共用数据，1为添加uuid、utid、token、appid普通参数，2为uuid、appid、token
//callback,返回值
var postDataEncry = function(url, encryData, commonData, flag, callback) {
	var tempUrl = 'https://jsypay.jiaobaowang.net/useradminwebapi/api/data/';
	url = tempUrl + url;
	console.log('url:', url);
	//拼接登录需要的签名
	var signTemp = postDataEncry1(encryData, commonData, flag);
	console.log('signTemp000:' + signTemp);
	//生成签名，返回值sign则为签名
	signHmacSHA1.sign(signTemp, 'jsy309', function(sign) {
		//组装发送握手协议需要的data
		//合并对象
		var tempData = $.extend(encryData, commonData);
		//添加签名
		tempData.sign = sign;
		// 等待的对话框
		var urlArr = url.split('/');
		console.log('传递的参数' + urlArr[urlArr.length - 1] + ':', JSON.stringify(tempData));
		jQAjaxPost(url, JSON.stringify(tempData), callback);
	});
}

//拼接参数
var postDataEncry1 = function(encryData, commonData, flag) {
	//循环
	var tempStr = '';
	for(var tempData in encryData) {
		//对value进行加密
		var encryptStr = RSAEncrypt.enctype(encryData[tempData]);
		//修改值
		encryData[tempData] = encryptStr;
	}
	//判断是否需要添加共用数据
	if(flag == 1) {

	} else if(flag == 2) {

	} else if(flag == 3) {

	}
	//将对象转为数组
	var arr0 = [];
	for(var item in encryData) {
		arr0.push(item + '=' + encryData[item]);
	};
	var arr1 = [];
	for(var item in commonData) {
		arr1.push(item + '=' + commonData[item]);
	};
	//合并数组
	var signArr = arr0.concat(arr1);
	//拼接登录需要的签名
	var signTemp = signArr.sort().join('&');
	return signTemp;
}

/**
 * 发送 XMLHttpRequest post 的请求
 * @param {Object} url 路径
 * @param {Object} data 数据
 * @param {Object} callback 回调
 */
var xhrPost = function(url, commonData, callback) {
	console.log('XHRP-Url:', url);
	console.log('XHRP-Data:', commonData);
	//拼接登录需要的签名
	var signTemp = postDataEncry1({}, commonData, 0);
	console.log('signTemp000:' + signTemp);
	//生成签名，返回值sign则为签名
	signHmacSHA1.sign(signTemp, 'jsy309', function(sign) {
		//组装发送握手协议需要的data
		//合并对象
		var tempData = $.extend({}, commonData);
		//添加签名
		tempData.sign = sign;
		// 等待的对话框
		//		var urlArr = url.split('/');
		//		console.log('传递的参数' + urlArr[urlArr.length - 1] + ':', JSON.stringify(tempData));
		//		jQAjaxPost(url, JSON.stringify(tempData), callback);

		var xhr = new XMLHttpRequest();
		xhr.open("post", url, true);
		xhr.timeout = 30000; //10秒超时
		xhr.contentType = 'application/json;';
		xhr.onload = function(e) {
			console.log("XHRP:onload:", JSON.stringify(e));
			console.log('this.readyState:', this.readyState);
			console.log('this.status', this.status);
			if(this.readyState === 4 && this.status === 200) {
				var success_data = JSON.parse(this.responseText);
				console.log('XHRP-Success:', JSON.stringify(success_data));
				if(success_data.RspCode == 0013) {
					callback({
						RspCode: 404,
						RspData: null,
						RspTxt: "用户没有登录或超时,关闭当前页,重新从企业管理端登录."
					});
				} else {
					callback(success_data);
				}
			} else {
				callback({
					RspCode: 404,
					RspData: null,
					RspTxt: "网络连接失败,请重新尝试一下"
				});
			}
		}
		xhr.ontimeout = function(e) {
			console.log("XHRP:ontimeout222:", e);
			callback({
				RspCode: 404,
				RspData: null,
				RspTxt: "网络连接失败,请重新尝试一下"
			});
		};
		xhr.onerror = function(e) {
			console.log("XHRP:onerror111:", e);
			callback({
				RspCode: 404,
				RspData: null,
				RspTxt: "网络连接失败,请重新尝试一下"
			});
		};
		xhr.send(tempData);
	});
}

var jQAjaxPost = function(url, data, callback) {
	console.log('jQAP-Url:', url);
	console.log('jQAP-Data:', data);
	jQuery.ajax({
		url: url,
		type: "POST",
		data: data,
		timeout: 30000,
		dataType: "json",
		contentType: "application/json",
		async: true,
		success: function(success_data) { //请求成功的回调
			console.log('jQAP-Success:', success_data);
			callback(success_data);
		},
		error: function(xhr, type, errorThrown) {
			console.log('jQAP-Error777:', xhr, type);
			callback({
				RspCode: 404,
				RspData: null,
				RspTxt: "网络连接失败,请重新尝试一下"
			});
		}
	});
}

//智慧校园协议
var tempAttendUrl = 'https://jbyj.jiaobaowang.net/SchoolOAService/notice/';
var tempAttendUrl1 = 'https://jbyj.jiaobaowang.net/SchoolOAService/approve/';

//合并参数
var extendParameter = function(data0) {
	var tempData = {
		uuid: storageKeyName.UUID,
		appid: storageKeyName.APPID,
		token: storageKeyName.TOKEN,
	}
	return $.extend(data0, tempData);
}

//10.获取发送的通知公告列表
var getSendNoticePro = function(data0, callback) {
	data0 = extendParameter(data0);
	xhrPost(tempAttendUrl + 'getSendNotice', JSON.stringify(data0), callback);
}

//11.获取收到的通知公告列表（接收人为单人）
var getReceiveNoticePro = function(data0, callback) {
	data0 = extendParameter(data0);
	xhrPost(tempAttendUrl + 'getReceiveNotice', JSON.stringify(data0), callback);
}

//12.通过ID获取通知公告
var getNoticeByIdPro = function(data0, callback) {
	data0 = extendParameter(data0);
	xhrPost(tempAttendUrl + 'getNoticeById', JSON.stringify(data0), callback);
}

//16.审批事务及文件申请
var setAffairApprovePro = function(data0, callback) {
	data0 = extendParameter(data0);
	xhrPost(tempAttendUrl1 + 'setAffairApprove', JSON.stringify(data0), callback);
}

//17.获取事务及文件申请列表
var getAffairApplyPro = function(data0, callback) {
	data0 = extendParameter(data0);
	xhrPost(tempAttendUrl1 + 'getAffairApply', JSON.stringify(data0), callback);
}

//18.获取事务及文件审批列表（审批人为单人）
var getAffairApprovePro = function(data0, callback) {
	data0 = extendParameter(data0);
	xhrPost(tempAttendUrl1 + 'getAffairApprove', JSON.stringify(data0), callback);
}

//19.通过ID获取事务及文件申请
var getAffairApplyByIdPro = function(data0, callback) {
	data0 = extendParameter(data0);
	xhrPost(tempAttendUrl1 + 'getAffairApplyById', JSON.stringify(data0), callback);
}
var getAffairApproveByIdPro = function(data0, callback) {
	data0 = extendParameter(data0);
	xhrPost(tempAttendUrl1 + 'getAffairApproveById', JSON.stringify(data0), callback)
}