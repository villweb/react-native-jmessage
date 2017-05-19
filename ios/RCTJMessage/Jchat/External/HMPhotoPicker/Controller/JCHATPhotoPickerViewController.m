//
//  HMPhotoPickerViewController.m
//  HMPhotoPickerDemo
//
//  Created by HuminiOS on 15/11/16.
//  Copyright © 2015年 HuminiOS. All rights reserved.
//

#import "JCHATPhotoPickerViewController.h"
#import "JCHATAlbumViewController.h"

@interface JCHATPhotoPickerViewController ()
@property(strong, nonatomic)JCHATAlbumViewController *albumVC;
@end

@implementation JCHATPhotoPickerViewController
- (instancetype)init
{
    NSBundle *bundle = [NSBundle bundleWithURL:[[NSBundle mainBundle] URLForResource:@"RCTJMessageBundle" withExtension:@"bundle"]];
    //    NSArray *nibs =  [bundle loadNibNamed:@"JCHATConversationViewController" owner:nil options:nil];
    self = [super initWithNibName:@"JCHATPhotoPickerViewController" bundle:bundle];
    if (self) {
        
    }
    return self;
}
- (void)viewDidLoad {
  [super viewDidLoad];
  self.navigationController.navigationBar.translucent = NO;
  _albumVC = [[JCHATAlbumViewController alloc] init];
  _albumVC.photoDelegate = _photoDelegate;
  [self pushViewController:_albumVC animated:NO];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
}

@end
