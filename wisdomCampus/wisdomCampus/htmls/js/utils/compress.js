var compress = (function(mod) {
	mod.uploadImg = function(file, maxSize, callback) {
		maxSize = maxSize * 1024 * 1024;
		console.log("要处理的图片地址：" + file.name);
		mod.getFileReader(file, maxSize, callback);
	}
	mod.getFileReader = function(file, maxSize, callback) {
		var reader = new FileReader();
		reader.onload = function() {
			var result = this.result;
			var formData = new FormData();
			mod.getImgInfo(result, function(img, imgInfo) {
				console.log("获取的文件信息：" + JSON.stringify(imgInfo));
				console.log("原图尺寸：" + result.length);
				if(result.length > maxSize) {
					var newDataUrl = mod.getCanvasDataUrl(img, mod.getSuitableSize(imgInfo, Math.ceil(result.length / maxSize)));
					var blob = mod.base64ToBlob(newDataUrl, 'image/jpeg');
					console.log("blob.type:" + blob.type);
					console.log('要传递的文件大小：' + blob.size);
					//					var newFile = new File([blob], Date.now() + '.png');
					formData.append('image', blob, Date.now() + '.png');
				} else {
					formData.append('image', file);
				}
				mod.postFile(formData, callback);
			})
		}
		reader.readAsDataURL(file);
	}
	mod.getSquareFile = function(file, width, callback) {
		var reader = new FileReader();
		reader.onload = function() {
			var result = this.result;
			var formData = new FormData();
			mod.getImgInfo(result, function(img, imgInfo) {
				console.log("获取的文件信息：" + JSON.stringify(imgInfo));
				console.log("原图尺寸：" + result.length);
				var newDataUrl = mod.getSquareCanvasUrl(img, mod.getSquareImageSize(imgInfo, width));
				var blob = mod.base64ToBlob(newDataUrl, 'image/jpeg');
				console.log("blob.type:" + blob.type);
				console.log('要传递的文件大小：' + blob.size);
				callback(blob);
			})
		}
		reader.readAsDataURL(file);
	}
	/**
	 * 获取方形图片的裁剪大小
	 * @param {Object} imgInfo
	 * @param {Object} width
	 */
	mod.getSquareImageSize = function(imgInfo, width) {
		console.log("*****裁剪成方形：getSquareImage*****");
		var squreInfo = {};
		if(imgInfo.width >= imgInfo.height) {
			squreInfo.direction = 0; //0 为左右裁剪
		} else {
			squreInfo.direction = 1; //上下裁剪
		}
		squreInfo.distance = Math.abs(squreInfo.width - squreInfo.height) / 2;
		squreInfo.sideLength = width;
		return squreInfo; //获取方形图片的信息
	}

	mod.getSquareCanvasUrl = function(img, squareInfo) {
		console.log("*****重绘图片的宽高******");
		console.log("orientation:" + orientation);
		var imageType = 'image/jpeg',
			imageArgu = 0.7;
		var canvas = document.createElement('canvas');
		canvas.width = squareInfo.sideLength;
		canvas.height = suitableSize.sideLength;
		var ctx = canvas.getContext('2d');
		var drawLeft = 0,
			drawRight = 0;
		if(squareInfo.direction === 0) {
			drawLeft = -squareInfo.distance;
		} else {
			drawRight = -squareInfo.distance;
		}
		ctx.drawImage(img, drawLeft, drawRight, suitableSize.width, suitableSize.height);
		return canvas.toDataURL(imageType, imageArgu);
	}
	mod.postFile = function(formData, callback) {
		console.log("开始上传");
		//		console.log("url="+consts.UPLOADURL+"data="+formData);
		jQuery.ajax({
				url: consts.UPLOADURL,
				type: "POST",
				cache: false,
				contentType: false,
				processData: false,
				data: formData,
				dataType: 'json',
				success: function(response) {
					console.log("上传文件获取的回调：" + JSON.stringify(response));
					callback(response);
				},
				error: function(errRes) {
					callback(errRes);
					console.log("发生未知错误：" + JSON.stringify(errRes));
					console.log(errRes);
				}
			})
			.done(function(e) {
				console.log("已完成")
				console.log(e);
				console.log(JSON.stringify(e.message));
			})
			.fail(function() {
				console.log("failed!");
			})
			.always(function() {
				console.log("complete!");
			});
	}

	/**
	 * 生成一张图片
	 * @param {Object} img 原始图片元素
	 * @param {Object} suitableSize 压缩的配置
	 * @param {Object} orientation 旋转角度 -1
	 */
	mod.getCanvasDataUrl = function(img, suitableSize, orientation) {
		console.log("*****重绘图片的宽高******");
		console.log("orientation:" + orientation);
		var imageType = 'image/jpeg',
			imageArgu = 0.7;
		var canvas = document.createElement('canvas');
		canvas.width = suitableSize.width;
		canvas.height = suitableSize.height;
		var ctx = canvas.getContext('2d');
		switch(orientation) {
			case 6: //需要顺时针（向左）90度旋转
				canvas.width = suitableSize.height;
				canvas.height = suitableSize.width;
				ctx.translate(suitableSize.height, 0);
				ctx.rotate(90 * Math.PI / 180);
				ctx.drawImage(img, 0, 0, suitableSize.width, suitableSize.height);
				break;
			case 8: //需要逆时针（向右）90度旋转
				canvas.width = suitableSize.height;
				canvas.height = suitableSize.width;
				ctx.translate(0, suitableSize.width);
				ctx.rotate(-90 * Math.PI / 180);
				ctx.drawImage(img, 0, 0, suitableSize.width, suitableSize.height);
				break;
			case 3: //需要180度旋转
				ctx.translate(suitableSize.width, suitableSize.height);
				ctx.rotate(-180 * Math.PI / 180);
				ctx.drawImage(img, 0, 0, suitableSize.width, suitableSize.height);
				break;
			case -1: //居中裁剪成方形

				break;
			default:
				ctx.drawImage(img, 0, 0, suitableSize.width, suitableSize.height);
				break;
		}

		return canvas.toDataURL(imageType, imageArgu);
	}
	mod.getSuitableSize = function(imgInfo, multi) {
		imgInfo.width = imgInfo.width / multi;
		imgInfo.height = imgInfo.height / multi;
		console.log("获取的图片要裁剪的尺寸：" + JSON.stringify(imgInfo));
		return imgInfo;
	}
	mod.getImgInfo = function(result, callback) {
		var img = new Image();
		var imgInfo = {};
		img.onload = function() {
			console.log(img);
			imgInfo.width = img.naturalWidth;
			imgInfo.height = img.naturalHeight;
			console.log("获取的图片宽高：" + JSON.stringify(imgInfo));
			callback(img, imgInfo);
		}
		img.src = result;
	}

	mod.base64ToBlob = function(base64Url, mime) {
		var base64 = base64Url.replace(/^data:image\/(png|jpeg);base64,/, "");
		//		console.log("处理后的database64:" + base64);
		var sliceSize = 1024;
		var byteChars = window.atob(base64);
		var byteArrays = [];

		for(var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
			var slice = byteChars.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);
			for(var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
			var byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}
		console.log("文件类型：" + mime);
		return new Blob(byteArrays, {
			type: mime
		});
	}
	return mod;
})(compress || {});