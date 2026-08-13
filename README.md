# SceneWeaver Studio

一个可点击的 AI 动画创作工作台原型：剧本、资产和导演镜头共用同一份浏览器本地项目数据。Agent 面板目前使用模拟服务，未来应由服务端持有模型密钥并返回结构化项目补丁。

## 运行

```powershell
npm.cmd install
npm.cmd run dev
```

浏览器数据保存在 `localStorage`；界面右上角可恢复示例项目。生产验证使用 `npm.cmd run build`。
