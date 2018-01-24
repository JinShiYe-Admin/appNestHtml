//
//  ViewController.h
//  wisdomCampus
//
//  Created by Zqw on 2018/1/23.
//  Copyright © 2018年 JSY. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

@interface ViewController : UIViewController<WKUIDelegate,WKScriptMessageHandler,WKNavigationDelegate>

@property (strong, nonatomic) WKWebView *webView;


@end

