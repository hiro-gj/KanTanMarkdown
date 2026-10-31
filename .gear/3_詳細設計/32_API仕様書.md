# API仕様書

## 内部関数契約
提供するHTTP・REST・認証APIはない。以下はsrc/js/kantanMarkdown.js等のブラウザ内関数。

| 関数 / イベント | 入力 | 出力・副作用 |
| --- | --- | --- |
| toKantanEditor(editor) | textarea | キー・履歴イベント登録 |
| queuePreview() / doPreview() | DOMの原稿と設定 | 300ms後予約 / 即描画。prepreview・previewedイベント発火 |
| GithubAlerts.render(container) | DOM | blockquoteを変換 |
| addAttachFileElement(fileName,content,layerContent,trimInfo,insertImgTag) | 名前・Data URL・レイヤー・矩形JSON文字列・挿入フラグ | 添付li追加、重複名回避 |
| showImportDialog(message,callback) | 説明・関数 | OKは{result:true,attach:boolean,markdown:boolean,css:boolean}、取消は{result:false} |
| importKantanMarkdown(result,dummyHtml,file) | 選択、読込HTML DOM、File | 添付追加・原稿連結・CSS上書き |
| KantanDrawer.show(base64,layerContent,trimInfo,onSave,onCancel) | 元画像・編集情報・関数 | SaveはonSave(layerContent,trimInfo)、取消はonCancel() |
| getHTMLForSave() | なし | 編集可能HTML文字列。画面も一時変更・復元 |
| save() / exportHTML() | なし | Blobダウンロード要求。後者はtitle_export.html |
| buildToc() / updateTocActive() | 現在DOM | 目次再生成 / activeクラス更新 |
| getItem(name,defaultValue) / setItem(name,value) | 設定名・値 | 接頭辞付きLocalStorage。例外捕捉 |
| kantanUpdate(json) | {newVersion,ktmString,doUpdate,rewirteHtml} | json.doUpdate実行。rewirteHtmlは実装の綴り通り |

## 外部リソース
更新scriptは http://tatesuke.github.io/KanTanMarkdown/kantanUpdate.js を動的挿入。取得失敗はonerrorで警告。同版判定は文字列一致で署名検証・バージョン順序比較なし。HTTPSページではMixed Content制約を受け得る。新規作成とヘルプは外部リンク。本文中の外部画像/CSS/リンクも通常のブラウザ通信に従う。
