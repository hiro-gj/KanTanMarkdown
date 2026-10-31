# アーキテクチャ構成図

単一HTML上で動作するマークダウンエディタおよびプレビューアのクライアントサイド・システム構成図

**画面・UI層:**
- マークダウンエディタ画面 [HTML5 / JavaScript (kantanEditor.js)]
- プレビュー画面 [HTML5 / DOM]
- お絵描き画面 [HTML5 Canvas (kantanDrawer.js)]
- アップデートダイアログ [HTML5 / JavaScript (kantanUpdate.js)]
- 設定画面 [HTML5 / JavaScript]

**アプリケーション・制御層:**
- KanTanMarkdown コア制御 [JavaScript (kantanMarkdown.js)]
- KantanDrawer [JavaScript (kantanDrawer.js)]
- GitHubアラート プラグイン [JavaScript (github-alerts.js)]

**解析・描画ライブラリ層:**
- marked (マークダウンパーサー) [marked.min.js]
- highlight.js (コードハイライト) [highlight.min.js]
- js-sequence-diagrams (Diagram / Actor / Signal) [js-sequence-diagrams.min.js]
- flowchart.js (フローチャート描画) [flowchart.min.js]
- Raphaël (ベクターグラフィック描画) [raphael.min.js]
- Underscore.js (ユーティリティ) [underscore.min.js]

**接続:**
- マークダウンエディタ画面 → KanTanMarkdown コア制御 (DOM Events (タブ展開 / アウトデント))
- マークダウンエディタ画面 → marked (マークダウンパーサー) (Function Call (マークダウンテキスト変換))
- marked (マークダウンパーサー) → プレビュー画面 (DOM Rendering (プレビュー))
- プレビュー画面 → GitHubアラート プラグイン (DOM Modification (GitHubアラート変換))
- プレビュー画面 → highlight.js (コードハイライト) (Function Call (コードハイライト適用))
- プレビュー画面 → js-sequence-diagrams (Diagram / Actor / Signal) (Function Call (Diagram/Actor/Signal解析・描画))
- プレビュー画面 → flowchart.js (フローチャート描画) (Function Call (フローチャート解析・描画))
- js-sequence-diagrams (Diagram / Actor / Signal) → Raphaël (ベクターグラフィック描画) (Function Call)
- flowchart.js (フローチャート描画) → Raphaël (ベクターグラフィック描画) (Function Call)
- js-sequence-diagrams (Diagram / Actor / Signal) → Underscore.js (ユーティリティ) (Function Call)
- お絵描き画面 → KantanDrawer (Canvas Call (レイヤーコンテンツ / トリミング情報処理))
- アップデートダイアログ → KanTanMarkdown コア制御 (Function Call (アップデート / エディション切替))
- 設定画面 → KanTanMarkdown コア制御 (DOM Events (閲覧専用モード設定など))

```mermaid
flowchart TD
    subgraph ui["画面・UI層"]
        markdown_editor_ui["マークダウンエディタ画面 (HTML5 / JavaScript (kantanEditor.js))"]
        preview_ui["プレビュー画面 (HTML5 / DOM)"]
        drawer_ui["お絵描き画面 (HTML5 Canvas (kantanDrawer.js))"]
        update_dialog_ui["アップデートダイアログ (HTML5 / JavaScript (kantanUpdate.js))"]
        setting_ui["設定画面 (HTML5 / JavaScript)"]
    end
    subgraph application["アプリケーション・制御層"]
        kantan_md_core["KanTanMarkdown コア制御 (JavaScript (kantanMarkdown.js))"]
        kantan_drawer_engine["KantanDrawer (JavaScript (kantanDrawer.js))"]
        github_alerts_plugin["GitHubアラート プラグイン (JavaScript (github-alerts.js))"]
    end
    subgraph library["解析・描画ライブラリ層"]
        marked_lib["marked (マークダウンパーサー) (marked.min.js)"]
        highlight_lib["highlight.js (コードハイライト) (highlight.min.js)"]
        sequence_lib["js-sequence-diagrams (Diagram / Actor / Signal) (js-sequence-diagrams.min.js)"]
        flowchart_lib["flowchart.js (フローチャート描画) (flowchart.min.js)"]
        raphael_lib["Raphaël (ベクターグラフィック描画) (raphael.min.js)"]
        underscore_lib["Underscore.js (ユーティリティ) (underscore.min.js)"]
    end
    markdown_editor_ui -->|"DOM Events (タブ展開 / アウトデント)"|kantan_md_core
    markdown_editor_ui -->|"Function Call (マークダウンテキスト変換)"|marked_lib
    marked_lib -->|"DOM Rendering (プレビュー)"|preview_ui
    preview_ui -->|"DOM Modification (GitHubアラート変換)"|github_alerts_plugin
    preview_ui -->|"Function Call (コードハイライト適用)"|highlight_lib
    preview_ui -->|"Function Call (Diagram/Actor/Signal解析・描画)"|sequence_lib
    preview_ui -->|"Function Call (フローチャート解析・描画)"|flowchart_lib
    sequence_lib -->|"Function Call"|raphael_lib
    flowchart_lib -->|"Function Call"|raphael_lib
    sequence_lib -->|"Function Call"|underscore_lib
    drawer_ui -->|"Canvas Call (レイヤーコンテンツ / トリミング情報処理)"|kantan_drawer_engine
    update_dialog_ui -->|"Function Call (アップデート / エディション切替)"|kantan_md_core
    setting_ui -->|"DOM Events (閲覧専用モード設定など)"|kantan_md_core
```