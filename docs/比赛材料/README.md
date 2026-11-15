# 比赛材料说明

本目录包含《新源村情通-作品说明》的 DOCX 与 PDF 版本，以及生成脚本。

## 需要你补充的 3 件事

1. **封面信息**：参赛团队、所在学校、团队成员、指导教师（当前为下划线占位）。
2. **功能截图**：第五章 5.1 有 11 个「截图位」，在微信开发者工具/真机上截图后替换占位框（建议宽 16cm）。
3. **演示视频**：按附录 B 的 3 分钟脚本录制，MP4，命名 `新源村情通-演示视频.mp4`。

## 修改方式

- 直接在 Word 里改 DOCX 即可；如需重新生成，修改 `../build_doc.py` 后运行：
  ```powershell
  & "C:\Users\zero\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe" build_doc.py
  ```
- 目录是 Word 自动生成域：改完正文后右键目录 → 更新域 → 更新整个目录，再导出 PDF。

## 重新生成（目录 + PDF）

```powershell
python build_doc.py                 # 生成带 [[TOC]] 占位的 DOCX
powershell -File postprocess.ps1    # 用 Word 生成真目录并导出 PDF
```

> `postprocess.ps1` 需要本机安装 Microsoft Word；它会替换占位符、生成目录、保存 DOCX 并导出 PDF。

## 打包

ZIP 命名：`第九届传智杯-AI小程序赛道-新源村情通.zip`
包含：`cilent/`、`backend/`、`db/`、`temp/`、本说明 DOCX/PDF、演示视频。
排除：`backend/target`、`node_modules`、`*.log`、`backend/data/upload`。
