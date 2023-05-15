# koa-server

## 安装依赖

``` bash
npm install
```

## 本地调试

```bash
npm run dev

# 新开命令行
npm run serve
# 或使用vscode的debug工具启动
```

**修改源码后，`rollup`会实时编译，`nodemon`会对服务进行热更新。**

## 打包

1. 在`src/config/application.yml`中修改`active`为对应的环境
2. 运行`npm install`、`npm run build`命令，得到`koa-server.tgz`

## 部署

### 直接在服务器部署

1. 把`koa-server.tgz`和`scripts/shell/restart.sh`上传至服务器同一目录
2. 执行`bash restart.sh`命令

### Jenkins流水线

#### 待完善

### 容器部署

### 待完善
