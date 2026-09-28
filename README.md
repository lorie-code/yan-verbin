# YAN VERBIN × WEEX 独立站

英文／俄语双语静态网站，默认显示俄语，可切换英文，并记住用户手动选择的语言。黑色界面搭配金色按钮、WEEX 标识和品牌细节，支持手机适配、交易方法交互和 WEEX 专属活动跳转。无需安装依赖或执行构建。

## 预览

当前电脑的本地预览：[打开网站](http://127.0.0.1:4173/yan-verbin/)。该地址仅在当前电脑的预览服务运行时可用，不能作为对外分享链接。

## 上传到 GitHub Pages

1. 新建或打开用于此网站的 GitHub 仓库，点击 **Add file → Upload files**。
2. 上传本文件夹内的全部文件和 `assets` 文件夹。确保仓库根目录直接能看到 `index.html`、`styles.css`、`app.js`、`config.js`、`translations.js` 和 `assets`，不要再套一层 `yan-verbin` 文件夹。`index.html` 在文件列表中的排序不影响使用。
3. 点击 **Commit changes** 保存。
4. 打开 **Settings → Pages**，在 **Build and deployment** 中选择 **Deploy from a branch**，分支选择 `main`，目录选择 **/ (root)**，点击 **Save**。
5. 等待部署完成，使用 Pages 页面显示的网址预览和分享。

上传时保留文件名与目录结构。不要只上传 `index.html`，也不要直接上传 ZIP 压缩包。

## 修改内容

- `config.js`：`defaultLanguage` 为首次访问的默认语言，当前为 `ru`；也可修改 Telegram 社群、官方咨询、WEEX 活动和注册链接。同步修改 `index.html` 中对应的默认链接，以保留无 JavaScript 时的跳转能力。
- `translations.js`：修改 `en` 和 `ru` 中对应的英文／俄语文案。保持两种语言的键名一致；俄语默认内容也保存在 `index.html` 中。手动切换的语言会以 `yan-verbin-language-preference` 为键保存在浏览器中。
- `styles.css`：修改样式与响应式布局。
- `assets/yan-verbin.jpg`：品牌图片；替换时保持文件名即可。

## 活动与服务说明

WEEX 活动于 **2026 年 9 月 28 日**核对，官方宣传为新用户最高 **10,000 USDT** 奖励。页面展示部分任务，并区分优惠券、体验金和仓位空投；实际资格、任务条件与奖励以 WEEX 活动页为准。核对来源及任务记录见 `assets/sources.json`。

当前未提供 VIP 和个人指导的价格或付款链接，因此相关按钮跳转到 Telegram 社群公开资料中列出的官方咨询入口，方便用户先确认服务与加入条件。

问卷中期望的 `weex.com/yanverbin` 地址需要 **WEEX 域名所有者**配置，不能通过上传 GitHub Pages 自动获得。本文件夹交付的是网站代码，尚未绑定该地址。
