# 結合テスト

```json
[
  {
    "変更区分": "拡張",
    "id": "IT-001",
    "category": "画面⇄サーバ結合",
    "functionCategory": {
      "large": "マークダウン編集管理",
      "medium": "エディタ・プレビュー連携",
      "small": "キー入力・プレビュー反映"
    },
    "testCase": "Tabキー押下時のタブ展開処理とリアルタイムプレビューHTML変換の結合検証",
    "relatedApi": "未定義",
    "relatedProcess": "BP-001, BP-007",
    "relatedRequirement": "FR-001, FR-007",
    "relatedViewpoint": "ITV-L3-001",
    "precondition": "マークダウンエディタ画面が開かれており、設定画面にてexpandTab=true（タブ展開有効）が設定されていること",
    "testData": {
      "input": "editor='# タイトル\\nTab入力テキスト', expandTab=true",
      "expectedDb": "DB非使用。エディタ要素のカーソル位置に4スペースが挿入され、Undo履歴が更新されること"
    },
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "テキストエリアの行頭でTabキーを押下し、マークダウンテキストを入力する",
        "expectedResult": "BP-001によりTabキー入力が4スペースに展開されて挿入され、BP-007のマークダウンHTML変換処理が起動してプレビュー画面にインデントされたHTML要素がリアルタイムに描画されること"
      }
    ],
    "expectedResult": "エディタ上でTabキーによるスペース展開が行われ、対応するHTML構造がプレビュー画面に即座に反映されること",
    "errorCode": null,
    "priority": "高"
  },
  {
    "変更区分": "拡張",
    "id": "IT-002",
    "category": "画面⇄サーバ結合",
    "functionCategory": {
      "large": "マークダウン編集管理",
      "medium": "エディタ・プレビュー連携",
      "small": "構文拡張・ハイライト表示"
    },
    "testCase": "GitHubアラート要素およびコードブロック構文強調のレンダリング結合検証",
    "relatedApi": "未定義",
    "relatedProcess": "BP-004, BP-008",
    "relatedRequirement": "FR-004, FR-008",
    "relatedViewpoint": "ITV-L3-002",
    "precondition": "マークダウンエディタ画面にGitHubアラート構文およびコードブロックを含むテキストが入力可能状態であること",
    "testData": {
      "input": "src='> [!NOTE]\\n> 注意事項\\n\\n```js\\nvar x = 1;\\n```'",
      "expectedDb": "DB非使用。プレビューDOM要素（container）内に変換後のHTML構造が生成・更新されること"
    },
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "エディタに'> [!NOTE]\\n> 注意事項'およびJavaScriptコードブロックを入力し、プレビュー更新を発生させる",
        "expectedResult": "BP-004によりblockquote要素がGitHubスタイルのAlert（markdown-alert-note）構造へ変換され、BP-008によりcode要素へHighlight.jsの構文強調タグが適用されてプレビュー画面に描画されること"
      }
    ],
    "expectedResult": "GitHubアラート専用アイコン・スタイルおよびコードブロックのシンタックスハイライトが正常にプレビュー画面上に適用表示されること",
    "errorCode": null,
    "priority": "中"
  },
  {
    "変更区分": "拡張",
    "id": "IT-003",
    "category": "画面⇄サーバ結合",
    "functionCategory": {
      "large": "システム制御",
      "medium": "ブラウザアクセス制御",
      "small": "閲覧専用モード判定"
    },
    "testCase": "非対応ブラウザ環境起動時における閲覧専用モード制御結合検証",
    "relatedApi": "未定義",
    "relatedProcess": "BP-002",
    "relatedRequirement": "FR-002",
    "relatedViewpoint": "ITV-L3-003",
    "precondition": "Blob生成が非サポート、またはChromeを含まないSafari環境のUserAgentでアプリケーションを起動すること",
    "testData": {
      "input": "userAgent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15'",
      "expectedDb": "DB非使用。内部状態としてsetViewOnlyが適用されること"
    },
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "対象のUserAgent条件を持つブラウザ環境にてアプリケーション初期化イベントを発生させる",
        "expectedResult": "BP-002の閲覧専用モード判定処理が実行され、画面上に警告メッセージが表示されるとともにツールバーの編集操作ボタンにdisabled属性が付与されて操作不可状態になること"
      }
    ],
    "expectedResult": "閲覧専用モード（setViewOnly）が正しく適用され、編集不可メッセージ表示およびツールバー機能の無効化が行われること",
    "errorCode": null,
    "priority": "高"
  },
  {
    "変更区分": "拡張",
    "id": "IT-004",
    "category": "画面⇄サーバ結合",
    "functionCategory": {
      "large": "図表描画管理",
      "medium": "ダイアグラム描画",
      "small": "図表構文解析・SVG生成"
    },
    "testCase": "シーケンス図およびフローチャート記法の構文解析とSVG描画結合検証",
    "relatedApi": "未定義",
    "relatedProcess": "BP-005, BP-006",
    "relatedRequirement": "FR-005, FR-006",
    "relatedViewpoint": "ITV-L3-004",
    "precondition": "マークダウンエディタ画面が開かれており、シーケンス図およびフローチャートの定義コードが入力可能であること",
    "testData": {
      "input": "text='Alice->Bob: Hello', code='st=>start: Start\\ne=>end: End\\nst->e'",
      "expectedDb": "DB非使用。プレビュー画面上のSVG要素（DiagramおよびRaphael SVG）として構造化出力されること"
    },
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "エディタにシーケンス図定義（sequence）およびフローチャート定義（flowchart）のコードブロックを入力する",
        "expectedResult": "BP-005によりシーケンス図定義が解析されてDiagramオブジェクトが生成され、BP-006によりフローチャート定義がパースされてRaphaelライブラリを介しSVG形式の図表がプレビュー画面にレンダリングされること"
      }
    ],
    "expectedResult": "シーケンス図およびフローチャートが構文エラーなく解析され、プレビュー画面に正確なSVG図表として描画されること",
    "errorCode": null,
    "priority": "中"
  },
  {
    "変更区分": "拡張",
    "id": "IT-005",
    "category": "DB結合",
    "functionCategory": {
      "large": "描画・画像管理",
      "medium": "ローカルアセット管理",
      "small": "キャンバス状態保持"
    },
    "testCase": "お絵描き画面での描画属性変更に伴うKantanDrawer内部状態および設定値の保持検証",
    "relatedApi": "未定義",
    "relatedProcess": "BP-003",
    "relatedRequirement": "FR-003",
    "relatedViewpoint": "ITV-L3-005",
    "precondition": "お絵描き画面（KantanDrawer）が開かれており、キャンバス要素が操作可能な状態であること",
    "testData": {
      "input": "mode='rect', borderWidth=3, borderColor='#FF0000', fillColor='#00FF00'",
      "expectedDb": "KantanDrawer内部状態変数にborderWidth=3, borderColor='#FF0000', fillColor='#00FF00'が保持・更新されること"
    },
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "ツールバーの枠線太さを3、枠線色を'#FF0000'、塗りつぶし色を'#00FF00'に変更し、矩形描画モードを選択してキャンバス上をドラッグ操作する",
        "expectedResult": "BP-003が実行され、入力された枠線太さ・カラーコードが16進数形式でKantanDrawer内部状態へ設定保存され、指定属性通りの矩形要素がキャンバスへリアルタイム描画されること"
      }
    ],
    "expectedResult": "変更された描画属性値がお絵描き機能の内部状態データとして正確に保持・反映され、キャンバス描画に適用されること",
    "errorCode": null,
    "priority": "高"
  },
  {
    "変更区分": "拡張",
    "id": "IT-006",
    "category": "DB結合",
    "functionCategory": {
      "large": "データ移行管理",
      "medium": "バージョン引き継ぎ",
      "small": "アセットデータ継承"
    },
    "testCase": "バージョンアップデート時における既存マークダウン・CSS・添付ファイルデータの再構築引き継ぎ検証",
    "relatedApi": "未定義",
    "relatedProcess": "BP-009",
    "relatedRequirement": "FR-009",
    "relatedViewpoint": "ITV-L3-006",
    "precondition": "旧バージョンのデータ（既存マークダウンテキスト、カスタムCSS、添付ファイルのBase64・トリミング情報）が保持されており、アップデートダイアログが表示されていること",
    "testData": {
      "input": "currentVersion='1.0.0', dialogResult={importMarkdown: true, importCss: true, importAttachments: true}, attachments=[{fileName:'image.png', base64:'data:image/png;base64,...', layerContent:{}, trimInfo:{}}]",
      "expectedDb": "ブラウザ内保持データ（既存アセットデータ、マークダウン文字列、CSS）が全件移送され、新規HTMLドキュメントへ再構築反映されること"
    },
    "steps": [
      {
        "order": 1,
        "screen": "アップデートダイアログ",
        "action": "引き継ぎ項目（マークダウン・CSS・添付ファイル）を選択した状態で「実行確定」ボタンを押下する",
        "expectedResult": "BP-009により旧イベントリスナーが解除（removeAllEvents）され、アセットデータ・マークダウン・CSSが新しいHTML構造へと全件正しく移送・再構築されて画面に適用されること"
      }
    ],
    "expectedResult": "アップデート後も旧バージョンのマークダウン、CSS、添付ファイル（ベース64データ・トリミング情報等）が失われることなく新HTMLに完全継承表示されること",
    "errorCode": null,
    "priority": "高"
  },
  {
    "変更区分": "拡張",
    "id": "IT-007",
    "category": "API結合",
    "functionCategory": {
      "large": "モジュール統合管理",
      "medium": "コンポーネント間連携",
      "small": "パラメータ相互受渡"
    },
    "testCase": "エディタ編集・ドロワー描画・パースエンジン間のパラメータ相互連携検証",
    "relatedApi": "未定義",
    "relatedProcess": "BP-001, BP-003, BP-007",
    "relatedRequirement": "FR-001, FR-003, FR-007",
    "relatedViewpoint": "ITV-L3-007",
    "precondition": "マークダウンエディタ画面とお絵描き画面が相互にデータ呼び出し可能な状態に結合されていること",
    "testData": {
      "input": "editor='# Test', drawerData='data:image/png;base64,iVBORw0KGgo...', expandTab=false",
      "expectedDb": "DB非使用。コンポーネント間で渡されるパラメータ（テキスト・Base64画像文字列）のメモリ上整合性が保持されること"
    },
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "お絵描き画面で作成した画像データ（Base64）をエディタ挿入関数へ渡し、マークダウンテキストとして組み込んでパース処理を実行させる",
        "expectedResult": "BP-003で作成された画像描画データ（Base64）がBP-001を経由してエディタ文字列へ組み込まれ、BP-007のHTML変換処理にエラーなくパラメータとして渡されてプレビュー画面に画像タグとしてレンダリングされること"
      }
    ],
    "expectedResult": "コンポーネント間で画像データおよびエディタテキストのパラメータ受渡しが正常に行われ、レンダリング処理まで例外なく完結すること",
    "errorCode": null,
    "priority": "中"
  },
  {
    "変更区分": "拡張",
    "id": "IT-008",
    "category": "ファイルI/F",
    "functionCategory": {
      "large": "パッケージング管理",
      "medium": "単一ファイルビルド",
      "small": "エディション別成果物生成"
    },
    "testCase": "Gruntタスクによる複数エディション単一HTMLファイルの生成・インライン化検証",
    "relatedApi": "未定義",
    "relatedProcess": "BP-010",
    "relatedRequirement": "FR-010",
    "relatedViewpoint": "ITV-L3-008",
    "precondition": "Gruntビルド環境がセットアップされており、dist/temp/一時ディレクトリへソースコードの複製が可能な状態であること",
    "testData": {
      "input": "edition='lite'",
      "expectedDb": "DB非使用。ファイルシステム上のdist/ディレクトリに「ktm-lite.html」が生成出力されること"
    },
    "steps": [
      {
        "order": 1,
        "screen": "Gruntビルド環境",
        "action": "ビルドタスク『grunt build-lite』を実行する",
        "expectedResult": "BP-010によりclean, copy, cssmin, uglifyが順次実行され、replaceタスク（Highlight.js/Raphael.js等のスクリプト除外処理および__KANTAN_EDITION__の置換）を経て、必要なリソースがインライン展開された単一HTMLファイル（dist/ktm-lite.html）が出力されること"
      }
    ],
    "expectedResult": "指定されたエディション（lite）に応じた不要スクリプトの除外とCSS/JSインライン化が行われ、スタンドアロン動作可能な単一HTMLファイルが生成されること",
    "errorCode": null,
    "priority": "高"
  }
]
```