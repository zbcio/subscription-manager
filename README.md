# SubsTracker - 订阅管理与提醒系统

基于Cloudflare Workers的轻量级订阅管理系统，帮助您轻松跟踪各类订阅服务的到期时间，并通过Telegram发送及时提醒。

![image-20250430101010506](https://img1.wangwangit.com/wangwangit/image/refs/heads/master/img1/image-20250430101010506.png)

## ✨ 特性

- 🔔 **自动提醒**: 在订阅到期前自动发送Telegram通知
- 📊 **订阅管理**: 直观的Web界面管理所有订阅
- 🔄 **周期计算**: 智能计算循环订阅的下一个周期
- 📱 **响应式设计**: 完美适配移动端和桌面设备
- ☁️ **免服务器**: 基于Cloudflare Workers，无需自建服务器
- 🔒 **安全可靠**: 数据存储在Cloudflare KV中，安全且高效

## 🚀 部署指南

### 前提条件

- Cloudflare账户
- Telegram Bot (用于发送通知)

### 部署步骤

1.登陆cloudflare,创建worker,粘贴本项目中的js代码,点击部署

![image-20250430100434263](https://img1.wangwangit.com/wangwangit/image/refs/heads/master/img1/image-20250430100434263.png)

2.创建KV键值 **SUBSCRIPTIONS_KV**

![image-20250430100633260](https://img1.wangwangit.com/wangwangit/image/refs/heads/master/img1/image-20250430100633260.png)

3.给worker绑定上键值对,以及设置定时执行时间!

![image-20250430100751707](https://img1.wangwangit.com/wangwangit/image/refs/heads/master/img1/image-20250430100751707.png)

4.打开worker提供的域名地址,输入默认账号密码: admin  password

![image-20250430100836404](https://img1.wangwangit.com/wangwangit/image/refs/heads/master/img1/image-20250430100836404.png)

5.前往系统配置,修改账号密码,以及配置tg通知的信息

![image-20250430100913940](https://img1.wangwangit.com/wangwangit/image/refs/heads/master/img1/image-20250430100913940.png)

6.配置完成可以点击测试通知,查看是否能够正常通知,然后就可以正常添加订阅使用了!

![image-20250430101010506](https://img1.wangwangit.com/wangwangit/image/refs/heads/master/img1/image-20250430101010506.png)



## 🤝 贡献

欢迎贡献代码、报告问题或提出新功能建议!

## 📜 许可证

MIT License

