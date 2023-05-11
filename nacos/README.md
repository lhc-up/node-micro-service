# [NacosV2.2.2](https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html)

参考官方文档准备环境，下载编译后的压缩包并解压到当前目录。

## 增加鉴权（非Docker环境）

- Nacos是一个内部微服务组件，需要在可信的内部网络中运行，不可暴露在公网环境，防止带来安全风险。
- Nacos提供简单的鉴权实现，为防止业务错用的弱鉴权体系，不是防止恶意攻击的强鉴权体系。
- 如果运行在不可信的网络环境或者有强鉴权诉求，请参考官方简单实现做进行[自定义插件开发](https://nacos.io/zh-cn/docs/v2/plugin/auth-plugin.html)。

按照官方文档配置启动，默认是不需要登录的，这样会导致配置中心对外直接暴露。而启用鉴权之后，需要在使用用户名和密码登录之后，才能正常使用nacos。建议无论nacos是否暴露在公网，都要开启鉴权，当然部署在内网更好。  

设置一个不低于32字符的秘钥，如`1234567890abcdefghijklmnopqrstuvwxyz`，并转为Base64编码：`MTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6`，
打开`nacos/conf/application.properties`配置文件：

- `nacos.core.auth.enabled=true`
- `nacos.core.auth.system.type=nacos`
- `nacos.core.auth.plugin.nacos.token.secret.key`设置为上面的Base64编码
- `nacos.core.auth.server.identity.key=serverIdentity`
- `nacos.core.auth.server.identity.value=security`

## 启动

- `cd nacos/bin`
- Linux/Unix/Mac: `sh startup.sh -m standalone`
- Windows: `startup.cmd -m standalone`
- 访问<http://127.0.0.1:8848/nacos/#/login>，账号密码默认为：nacos/nacos
