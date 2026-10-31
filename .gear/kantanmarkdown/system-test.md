# システムテスト

```json
[
  {
    "id": "ST-001",
    "category": "機能",
    "functionCategory": {
      "large": "商品管理",
      "medium": "基本編集機能",
      "small": "タブ展開・インデント操作"
    },
    "testCase": "マークダウンテキスト入力およびインデント・タブ操作の動作確認",
    "relatedRequirement": "FR-001",
    "relatedScreens": [
      "SCR-001",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-001",
    "scenario": "設定画面でタブ展開機能を有効にした後、マークダウンエディタ画面でTabキーおよびShift+Tabキー操作を行い、スペース挿入とインデント・アウトデントが正しく行われることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "アプリケーションが初期状態で起動しており、マークダウンエディタ画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」の設定ボタンをクリックし、「設定画面」を表示する",
        "expectedResult": "設定画面（SCR-005）がモーダル表示されること"
      },
      {
        "order": 2,
        "screen": "設定画面",
        "action": "「setting-expand-tab」チェックボックスをオンにし、設定画面を閉じる",
        "expectedResult": "タブ展開機能が有効化され、マークダウンエディタ画面に戻ること"
      },
      {
        "order": 3,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '# Header\nSample Text' を入力する",
        "expectedResult": "「editor」に指定のテキストが入力され、「プレビュー画面」にリアルタイム反映されること"
      },
      {
        "order": 4,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドの2行目頭にカーソルを合わせ、Tabキーを押下する",
        "expectedResult": "設定に基づき「editor」の2行目頭にスペースが挿入されインデントされること"
      },
      {
        "order": 5,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドの2行目を選択した状態で、Shift+Tabキーを押下する",
        "expectedResult": "2行目頭のスペースが削除され、アウトデント処理が行われること"
      }
    ],
    "expectedResult": "Tabキー押下時に設定に応じたスペースが挿入され、Shift+Tabキー押下時に正しくアウトデントされること。",
    "testData": "setting-expand-tab=true, editor='# Header\\nSample Text'",
    "acceptanceCriteria": "Tabキー操作およびShift+Tabキー操作により、テキストのタブ展開・インデント・アウトデントが正常に機能すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-002",
    "category": "機能",
    "functionCategory": {
      "large": "商品管理",
      "medium": "基本編集機能",
      "small": "Tabキー展開"
    },
    "testCase": "Tabキー入力時のタブ展開・インデント動作確認",
    "relatedRequirement": "FR-001",
    "relatedScreens": [
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-012",
    "scenario": "マークダウンエディタ画面のテキストエリアでTabキーを押下し、インデントまたはタブ文字挿入が実行されることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が開かれており、エディタに入力可能な状態であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '- List Item 1' と入力し、改行後 Tab キーを押下する",
        "expectedResult": "行頭にタブ展開によるインデントが挿入されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "続けて 'Sub Item 1' と入力する",
        "expectedResult": "「editor」フィールドにインデントされた状態で '- Sub Item 1' が作成されること"
      }
    ],
    "expectedResult": "Tabキー押下によりテキストエリア内で正しくタブ挿入またはスペース展開が行われること。",
    "testData": "editor='- List Item 1\\n[Tab]- Sub Item 1'",
    "acceptanceCriteria": "keydown (Tab) イベントにより設定されたタブ展開が行われ、マークダウンの階層構造化が正しく機能すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-003",
    "category": "機能",
    "functionCategory": {
      "large": "商品管理",
      "medium": "基本編集機能",
      "small": "複数行アウトデント"
    },
    "testCase": "Shift+Tabキー入力時の複数行アウトデント動作確認",
    "relatedRequirement": "FR-001",
    "relatedScreens": [
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-013",
    "scenario": "複数行インデントされたマークダウンテキストを一括選択し、Shift+Tabキーを入力してまとめてアウトデントされることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面に複数行のインデント済みテキストが入力されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '  - Line 1\\n  - Line 2\\n  - Line 3' を入力する",
        "expectedResult": "インデントされた3行のテキストが「editor」にセットされること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールド内の全3行を選択状態にし、Shift+Tabキーを押下する",
        "expectedResult": "選択された3行全体の行頭スペースが一括削除され、アウトデントされること"
      }
    ],
    "expectedResult": "選択範囲内の複数行に対して、Shift+Tabキー一発で一括アウトデントが適用されること。",
    "testData": "editor='  - Line 1\\n  - Line 2\\n  - Line 3'",
    "acceptanceCriteria": "複数行選択時におけるkeydown (Shift+Tab)トリガーによって一括アウトデント処理が正常に実行されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-004",
    "category": "機能",
    "functionCategory": {
      "large": "グラフィック編集",
      "medium": "お絵描き機能",
      "small": "注釈・図形描画"
    },
    "testCase": "KantanDrawerによる注釈・図形描画およびスタイル更新確認",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-003",
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-002",
    "scenario": "お絵描き画面を起動し、描画モードの切り替えおよびスタイル変更を行い、キャンバス上に図形を描画してエディタに保存反映する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が表示されており、「toolbar」のお絵描き起動ボタンが操作可能な状態であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」のお絵描き起動ボタンをクリックする",
        "expectedResult": "「お絵描き画面」（SCR-003）へ画面遷移すること"
      },
      {
        "order": 2,
        "screen": "お絵描き画面",
        "action": "「mode」ボタン群から矩形描画モードを選択し、「borderWidth」に '3'、「borderColor」に '#FF0000' を入力する",
        "expectedResult": "描画モードが矩形に変更され、描画スタイルの設定値が更新されること"
      },
      {
        "order": 3,
        "screen": "お絵描き画面",
        "action": "「canvasWrapper」エリア上でドラッグ操作を行い図形を描画する",
        "expectedResult": "指定された線幅3、赤色の矩形がメインキャンバス上に描画されること"
      },
      {
        "order": 4,
        "screen": "お絵描き画面",
        "action": "確定・保存ボタンをクリックする",
        "expectedResult": "描画内容が保存され、「マークダウンエディタ画面」（SCR-001）へ復帰し、「fileList」にレイヤーコンテンツが追加されること"
      }
    ],
    "expectedResult": "KantanDrawerで設定したスタイルに従いキャンバスへの描画が行われ、エディタ画面に正しく保持・連携されること。",
    "testData": "borderWidth=3, borderColor='#FF0000', fillColor='#FFFFFF'",
    "acceptanceCriteria": "お絵描き画面での描画・スタイル変更が正常に行われ、レイヤーコンテンツとしてエディタ画面に引き継がれること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-005",
    "category": "機能",
    "functionCategory": {
      "large": "グラフィック編集",
      "medium": "お絵描き機能",
      "small": "スタイル設定変更"
    },
    "testCase": "描画スタイル（線幅・色・フォント）変更・適用確認",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-003"
    ],
    "relatedViewpoint": "STV-L3-018",
    "scenario": "お絵描き画面にて、styleControlsのコントロール値（borderWidth, borderColor, fillColor）を変更し、描画コンテキストへ即時適用されることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面（SCR-003）が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「styleControls」内の「borderWidth」フィールドに '5' を入力する",
        "expectedResult": "線の太さ設定が 5 に変更されること"
      },
      {
        "order": 2,
        "screen": "お絵描き画面",
        "action": "「styleControls」内の「borderColor」に '#00FF00'、「fillColor」に '#0000FF' を入力する",
        "expectedResult": "色情報（borderColor, fillColor）の変更イベント（keyup）が発生し、描画コンテキストの設定値が即時更新されること"
      },
      {
        "order": 3,
        "screen": "お絵描き画面",
        "action": "「canvasWrapper」上でドラッグ操作して図形を描く",
        "expectedResult": "太さ 5、枠線色 緑、塗りつぶし色 青の図形が描画されること"
      }
    ],
    "expectedResult": "入力されたスタイルパラメータが遅延なく描画処理に即時反映されること。",
    "testData": "borderWidth=5, borderColor='#00FF00', fillColor='#0000FF'",
    "acceptanceCriteria": "styleControlsで指定した値がキャンバスのコンテキストに正しく反映され、指定通りの線太さ・カラーで描画されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-006",
    "category": "機能",
    "functionCategory": {
      "large": "プレビュー表示",
      "medium": "ダイアグラム生成",
      "small": "シーケンス図・フローチャートパース"
    },
    "testCase": "シーケンス図およびSVGフローチャートの動的パース・描画確認",
    "relatedRequirement": "FR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-004",
    "scenario": "マークダウンエディタ画面にシーケンス図やフローチャートの記法を入力し、プレビュー画面に動的にSVGダイアグラムが生成・描画されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面およびプレビュー画面が左右に配置または表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドにシーケンス図定義文字 'Alice->Bob: Hello Bob' を入力する",
        "expectedResult": "入力テキストが解析（js-sequence-diagrams）され、「プレビュー画面」の「previewer」内にActor(Alice, Bob)とSignal(Hello Bob)を持つシーケンス図要素が生成されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドにフローチャート定義文字 'st=>start: Start\\ne=>end: End\\nst->e' を追記する",
        "expectedResult": "入力テキストがパース（flowchart.js）され、「プレビュー画面」の「previewer」内にRaphaelを介してSVGフローチャート要素が描画されること"
      }
    ],
    "expectedResult": "テキスト表現からDiagram要素が正しく解析され、プレビュー画面にシーケンス図・フローチャートがレンダリング表示されること。",
    "testData": "editor='Alice->Bob: Hello Bob\\n\\nst=>start: Start\\ne=>end: End\\nst->e'",
    "acceptanceCriteria": "シーケンス図・フローチャートのテキスト定義がエラーなくパースされ、SVGグラフィックとしてプレビュー画面に描画されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-007",
    "category": "機能",
    "functionCategory": {
      "large": "プレビュー表示",
      "medium": "GitHubアラート変換",
      "small": "識別子検出・変換"
    },
    "testCase": "識別子検出およびGitHubアラート要素変換確認",
    "relatedRequirement": "FR-004",
    "relatedScreens": [
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-019",
    "scenario": "エディタに [!NOTE] や [!TIP] を含むブロック引用を入力し、プレビュー画面でGitHubアラート形式のHTML構造（アイコン・スタイル付与）へ即座に変換されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面に入力可能な状態であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '> [!NOTE]\\n> これはノートです。' を入力する",
        "expectedResult": "「プレビュー画面」の「previewer」領域に、青色の枠線とノート用アイコンが付与された 'markdown-alert-note' スタイルのGitHubアラートが表示されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドの内容を '> [!TIP]\\n> これはヒントです。' に書き換える",
        "expectedResult": "「プレビュー画面」の「previewer」領域がリアルタイムに更新され、緑色の 'markdown-alert-tip' アラート要素へ置換表示されること"
      }
    ],
    "expectedResult": "特定の識別子（[!NOTE], [!TIP]等）を持つ引用ブロックが検知され、GitHubスタイルのアラートとしてプレビュー画面に表示されること。",
    "testData": "editor='> [!NOTE]\\n> これはノートです。'",
    "acceptanceCriteria": "[!NOTE], [!TIP] 等の識別子に応じたクラス・アイコン・タイトルを保持するHTML要素へと正常に変換描画されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-008",
    "category": "機能",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート",
      "small": "データ引き継ぎ実行"
    },
    "testCase": "アップデートダイアログを通じたコンテンツデータ継承確認",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-004",
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-005",
    "scenario": "アセットやマークダウンを保持した状態でアップデートダイアログを起動・実行し、データが損失なく新バージョン構造へ引き継がれることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面の「editor」に原稿、「fileList」に添付ファイル・トリミング情報・レイヤーコンテンツが存在すること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」のアップデートボタンをクリックする",
        "expectedResult": "「アップデートダイアログ」（SCR-004）が開くこと"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "「kantanEdition」で 'std' を選択し、「dialogActions」の実行ボタンを押下する",
        "expectedResult": "バージョンチェックが実行され、引き継ぎ対象データ（原稿、CSS、添付ファイル、トリミング情報、レイヤーコンテンツ）がメモリ退避された後、HTML再構築（rewirteHtml）が開始されること"
      },
      {
        "order": 3,
        "screen": "マークダウンエディタ画面",
        "action": "アップデート完了後、マークダウンエディタ画面の各種状態を確認する",
        "expectedResult": "「editor」のマークダウンテキストおよび「fileList」の添付ファイル・レイヤーコンテンツが100%保持された状態で画面が表示されること"
      }
    ],
    "expectedResult": "バージョンアップデート実行後も既存コンテンツデータ（添付ファイル・トリミング情報・レイヤーコンテンツ・原稿・カスタムCSS）が失われずに継承されること。",
    "testData": "kantanVersion='1.0.0', kantanEdition='std', editor='# Data Test', fileList='[Base64ImageData]'",
    "acceptanceCriteria": "アップデートダイアログ経由の更新処理において、旧バージョンのすべてのローカル保持アセットデータが100%引き継がれること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-009",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート",
      "small": "データ継続運用シナリオ"
    },
    "testCase": "アプリ更新運用におけるデータ引継ぎ完全性の実証",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-004",
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-011",
    "scenario": "ユーザーが日常業務で作成したマークダウン文書および図形注釈データを維持したまま、アプリケーションのバージョンアップデート運用を完遂するエンドツーエンドシナリオ。",
    "actor": "一般ユーザー",
    "precondition": "旧バージョンにて日常編集を行い、エディタ原稿・カスタムCSS・お絵描き画像が保存・蓄積されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "日常編集作業として「editor」に詳細文書を入力し、「toolbar」から設定モーダルを開き「cssEditor」にカスタムCSS（'body { font-family: sans-serif; }'）を設定する",
        "expectedResult": "エディタ原稿およびカスタムCSSが保持されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」のアップデートボタンを押し、「アップデートダイアログ」を表示させる",
        "expectedResult": "アップデートダイアログ（SCR-004）が表示され、「kantanVersion」および「importDialog」に更新対象情報が示されること"
      },
      {
        "order": 3,
        "screen": "アップデートダイアログ",
        "action": "引き継ぎ項目が全て選択されていることを確認し、「dialogActions」内のアップデート実行ボタンを押下する",
        "expectedResult": "データの退避とHTMLの書き換え（rewirteHtml）が自動実行され、アプリが新バージョンへ移行すること"
      },
      {
        "order": 4,
        "screen": "マークダウンエディタ画面",
        "action": "復元された「editor」、「cssEditor」、およびプレビュー画面のスタイルを確認する",
        "expectedResult": "入力していた文書、カスタムCSS、添付画像データが一切破損せず復元され、正常に編集・閲覧を継続できる状態になっていること"
      }
    ],
    "expectedResult": "アプリケーション更新時におけるコンテンツ継続運用シナリオがエラーなく完了し、データの完全性が実証されること。",
    "testData": "editor='# Complete Test\\nDocument Content', cssEditor='body { font-family: sans-serif; }', kantanEdition='full'",
    "acceptanceCriteria": "アプリケーションのバージョン移行運用を通してデータ破壊やアセット喪失が発生せず、継続して編集・閲覧可能であること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-010",
    "category": "機能",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "非対応環境自動切替"
    },
    "testCase": "非対応ブラウザ環境検知時における閲覧専用モードへの自動切替検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-015",
    "scenario": "Blobなどのファイル保存機能が利用できないブラウザ環境でアプリケーションを起動し、自動的に閲覧専用モードへ切り替わることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "Blob利用不可または非対応のSafari等の動作環境であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "Blob利用不可に設定したブラウザ環境でアプリケーションを起動する",
        "expectedResult": "「マークダウンエディタ画面」が起動し、ブラウザ対応状況チェックにより編集不可と判断され、「message-area」に警告メッセージが表示されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」コンポーネントの表示状態を確認する",
        "expectedResult": "「プレビュー画面」の「previewer」にコンテンツが構造化表示され、閲覧専用モードとして正常に描画されていること"
      }
    ],
    "expectedResult": "編集非対応環境を検知し、警告メッセージの表示とともに閲覧専用モードへ自動切替されること",
    "testData": "ブラウザ環境=Blob利用不可環境",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-011",
    "category": "機能",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "操作無効化制御"
    },
    "testCase": "閲覧専用モードにおけるツールバーボタンおよびエディタテキストエリアの操作無効化検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-016",
    "scenario": "閲覧専用モードに遷移した状態で、「editor」フィールドへの入力や「toolbar」の各種操作ボタンをクリックし、編集操作が制御されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "Blob非対応環境により閲覧専用モードへ移行していること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアをクリックし、テキスト '# テスト入力' をキー入力する",
        "expectedResult": "「editor」フィールドが無効化（disabled）または編集不可状態であり、テキストが入力されないこと"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」グループ内の各種操作ボタンをクリックする",
        "expectedResult": "「toolbar」の操作ボタンが無効化されており、ボタン押下による各機能の呼び出しが行われないこと"
      }
    ],
    "expectedResult": "閲覧専用モードにおいて「editor」および「toolbar」の制御が行われ、誤操作や変更が防止されること",
    "testData": "editor入力値='# テスト入力'",
    "acceptanceCriteria": "閲覧専用モード時にツールバーの操作ボタンおよびエディタ領域の編集機能が完全に無効化されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-012",
    "category": "障害",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "制限環境フォールバック"
    },
    "testCase": "Blob利用不可などの制限環境下におけるシステムクラッシュ防止とフォールバック動作検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-023",
    "scenario": "JavaScriptのBlob生成APIが例外を発生させる制限環境下でシステムを読み込み、例外を捕捉して安全にフォールバック処理が実行されることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "Blob APIの実行時に例外が発生するように模擬された環境であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "Blob利用不可・例外発生環境で単一HTMLを開く",
        "expectedResult": "JavaScriptエラーによる画面フリーズやシステムクラッシュが発生せず、「message-area」に安全に警告メッセージが表示されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」コンポーネントの表示内容を確認する",
        "expectedResult": "「previewer」にマークダウンのレンダリング結果が表示され、閲覧機能が継続して動作していること"
      }
    ],
    "expectedResult": "制限環境下での例外発生時にも不具合を起こさず、フォールバック処理により閲覧専用モードに安全に切り替わること",
    "testData": "環境疑似設定=Blob生成処理例外発生状態",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-013",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "モード移行シナリオ"
    },
    "testCase": "通常編集状態から制限環境切り替え時の一連の閲覧専用モード移行運用検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-027",
    "scenario": "閲覧対応環境から非対応環境（制限環境）へ文書を開き直す運用において、システムが適切に閲覧専用モードを適用し表示を維持することを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンテキストを含むHTMLファイルが保存されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "非対応ブラウザで保存済みHTMLファイルを直接開く",
        "expectedResult": "「マークダウンエディタ画面」が開かれ、「message-area」に「閲覧専用モード」のメッセージが表示されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアおよび「toolbar」のボタン群の状態を確認する",
        "expectedResult": "「editor」および「toolbar」の操作が抑止されていること"
      },
      {
        "order": 3,
        "screen": "プレビュー画面",
        "action": "「previewer」でコンテンツのテキストおよびスタイルを確認する",
        "expectedResult": "保存されていたマークダウンテキストが正しくHTML変換され「previewer」内に表示されていること"
      }
    ],
    "expectedResult": "非対応環境でのファイル閲覧時に、ユーザーに閲覧専用モードであることを明示しつつコンテンツの閲覧性を確保すること",
    "testData": "対象ファイル=既存作成済みktm.html",
    "acceptanceCriteria": "閲覧専用モードへ自動的に切り替わり、既存のコンテンツを保持したまま安全に表示できること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-014",
    "category": "機能",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "非対応環境検知・遷移"
    },
    "testCase": "動作環境チェック処理による編集不可環境判定と画面遷移動作検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-040",
    "scenario": "初期ロード時の動作環境チェックにおいて編集不可条件が検出された場合、閲覧専用モード処理が呼び出されることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "非対応Safari等の編集不可判定対象ブラウザでアクセスすること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "非対応SafariブラウザでHTMLを開いて初期ロードを実行する",
        "expectedResult": "初期ロード時に動作環境チェックが走り、編集不可判定が下されて「message-area」に警告メッセージが表示されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」のボタン状態および「editor」テキストエリアの編集可否を確認する",
        "expectedResult": "「toolbar」の各操作ボタンが無効化され、「editor」への入力が遮断されていること"
      }
    ],
    "expectedResult": "動作環境判定ロジックにより非対応環境が即座に識別され、閲覧専用状態へ遷移すること",
    "testData": "ブラウザUser-Agent=非対応Safari判定用文字列",
    "acceptanceCriteria": "非対応環境検知時に警告を表示し、編集機能を停止した閲覧専用モードへと遷移すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-015",
    "category": "障害",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "ブラウザ機能制限フォールバック"
    },
    "testCase": "ブラウザ機能制限時における例外ハンドリングと安全な閲覧専用表示動作検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-043",
    "scenario": "ローカルストレージやファイルシステムアクセス等のブラウザ機能制限が存在する場合でも、アプリケーションがクラッシュせず閲覧専用表示を維持することを検証する。",
    "actor": "一般ユーザー",
    "precondition": "セキュリティ設定により一部機能が制限されたWebブラウザ環境であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "機能制限環境下でドキュメントを開く",
        "expectedResult": "例外ハンドラーによりスクリプトの異常終了が防止され、「message-area」に閲覧専用モード移行メッセージが表示されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」内の表示結果を確認する",
        "expectedResult": "「previewer」コンポーネントに文章が正常に表示されること"
      }
    ],
    "expectedResult": "ブラウザの機能制限起因のエラーが適切に処理され、システム全体の安全性が保たれること",
    "testData": "制限環境設定=ローカルストレージ・ファイル操作制限状態",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-016",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "制限環境アクセス制御"
    },
    "testCase": "非対応ブラウザ環境下における不正なデータ書き込み・編集操作のアクセス制限検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-062",
    "scenario": "制限環境下において開発者ツール等を用いて編集・保存イベントの強制発火を試みた際、システム側で無効化制御が維持されることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "閲覧専用モードとして起動していること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "閲覧専用モードの「editor」フィールドに対してDOM操作でreadonly/disabled属性を解除し、テキスト '不正書き込みテスト' を入力して保存イベントを送信する",
        "expectedResult": "内部フラグまたは制御ロジックにより保存処理および編集連動のデータ更新が拒否・無効化されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」の表示内容を更新前と比較する",
        "expectedResult": "「previewer」内の表示が不正入力値に変更されず、元の状態を維持していること"
      }
    ],
    "expectedResult": "閲覧専用モードにおける編集制限がDOM変更等の操作に対しても確実に機能し、アクセス制御が保持されること",
    "testData": "editor強制入力値='不正書き込みテスト'",
    "acceptanceCriteria": "制限環境下において編集機能および保存機能へのアクセスが確実に遮断・制御されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-017",
    "category": "障害",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "Blob非対応・Safariフォールバック"
    },
    "testCase": "Blob非対応および非対応Safari環境下でのエラーハンドリングと安全な閲覧モード保持検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-063",
    "scenario": "Blob非対応や非対応Safariの環境下でシステムが正しく検知を行ない、閲覧モードを安定して維持することを検証する。",
    "actor": "一般ユーザー",
    "precondition": "非対応Safari端末またはBlob非対応ブラウザ環境であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "非対応Safari環境にてシステム（ktm.html）を起動する",
        "expectedResult": "環境検知処理により「message-area」に非対応環境である旨の警告が表示されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドの操作可否と「toolbar」のボタン状態を確認する",
        "expectedResult": "エディタおよびツールバーが抑止状態となっており、編集不可状態が安全に保持されていること"
      },
      {
        "order": 3,
        "screen": "プレビュー画面",
        "action": "「previewer」のスクロールや閲覧操作を実施する",
        "expectedResult": "「previewer」上のレンダリング結果の閲覧操作が支障なく実施できること"
      }
    ],
    "expectedResult": "非対応SafariやBlob未サポート環境で予期せぬ挙動が発生せず、安全に閲覧専用モードへ遷移・維持されること",
    "testData": "実行環境=非対応Safari",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-018",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "プレビューレンダリング",
      "small": "リアルタイムパース性能"
    },
    "testCase": "マークダウンテキスト入力時のリアルタイムパースおよびプレビューレンダリング応答時間検証",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-006",
    "scenario": "マークダウンエディタ画面でテキストを入力し、プレビュー画面に300ms以内にレンダリング結果がリアルタイム同期表示されることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザでシングルHTML（ktm-std.html）が開かれ、マークダウンエディタ画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '# ヘッダー1\n[!NOTE]\n補足テキスト' を入力する",
        "expectedResult": "入力操作後、300ms以内にプレビュー画面の「previewer」領域にHTML変換結果およびGitHubアラート要素が表示されること"
      }
    ],
    "expectedResult": "テキスト編集時、MarkdownパースおよびGitHubアラート変換を含めて300ms以内にプレビュー更新されること。",
    "testData": "editor='# ヘッダー1\n[!NOTE]\n補足テキスト'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-019",
    "category": "性能",
    "functionCategory": {
      "large": "データ管理",
      "medium": "データ引き継ぎ",
      "small": "大量アセット負荷検証"
    },
    "testCase": "大量の添付ファイル・レイヤーコンテンツ保持状態でのアップデートデータ引き継ぎ処理時間検証",
    "relatedRequirement": "NFR-007",
    "relatedScreens": [
      "SCR-003",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-007",
    "scenario": "お絵描き画面で大量のレイヤーコンテンツ（描画オブジェクト）を作成後、アップデートダイアログからバージョン更新を実行し、データ損失なく速やかに処理が完了することを確認する。",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面で多数の図形描画およびレイヤーコンテンツが保持されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「mode」ボタンで描画モードを選択し「borderWidth」に '2'、「borderColor」に '#FF0000'、「fillColor」に '#00FF00' を指定してキャンバスに100件の図形を描画後、「確定・保存ボタン」を押下する",
        "expectedResult": "描画情報（レイヤーコンテンツ）が保存され、マークダウンエディタ画面へ遷移すること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」内の「アップデートボタン」を押下する",
        "expectedResult": "アップデートダイアログが表示されること"
      },
      {
        "order": 3,
        "screen": "アップデートダイアログ",
        "action": "「importDialog」内で引き継ぎ項目を選択し、「dialogActions」の「実行」ボタン（doUpdate）を押下する",
        "expectedResult": "引き継ぎ処理（rewirteHtml）が遅延なく完了し、データが100%保持された状態で新バージョン画面へ移行すること"
      }
    ],
    "expectedResult": "大量アセットデータ保持状態においてもデータの消失なく、速やかにバージョンアップ処理が完了すること。",
    "testData": "borderWidth=2, borderColor=#FF0000, fillColor=#00FF00, kantanVersion=1.0.0, kantanEdition=std",
    "acceptanceCriteria": "アプリ更新時に、既存ドキュメント、CSS設定、添付画像データ、レイヤー・トリミング情報が失われずに100%保持・更新されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-020",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "テキスト編集処理",
      "small": "プレビュー同期速度検証"
    },
    "testCase": "マークダウン編集およびGitHubアラート記述入力時のプレビュー同期処理時間検証",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-021",
    "scenario": "エディタ画面で連続してテキスト入力およびGitHubアラート記述（[!TIP]等）を行い、プレビュー同期にかかる処理時間を測定する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が開かれていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '[!TIP]\nこれはヒントです。' を連続して入力する",
        "expectedResult": "キー入力から300ms以内にプレビュー画面の「previewer」領域内にTipアラートスタイルが描画更新されること"
      }
    ],
    "expectedResult": "連続入力操作を行っても遅延が発生せず、300ms以内にプレビュー画面へ同期反映されること。",
    "testData": "editor='[!TIP]\nこれはヒントです。'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-021",
    "category": "性能",
    "functionCategory": {
      "large": "グラフィック編集",
      "medium": "KantanDrawer描画性能",
      "small": "高密度描画レスポンス検証"
    },
    "testCase": "高密度レイヤーコンテンツ描画時のお絵描き画面キャンバスレスポンス検証",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-003"
    ],
    "relatedViewpoint": "STV-L3-022",
    "scenario": "お絵描き画面で多数のストロークや図形を連続描画し、Canvasの描画処理においてフレームレート低下やドラッグの引っかかりがないことを確認する。",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面（SCR-003）が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「mode」ボタンでペンモードを選択し、「borderWidth」に '5'、「borderColor」に '#0000FF' を設定し「canvasWrapper」上で高速にドラッグ操作を50回繰り返す",
        "expectedResult": "ドラッグ操作にリアルタイムに追随し、描画の遅延やレンダリング崩れが発生しないこと"
      }
    ],
    "expectedResult": "高密度のストローク・図形が存在する状態でも描画パフォーマンスが低下しないこと。",
    "testData": "borderWidth=5, borderColor=#0000FF",
    "acceptanceCriteria": "高密度描画操作時においてUIのフリーズや著しい応答遅延が発生せず正常に描画できること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-022",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "ダイアグラム・複合描画",
      "small": "リアルタイム更新応答性能検証"
    },
    "testCase": "シーケンス図・フローチャート・Markdownを含む複合文書編集時のリアルタイム更新応答時間検証",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-031",
    "scenario": "シーケンス図定義（Diagram, Actor, Signal）とフローチャート定義を含む複雑なマークダウンテキストを編集し、全体のレスポンス時間を検証する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が開いていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '```sequence\nActorA->ActorB: Signal1\n```\n```flow\nst=>start: Start\ne=>end: End\nst->e\n```' を入力する",
        "expectedResult": "入力完了後300ms以内にプレビュー画面の「previewer」領域にシーケンス図およびSVGフローチャートが動的に生成・描画されること"
      }
    ],
    "expectedResult": "ダイアグラム描画処理を含む複合テキストの入力であっても300ms以内にプレビュー更新されること。",
    "testData": "editor='```sequence\nActorA->ActorB: Signal1\n```\n```flow\nst=>start: Start\ne=>end: End\nst->e\n```'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-023",
    "category": "性能",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート",
      "small": "処理時間検証"
    },
    "testCase": "大容量アセット（Base64添付画像・トリミング情報等）保持状態でのバージョンアップデート処理時間検証",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-032",
    "scenario": "大容量のBase64画像データやトリミング情報、レイヤー情報、カスタムCSSを含むプロジェクトでアップデート処理を行い、応答時間を測定する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面に複数枚のBase64添付画像（fileList）および設定画面（SCR-005）の「cssEditor」にカスタムCSSが保存されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」の「アップデートボタン」を押下する",
        "expectedResult": "アップデートダイアログが表示されること"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "「kantanVersion」に '1.0.0'、「kantanEdition」に 'std' を確認し、「dialogActions」内の「実行」ボタン（doUpdate）をクリックする",
        "expectedResult": "メモリへの退避およびHTML書き換え処理（rewirteHtml）が数秒以内にエラーなく完了し、全アセットが引き継がれること"
      }
    ],
    "expectedResult": "大容量データ保持状態でもシステムフリーズを起こさず速やかにアップデート処理が完了すること。",
    "testData": "kantanVersion=1.0.0, kantanEdition=std",
    "acceptanceCriteria": "大容量アセット保持下でのバージョン更新処理がエラーなく円滑に終了すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-024",
    "category": "性能",
    "functionCategory": {
      "large": "アプリケーション起動",
      "medium": "初期ロード",
      "small": "起動速度検証"
    },
    "testCase": "シングルHTML（ktm-std.html/ktm-full.html）の初回ファイル読み込みおよび初期表示速度検証",
    "relatedRequirement": "NFR-001",
    "relatedScreens": [
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-041",
    "scenario": "ローカルストレージにファイルを配置した状態で、ブラウザから単一HTMLを開き、起動から操作可能状態になるまでの時間を測定する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザのキャッシュをクリアした状態。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "Webブラウザで単一HTMLファイル（ktm-full.html）を直接開く",
        "expectedResult": "ファイルを開いてから1秒以内に「editor」「toolbar」「fileList」が表示され、操作可能状態となること"
      }
    ],
    "expectedResult": "1秒以内に初期表示およびエディタの操作可能状態が完了すること。",
    "testData": "ファイル名='ktm-full.html'",
    "acceptanceCriteria": "一般的なWebブラウザでファイルを開いてから1秒以内に初期表示およびエディタの操作可能状態が完了すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-025",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "プレビュー同期",
      "small": "同期速度検証"
    },
    "testCase": "キー入力操作に対するリアルタイムパースおよびプレビュー画面への同期描画速度検証",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-042",
    "scenario": "マークダウンエディタ画面のテキストエリアで長文を入力し、文字入力イベントに対するプレビューレンダリングの遅延時間を計測する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面およびプレビュー画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '## テスト見出し\n- リスト項目1\n- リスト項目2' をタイピング入力する",
        "expectedResult": "各キー入力毎に300ms以内でプレビュー画面の「previewer」にHTML変更が即時描画反映されること"
      }
    ],
    "expectedResult": "タイピングに対するプレビュー描画応答が300ms以内に収まること。",
    "testData": "editor='## テスト見出し\n- リスト項目1\n- リスト項目2'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-026",
    "category": "性能",
    "functionCategory": {
      "large": "アプリケーション起動",
      "medium": "起動レスポンス",
      "small": "ブラウザ起動確認"
    },
    "testCase": "各種ブラウザ環境（Chrome, Firefox, Edge等）における初期ロード応答速度および操作可能状態移行確認",
    "relatedRequirement": "NFR-001",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-053",
    "scenario": "複数の想定実行環境（ローカルブラウザ環境）にて単一HTMLを開き、初期ロードレスポンス時間を計測する。",
    "actor": "一般ユーザー",
    "precondition": "対象ブラウザ（Chrome/Edge/Firefoxなど）が準備されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "対象ブラウザで 「ktm-std.html」 ファイルを起動する",
        "expectedResult": "起動後1秒以内に画面全体の初期レンダリングが完了し、エディタ画面およびプレビュー画面が操作可能な状態になること"
      }
    ],
    "expectedResult": "想定される全動作環境でファイル開下から1秒以内に初期表示およびエディタの操作可能状態が完了すること。",
    "testData": "ファイル名='ktm-std.html'",
    "acceptanceCriteria": "一般的なWebブラウザでファイルを開いてから1秒以内に初期表示およびエディタの操作可能状態が完了すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-027",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "複合レンダリング性能",
      "small": "全構文対応応答速度検証"
    },
    "testCase": "コードハイライト・GitHubアラート・ダイアグラムが混在する全機能利用時のリアルタイムパース応答速度検証",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-054",
    "scenario": "コードブロック、[!NOTE]アラート、シーケンス図、フローチャート等を含む総合的なマークダウン文書を編集し、プレビュー更新レスポンスを測定する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '```javascript\nconsole.log(\"test\");\n```\n[!NOTE]\n注記\n```sequence\nA->B: Msg\n```' を入力する",
        "expectedResult": "入力完了後、Highlight.jsによるシンタックスハイライト、GitHubアラート変換、シーケンス図描画がすべて300ms以内にプレビュー画面へ描画完了すること"
      }
    ],
    "expectedResult": "すべての構文パース・レンダリング処理が300ms以内の目標値を維持すること。",
    "testData": "editor='```javascript\nconsole.log(\"test\");\n```\n[!NOTE]\n注記\n```sequence\nA->B: Msg\n```'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-028",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "大量データ処理",
      "small": "大規模文書負荷検証"
    },
    "testCase": "1万行を超える大規模マークダウンテキスト入力時のパース処理耐性およびプレビュー描画性能検証",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-055",
    "scenario": "数千〜1万行規模のマークダウンテキストをエディタに貼り付け、システムフリーズやクラッシュを起こさずにパース・表示処理が追随することを確認する。",
    "actor": "一般ユーザー",
    "precondition": "1万行のマークダウンテキストデータを用意していること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに1万行のマークダウンテキストを一括貼り付け入力する",
        "expectedResult": "ブラウザがフリーズすることなく処理が実行され、プレビュー画面（SCR-002）にHTMLが正しく描画されること"
      }
    ],
    "expectedResult": "大規模テキストデータに対してもクラッシュせず、安定してパース・表示処理が完了すること。",
    "testData": "editor='(1万行のマークダウンテキストデータ)'",
    "acceptanceCriteria": "テキスト編集時、高負荷構文処理下においてもシステムクラッシュを起こさずにプレビュー更新が完了すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-029",
    "category": "性能",
    "functionCategory": {
      "large": "データ管理",
      "medium": "データ継承性能",
      "small": "大容量アセット継承検証"
    },
    "testCase": "多数の添付画像および描画レイヤーデータを保持した状態でのデータ継承処理時間確認",
    "relatedRequirement": "NFR-007",
    "relatedScreens": [
      "SCR-001",
      "SCR-003",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-056",
    "scenario": "添付ファイル一覧に複数の画像を追加し、お絵描き画面でレイヤーを作成した状態でバージョン更新（SCR-004）を実施し、全データ継承の処理性能を検証する。",
    "actor": "一般ユーザー",
    "precondition": "「fileList」に複数の添付画像、KantanDrawerのレイヤーコンテンツ、設定画面（SCR-005）に「cssEditor」の入力値が存在すること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」の「アップデートボタン」を押下する",
        "expectedResult": "アップデートダイアログが表示されること"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "「importDialog」で全引き継ぎ項目を選択し「dialogActions」内の「実行」ボタンをクリックする",
        "expectedResult": "データ退避および再構築が遅延なく行われ、添付ファイル、レイヤー情報、CSS設定が100%保持されて更新が完了すること"
      }
    ],
    "expectedResult": "大容量アセットデータが失われることなく100%保持・更新され、実用的な時間内で処理が完了すること。",
    "testData": "kantanVersion=1.0.0, kantanEdition=full",
    "acceptanceCriteria": "アプリ更新時に、既存ドキュメント、CSS設定、添付画像データ、レイヤー・トリミング情報が失われずに100%保持・更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-030",
    "category": "性能",
    "functionCategory": {
      "large": "システムリソース管理",
      "medium": "リソース消費",
      "small": "メモリリーク・連続操作検証"
    },
    "testCase": "長時間・連続編集操作（テキスト入力・ドロワー描画・設定変更）実行時のメモリリークおよびリソース消費検証",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-003",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-057",
    "scenario": "テキスト編集、お絵描き画面での描画、設定画面での「setting-expand-tab」切り替えや「cssEditor」編集を繰り返し行い、メモリ消費量が異常増大しないことを確認する。",
    "actor": "一般ユーザー",
    "precondition": "開発者ツールのMemoryプロファイラが有効化されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」でテキスト編集、「お絵描き起動ボタン」で「お絵描き画面」へ遷移し描画、「設定ボタン」で「設定画面」へ遷移し「setting-expand-tab」を切り替える一連の操作を50回連続で繰り返し行う",
        "expectedResult": "操作を繰り返してもメモリ消費量が右肩上がりに著しく増大（メモリリーク）せず、動作が重くならないこと"
      }
    ],
    "expectedResult": "連続操作を行ってもメモリ領域が適切に解放され、パフォーマンス低下が発生しないこと。",
    "testData": "setting-expand-tab=true, cssEditor='body { color: red; }'",
    "acceptanceCriteria": "連続編集操作・画面遷移時においてもメモリリークが発生せず安定して動作すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-031",
    "category": "性能",
    "functionCategory": {
      "large": "ビルド・パッケージング",
      "medium": "Gruntビルドバッチ",
      "small": "ビルド負荷・生成性能検証"
    },
    "testCase": "Gruntfileによるマルチエディション（dev, lite, std, full）一括ビルド実行時の処理負荷および生成性能確認",
    "relatedRequirement": "NFR-006",
    "relatedScreens": [],
    "relatedViewpoint": "STV-L3-058",
    "scenario": "Gruntコマンドを実行し、全エディションの単一HTMLファイルおよびkantanUpdate.jsの圧縮・インライン化ビルド処理時間を検証する。",
    "actor": "システム管理者",
    "precondition": "Node.js/Grunt実行環境が整っていること。",
    "steps": [
      {
        "order": 1,
        "screen": "ビルド実行環境（CLI）",
        "action": "ターミナルで 'grunt build' コマンドを実行する",
        "expectedResult": "エラーを発生させずに全タスク（cssmin, uglify, inline, replace等）が完了し、distフォルダ配下に指定のエディションファイルが正常生成されること"
      }
    ],
    "expectedResult": "Gruntビルドコマンドにより指定エディションの単一HTMLおよび更新JSがエラーなく速やかに生成されること。",
    "testData": "ビルドコマンド='grunt build'",
    "acceptanceCriteria": "Gruntビルドコマンドにより、Dev/Lite/Std/Fullなどの指定エディションの単一HTMLファイルおよび更新JSがエラーなく生成されること",
    "priority": "中",
    "testType": "自動"
  },
  {
    "id": "ST-032",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "マークダウンエディタ編集機能",
      "small": "不正スクリプト実行防止"
    },
    "testCase": "クライアント完結構造および不正スクリプト実行防止確認",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-010",
    "scenario": "マークダウンエディタ画面でscriptタグを含むテキストを入力し、アプリケーション内で不正スクリプトが実行されないことを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "アプリケーションが正常起動し、マークダウンエディタ画面が表示されていること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに '<script>alert(1)</script>' を入力する",
        "expectedResult": "入力した文字列がエディタ内にテキストとして保持され、スクリプトが即座に実行されないこと"
      },
      {
        "order": 2,
        "screen": "設定画面",
        "action": "「toolbar」の設定ボタンをクリックして設定画面を開き、「cssEditor」領域に 'body { background: red; }' を入力する",
        "expectedResult": "設定内容が保持され、危険なスクリプト挿入が行われないこと"
      },
      {
        "order": 3,
        "screen": "アップデートダイアログ",
        "action": "アップデートボタンを押下して「アップデートダイアログ」を表示し、アップデート処理を実行する",
        "expectedResult": "データが引き継がれる際にも不正スクリプトが実行されず、無害化された状態で処理が完了すること"
      }
    ],
    "expectedResult": "エディタ入力や設定保持・アップデート処理においてスクリプトが実行されず、クライアント完結構造が安全に維持されること",
    "testData": "editor=<script>alert(1)</script>, cssEditor=body { background: red; }",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-033",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "マークダウンエディタ編集機能",
      "small": "外部非通信検証"
    },
    "testCase": "クライアント完結構造および外部非通信確認",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-025",
    "scenario": "マークダウンテキスト編集時およびリアルタイムプレビュー表示時に、外部ネットワークへの通信が発生しないことを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "ブラウザの開発者ツール（ネットワークタブ）を開き、通信ログの監視を開始していること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに '# セキュリティテスト' を入力する",
        "expectedResult": "入力したテキストが構文解析され、プレビュー画面へリアルタイムで反映されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」領域の表示を確認し、開発者ツールのネットワークログを確認する",
        "expectedResult": "外部サーバーに対するHTTP/HTTPSリクエストが0件であり、通信が発生していないこと"
      }
    ],
    "expectedResult": "ドキュメント編集および表示処理において外部ネットワーク通信が一切発生せず、クライアント完結構造が保たれていること",
    "testData": "editor=# セキュリティテスト",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-034",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "プレビュー表示",
      "medium": "GitHubアラート変換機能",
      "small": "XSSサニタイズ検証"
    },
    "testCase": "アラート要素変換時のXSSサニタイズ確認",
    "relatedRequirement": "FR-004",
    "relatedScreens": [
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-026",
    "scenario": "GitHubアラート記法内にJavaScriptコードや悪意あるHTMLタグを含めて入力した際、変換時にサニタイズされることを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面でテキスト入力が可能な状態であること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに '> [!NOTE]\n> <img src=x onerror=alert(1)>' を入力する",
        "expectedResult": "入力されたテキストがプレビュー画面へ即座に送信・同期されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」領域内にレンダリングされたGitHubアラート表示要素を確認する",
        "expectedResult": "Noteアラート枠内に表示は行われるが、onerrorイベントハンドラおよびスクリプトが発火・実行されないこと"
      }
    ],
    "expectedResult": "GitHubアラート要素への変換時に不正スクリプトがサニタイズされ、XSS脆弱性が排除されていること",
    "testData": "editor=> [!NOTE]\n> <img src=x onerror=alert(1)>",
    "acceptanceCriteria": "[!NOTE]や[!TIP]等のブロック引用変換時にスクリプトが実行されず安全にサニタイズされること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-035",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "プレビュー表示",
      "medium": "マークダウンレンダリング機能",
      "small": "スクリプト無効化・サニタイズ検証"
    },
    "testCase": "プレビュー表示におけるスクリプト無効化とサニタイズ確認",
    "relatedRequirement": "FR-007",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-035",
    "scenario": "マークダウンおよびカスタムCSSにjavascript:属性や危険なHTML要素を入力した際、プレビュー表示で無害化されることを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が開かれていること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに '<a href=\"javascript:alert(1)\">リンク</a>' を入力する",
        "expectedResult": "マークダウンパースが実行され、プレビュー画面にリンクが生成されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」領域内の 'リンク' をクリックする",
        "expectedResult": "javascript:スキームの実行が無効化されており、アラートダイアログが表示されないこと"
      },
      {
        "order": 3,
        "screen": "設定画面",
        "action": "設定ボタンを押下して設定画面を開き、「cssEditor」に 'body { background: url(\"javascript:alert(1)\"); }' を入力する",
        "expectedResult": "CSS内の危険な構文が無害化され、安全なスタイルとして処理されること"
      }
    ],
    "expectedResult": "プレビューレンダリング時およびCSS適用時に、悪意あるスクリプト属性が完全にサニタイズされること",
    "testData": "editor=<a href=\"javascript:alert(1)\">リンク</a>, cssEditor=body { background: url(\"javascript:alert(1)\"); }",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-036",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート・データ引き継ぎ機能",
      "small": "ローカル保持データ安全性"
    },
    "testCase": "データ引き継ぎ時におけるローカル領域でのデータ保護確認",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-036",
    "scenario": "アップデートダイアログからアプリ更新を行う際、メモリ上に退避・引き継がれるデータが外部送信されずローカル内で保護されることを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ上にテキストおよび「fileList」内に添付画像データが存在すること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」のアップデートボタンを押下する",
        "expectedResult": "アップデートダイアログが表示されること"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "「importDialog」内で「kantanVersion」を '1.0.0'、「kantanEdition」を 'std' と指定し、「dialogActions」の実行ボタンを押下する",
        "expectedResult": "メモリに退避された原稿、CSS、添付ファイル（ベース64データ、トリミング情報、レイヤーコンテンツ）が外部送信されずにローカル領域で再構築され、更新が完了すること"
      }
    ],
    "expectedResult": "バージョン更新時の引き継ぎ処理（rewirteHtml）が外部非通信かつ安全にローカル領域内のみで完了すること",
    "testData": "kantanVersion=1.0.0, kantanEdition=std",
    "acceptanceCriteria": "外部サーバーへの通信なしで、編集・プレビュー・画像添付・お絵描き・データ保存の機能が100%正常に動作すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-037",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "グラフィック編集",
      "medium": "お絵描き（ドロワー）描画機能",
      "small": "外部送信防止検証"
    },
    "testCase": "クライアント完結構造と外部送信防止検証",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-003",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-044",
    "scenario": "お絵描き画面でレイヤーコンテンツを描画・編集し保存する際、作成された画像データが外部に送信されないことを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面が起動され、キャンバス操作が可能な状態であること",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「styleControls」で「borderWidth」を '2'、「borderColor」を '#0000FF'、「fillColor」を '#FFFF00' に設定し、「canvasWrapper」上でドラッグ描画後、確定・保存ボタンを押下する",
        "expectedResult": "描画内容が保存され、マークダウンエディタ画面へ戻ること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「fileList」サイドバーに生成された添付アセットを確認し、ネットワーク通信状況を検証する",
        "expectedResult": "Base64変換されたレイヤーコンテンツがローカルメモリ/ファイルリスト構造に保持され、外部送信通信が発生していないこと"
      }
    ],
    "expectedResult": "レイヤーコンテンツ描画データを含むすべての画像アセットがローカル領域のみで処理・保護されること",
    "testData": "borderWidth=2, borderColor=#0000FF, fillColor=#FFFF00",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-038",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "全体システム",
      "medium": "全画面・ローカルデータ処理",
      "small": "外部通信遮断検証"
    },
    "testCase": "外部ネットワーク通信発生遮断検証",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-003",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-046",
    "scenario": "システム全体の一連操作（編集・プレビュー・お絵描き・アップデート・設定変更）を通じて外部通信が完全に遮断されていることを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "ネットワークトラフィック監視ツールを有効化していること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」でテキストを入力し、「SCR-003」でお絵描き、「SCR-005」で「setting-expand-tab」を切り替え、「SCR-004」でアップデートを実行する",
        "expectedResult": "全ての画面遷移および機能処理が正常に行われること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」領域の最終表示を確認し、通信ログを確認する",
        "expectedResult": "アプリケーション起動から一連の操作終了まで外部通信リクエストが1件も送信されていないこと"
      }
    ],
    "expectedResult": "すべての画面および機能において外部ネットワーク通信が完全に遮断され、ローカルデータ保護が維持されること",
    "testData": "setting-expand-tab=true, kantanVersion=1.0.0, kantanEdition=std",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-039",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "全画面・ローカルデータ処理",
      "small": "ローカルアセット保護検証"
    },
    "testCase": "ローカル保持アセット・データ保護検証",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-047",
    "scenario": "エディタ内に読み込まれた添付ファイルやカスタムCSS等のローカルアセットが外部スクリプト等へ流出しない構造であることを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "「fileList」領域に複数の画像データおよびトリミング情報が保持されていること",
    "steps": [
      {
        "order": 1,
        "screen": "設定画面",
        "action": "設定ボタンを押下して設定画面を開き、「cssEditor」領域にカスタムCSSを入力して保存する",
        "expectedResult": "入力されたCSSデータがシステム内部データ領域に適用・保持されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「fileList」内の保持データおよびDOM構造を確認する",
        "expectedResult": "添付画像やレイヤー情報がDOM上の不審なスクリプト等から読み取られず、安全なオブジェクトとしてローカル管理されていること"
      }
    ],
    "expectedResult": "ローカル領域で保持されるドキュメントおよび添付アセットが外部流出から安全に保護されていること",
    "testData": "cssEditor=h1 { color: blue; }",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-040",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "クライアント完結構造およびデータ管理機能",
      "small": "情報漏洩防止検証"
    },
    "testCase": "ローカルデータ処理における外部通信遮断・情報漏洩防止検証",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-003",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-059",
    "scenario": "大容量の添付画像や複雑なレイヤーコンテンツを含むドキュメントを更新する際、データ漏洩や不正送信が発生しないことを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "Base64形式の画像を含む添付ファイル、トリミング情報、レイヤーコンテンツが登録されていること",
    "steps": [
      {
        "order": 1,
        "screen": "アップデートダイアログ",
        "action": "アップデートボタンを押下し、「importDialog」モーダルで「kantanVersion」を '1.0.0'、「kantanEdition」を 'full' に設定しアップデートを実行する",
        "expectedResult": "データの引き継ぎ処理（rewirteHtml）が開始されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "更新完了後の「fileList」の内容および通信ログを確認する",
        "expectedResult": "データが100%継承されてエディタ上に正しく再構築され、かつ外部通信が一切発生せず情報漏洩が防御されること"
      }
    ],
    "expectedResult": "データ引き継ぎおよび大容量アセットの保持処理において外部接続が発生せず、高度な情報漏洩防止が担保されること",
    "testData": "kantanVersion=1.0.0, kantanEdition=full",
    "acceptanceCriteria": "外部サーバーへの通信なしで、編集・プレビュー・画像添付・お絵描き・データ保存の機能が100%正常に動作すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-041",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "プレビュー表示",
      "medium": "マークダウンパースおよびプレビューレンダリング機能",
      "small": "XSS無害化検証"
    },
    "testCase": "スクリプト注入（XSS）および構文パース時の無害化検証",
    "relatedRequirement": "FR-007",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-060",
    "scenario": "シーケンス図やコードブロック、ダイアグラム定義内にXSSコードを含めて入力した際、プレビュー表示時に完全に無害化されることを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が表示されていること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに '```seq\nActorA-><script>alert(\"XSS\")</script>: Signal\n```' を入力する",
        "expectedResult": "シーケンス図パース処理が実行され、プレビュー画面へ送られること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」領域に表示されるシーケンス図 SVG/HTML 要素を確認する",
        "expectedResult": "ActorAのテキストラベル内のスクリプトタグが文字としてエスケープ表示され、JavaScriptが実行されないこと"
      }
    ],
    "expectedResult": "拡張構文パース処理（シーケンス図・コードハイライト等）において注入されたスクリプトが安全に無害化されること",
    "testData": "editor=```seq\nActorA-><script>alert(\"XSS\")</script>: Signal\n```",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-042",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "設定管理",
      "medium": "設定管理機能",
      "small": "入力値バリデーション検証"
    },
    "testCase": "カスタムCSSおよびスタイル設定値のバリデーション検証",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-003",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-061",
    "scenario": "お絵描き画面の描画スタイル（色コード）や設定画面のカスタムCSSに不正値・不正スクリプト構文を入力した際、入力値検証により安全に処理されることを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面および設定画面で各種スタイルパラメータの入力ができること",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「styleControls」の「borderColor」入力フィールドに 'red; background:url(\"javascript:...\")' を入力する",
        "expectedResult": "不正な色コード入力が拒否されるか、描画コンテキスト側で無効な値として安全に無視されること"
      },
      {
        "order": 2,
        "screen": "設定画面",
        "action": "設定ボタンを押下して設定画面を開き、「cssEditor」に不正な操作を伴うCSS式を入力する",
        "expectedResult": "危険なプロパティが適用されず、スタイル検証によりプレビュー表示が保護されること"
      }
    ],
    "expectedResult": "描画スタイル設定値やカスタムCSSプロパティへの不正入力がバリデーション機能により無害化・遮断されること",
    "testData": "borderColor=red; background:url(\"javascript:...\"), cssEditor=p { behavior: url(xss.htc); }",
    "acceptanceCriteria": "不正入力や無効なカラーコード設定時においてもスタイルコンテキストが安全に防御されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-043",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "アクセス制限・安全遷移検証"
    },
    "testCase": "非対応ブラウザ・制限環境下における安全なアクセス制限検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-062",
    "scenario": "Blob機能が制限された非対応ブラウザ環境を検知した際、システム異常を起こさず安全にツールバー操作を無効化し閲覧専用モードへ遷移することを確認する業務フロー",
    "actor": "一般ユーザー",
    "precondition": "Blob利用不可などの制限ブラウザ環境で単一HTMLを開いた状態であること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "アプリケーションの初期化処理を実行させる",
        "expectedResult": "環境チェック機能が作動し、非対応環境であると判定されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「message-area」に表示されるテキストおよび「toolbar」のボタン群の状態を確認する",
        "expectedResult": "「message-area」に警告メッセージが表示され、「toolbar」の各操作ボタンおよび「editor」エリアが無効化され、閲覧専用モードへ安全に切替制御されること"
      }
    ],
    "expectedResult": "制限環境下において編集権限が安全に無効化され、閲覧専用モードへの確実なアクセス制限が行われること",
    "testData": "env=Blob_Disabled",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-044",
    "category": "可用性・互換性",
    "functionCategory": {
      "large": "全画面・共通機能",
      "medium": "ブラウザ互換性検証",
      "small": "標準ブラウザ動作確認"
    },
    "testCase": "主要Webブラウザ（Chrome, Firefox, Edge）における編集・描画機能動作確認",
    "relatedRequirement": "FR-001, FR-003, FR-007",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-003"
    ],
    "relatedViewpoint": "STV-L3-065",
    "scenario": "Google Chrome、Mozilla Firefox、Microsoft Edge等の主要Webブラウザ環境でシステムを起動し、マークダウンエディタ画面でのテキスト入力・リアルタイムレンダリングおよびお絵描き画面での図形描画が正常に行えることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "テスト対象の端末に最新版のGoogle Chrome、Mozilla Firefox、Microsoft Edgeがインストールされていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "各ブラウザでktm-full.htmlを開き、「editor」フィールドに '# テスト見出し' を入力する",
        "expectedResult": "プレビュー画面の「previewer」領域に見出しテキストがリアルタイムでレンダリング表示されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」内の「お絵描き起動ボタン」をクリックする",
        "expectedResult": "お絵描き画面（SCR-003）へ遷移し、描画キャンバスが表示されること"
      },
      {
        "order": 3,
        "screen": "お絵描き画面",
        "action": "「borderWidth」に '2' を設定し、キャンバス上でドラッグ操作を行い「確定・保存ボタン」をクリックする",
        "expectedResult": "キャンバス上に線が正しく描画され、変更内容が保存されてマークダウンエディタ画面へ戻ること"
      }
    ],
    "expectedResult": "すべての指定Webブラウザ環境において、表示崩れやJavaScriptエラーを発生させずに全機能が同等に動作すること",
    "testData": "editor='# テスト見出し', borderWidth=2",
    "acceptanceCriteria": "Chrome, Firefox, Edgeの各ブラウザ環境において100%同等の表示・操作結果が得られること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-045",
    "category": "可用性・互換性",
    "functionCategory": {
      "large": "閲覧専用モード制御",
      "medium": "動作環境判定",
      "small": "制限環境フォールバック"
    },
    "testCase": "Blob非対応・制限のあるSafari環境における閲覧専用モードへの自動切替と警告表示確認",
    "relatedRequirement": "FR-002, NFR-004, BR-006",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-063",
    "scenario": "Blob利用不可などの制限環境（非対応ブラウザ／制限付きSafari環境）でアプリケーションを起動し、システムクラッシュを起こさず安全に閲覧専用モードへ遷移して編集機能が無効化されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "Blob APIの利用を無効化したブラウザ環境、または非対応のSafari環境を用意すること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "非対応ブラウザ環境下でktm-full.htmlを開く",
        "expectedResult": "エラーによるスクリプト停止を起こさずに画面が開くこと"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「message-area」の表示内容を確認する",
        "expectedResult": "編集不可環境である旨の警告メッセージが表示され、閲覧専用モードへ自動切り替えされること"
      },
      {
        "order": 3,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」の操作ボタン群のクリックおよび「editor」領域へのキー入力を試みる",
        "expectedResult": "「toolbar」内の操作ボタンが無効化（disable）され、「editor」での入力編集操作が制御されていること"
      }
    ],
    "expectedResult": "非対応環境検知時にクラッシュすることなく閲覧専用モードへ100%安全に遷移し、適切な警告メッセージが表示されること",
    "testData": "動作環境=Blob API無効化設定環境",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "id": "ST-046",
    "category": "可用性・互換性",
    "functionCategory": {
      "large": "画面UIレイアウト",
      "medium": "レスポンシブ検証",
      "small": "画面解像度別表示"
    },
    "testCase": "PC、タブレット、スマートフォン画面サイズ変更時のUIレイアウトおよび表示崩れ検証",
    "relatedRequirement": "BR-001, BR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-003",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-067",
    "scenario": "画面解像度（PC: 1920x1080、タブレット: 768x1024、スマートフォン: 375x667）を切り替え、各画面のUI構成要素が画面サイズに合わせて適切に再配置され、表示崩れやボタン重なりが発生しないことを確認する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザの開発者ツールで各種解像度のビューポート切り替えが可能な状態であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "ビューポートサイズを '1920x1080' (PC) に設定し、「editor」および「previewer」の配置を確認する",
        "expectedResult": "エディタ領域とプレビュー領域が左右等分に並び、表示崩れがないこと"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "ビューポートサイズを '768x1024' (タブレット) に切り替える",
        "expectedResult": "「toolbar」のボタン群や「fileList」パネルが画面幅に合わせて収まり、操作可能状態が維持されること"
      },
      {
        "order": 3,
        "screen": "お絵描き画面",
        "action": "「toolbar」からお絵描き画面を開き、ビューポートサイズを '375x667' (スマートフォン) に切り替えて「canvasWrapper」および「styleControls」の表示を確認する",
        "expectedResult": "描画領域とスタイル設定コントロール群が画面枠外にはみ出さずに表示され、タッチ・クリック操作ができること"
      }
    ],
    "expectedResult": "PC、タブレット、スマートフォンのいずれの画面サイズにおいてもUI要素の崩れや操作不可領域が発生しないこと",
    "testData": "PC解像度=1920x1080, タブレット解像度=768x1024, スマホ解像度=375x667",
    "acceptanceCriteria": "指定されたすべての画面サイズ（PC、タブレット、スマートフォン）においてUI要素のレイアウト崩れが生じず、正常に操作できること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "id": "ST-047",
    "category": "可用性・互換性",
    "functionCategory": {
      "large": "スタンドアロン動作",
      "medium": "オフライン稼働検証",
      "small": "ネットワーク非依存動作"
    },
    "testCase": "ネットワーク切断（オフライン状態）における編集・プレビュー・お絵描き・データ保存動作確認",
    "relatedRequirement": "NFR-003, NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-003",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-066",
    "scenario": "端末のネットワーク接続を遮断した完全オフライン環境でアプリケーションを操作し、外部サーバー通信を行わずにすべてのローカル編集・描画・保存機能が完全に動作することを確認する。",
    "actor": "一般ユーザー",
    "precondition": "端末のLANケーブル挿抜またはWi-Fiをオフにし、ネットワーク接続がないオフライン状態で単一HTML（ktm-full.html）を開いていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "オフライン状態で「editor」に '## オフラインテスト本文' を入力する",
        "expectedResult": "プレビュー画面（SCR-002）にリアルタイムでマークダウン変換結果が反映され、通信エラーが発生しないこと"
      },
      {
        "order": 2,
        "screen": "お絵描き画面",
        "action": "「toolbar」の「お絵描き起動ボタン」をクリックしてSCR-003へ遷移し、「borderWidth」に '3'、「borderColor」に '#FF0000' を指定して描画後、「確定・保存ボタン」をクリックする",
        "expectedResult": "外部API通信等を行わずにローカル描画データが保存され、エディタ画面へ復帰すること"
      },
      {
        "order": 3,
        "screen": "アップデートダイアログ",
        "action": "「toolbar」の「アップデートボタン」をクリックしてアップデートダイアログ（SCR-004）を表示させる",
        "expectedResult": "「importDialog」が正常に立ち上がり、オフライン環境下でもバージョン確認・引き継ぎダイアログ操作が完結できること"
      }
    ],
    "expectedResult": "外部ネットワーク通信が一切発生せず、オフライン環境で編集、プレビュー、画像描画、データ保存機能が100%正常に動作すること",
    "testData": "editor='## オフラインテスト本文', borderWidth=3, borderColor='#FF0000'",
    "acceptanceCriteria": "外部サーバーへの通信なしで、編集・プレビュー・画像添付・お絵描き・データ保存の機能が100%正常に動作すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-048",
    "category": "機能",
    "functionCategory": {
      "large": "マークダウン編集管理",
      "medium": "基本編集機能",
      "small": "基本テキスト入力・タブ操作"
    },
    "testCase": "マークダウンエディタ画面でのテキスト入力およびTabキーによるインデント操作確認",
    "relatedRequirement": "FR-001",
    "relatedScreens": [
      "SCR-001",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-001",
    "scenario": "ユーザーがマークダウンエディタ画面でテキストを入力し、設定画面でタブ展開を有効にした後、Tabキー押下によるインデント動作を確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面（SCR-001）が初期状態表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "設定画面",
        "action": "「設定ボタン」を押下して設定画面を開き、「setting-expand-tab」チェックボックスをオンにする",
        "expectedResult": "設定画面が開き、「setting-expand-tab」が有効化されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "設定画面を閉じて「editor」テキストエリアに '# 見出し\\n- リスト項目' と入力し、'リスト項目' 行頭で Tab キーを押下する",
        "expectedResult": "「editor」フィールド内で 'リスト項目' 行頭に設定に応じたスペースが挿入されインデントされること"
      }
    ],
    "expectedResult": "Tabキー入力により設定に応じたスペースが挿入され、マークダウンエディタ内のテキスト構造が正常にインデントされること。",
    "testData": "setting-expand-tab=true, editor=# 見出し\\n- リスト項目",
    "acceptanceCriteria": "Tabキー押下時に設定に従ったスペースが挿入されテキストが正しくインデントされること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-049",
    "category": "機能",
    "functionCategory": {
      "large": "グラフィック編集管理",
      "medium": "ドロワー描画機能",
      "small": "KantanDrawer注釈・図形描画"
    },
    "testCase": "KantanDrawerによる注釈・図形描画およびスタイル更新確認",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-003",
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-002",
    "scenario": "お絵描き画面にて描画スタイルを設定し、キャンバス上に図形を描画後、確定・保存してメイン画面に反映されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面（SCR-001）からお絵描き起動ボタンが押下され、お絵描き画面（SCR-003）が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「styleControls」で「borderWidth」に '3'、「borderColor」に '#FF0000'、「fillColor」に '#00FF00' を入力する",
        "expectedResult": "「borderWidth」、「borderColor」、「fillColor」の入力値が反映されること"
      },
      {
        "order": 2,
        "screen": "お絵描き画面",
        "action": "「mode」ボタン群から図形モードを選択し、「canvasWrapper」上でドラッグ操作を行ってから確定・保存ボタンを押下する",
        "expectedResult": "「canvasWrapper」上に枠線太さ3px・赤枠・緑塗りつぶしの図形が描画され、マークダウンエディタ画面へ遷移すること"
      }
    ],
    "expectedResult": "KantanDrawerで指定したスタイルの図形が描画され、レイヤーコンテンツとして正常に保持・保存されること。",
    "testData": "borderWidth=3, borderColor=#FF0000, fillColor=#00FF00",
    "acceptanceCriteria": "指定された線幅・色・塗りつぶし色でキャンバスに図形が描画され、エディタ側へデータが受け渡されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-050",
    "category": "機能",
    "functionCategory": {
      "large": "マークダウン表示管理",
      "medium": "構文拡張レンダリング",
      "small": "GitHubアラート・ハイライト表示"
    },
    "testCase": "GitHubアラート要素およびコードハイライトのレンダリング確認",
    "relatedRequirement": "FR-004",
    "relatedScreens": [
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-003",
    "scenario": "プレビュー画面にてGitHubアラート構文およびコードブロックが正しく変換・ハイライト表示されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面でアラート記述およびコードブロックが入力されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "プレビュー画面",
        "action": "「previewer」領域の表示内容を確認する",
        "expectedResult": "「previewer」内に '[!NOTE]' が青色のGitHub Noteアラート枠およびアイコン付きで描画され、```javascript コードブロックにシンタックスハイライトが適用されていること"
      }
    ],
    "expectedResult": "[!NOTE]が専用タイトルのついたGitHubアラートスタイルへ変換され、コードブロックが整形表示されること。",
    "testData": "editor=> [!NOTE]\\n補足情報\\n\\n```js\\nconst a = 1;\\n```",
    "acceptanceCriteria": "GitHubアラートHTML要素およびHighlight.jsによる構文ハイライトがプレビュー上に正しくレンダリングされること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-051",
    "category": "機能",
    "functionCategory": {
      "large": "ダイアグラム管理",
      "medium": "図形・チャート生成",
      "small": "動的パース・SVG描画"
    },
    "testCase": "シーケンス図およびSVGフローチャートの動的パース・描画確認",
    "relatedRequirement": "FR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-004",
    "scenario": "エディタ画面にシーケンス図およびフローチャート定義を入力し、プレビュー画面上でSVGダイアグラムとして描画されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面（SCR-001）が開いていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに 'Alice->Bob: Hello' および 'st=>start: Start' のダイアグラム定義を入力する",
        "expectedResult": "入力テキストが保持されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」領域のダイアグラム描画領域を確認する",
        "expectedResult": "「previewer」内にAliceとBobのシーケンス図要素、およびRaphaelライブラリを介したSVGフローチャート要素が生成・表示されていること"
      }
    ],
    "expectedResult": "ダイアグラムテキスト記述がパースされ、プレビュー画面上にシーケンス図とSVGフローチャートが正しく動的描画されること。",
    "testData": "editor=Alice->Bob: Hello\\nst=>start: Start\\ne=>end: End\\nst->e",
    "acceptanceCriteria": "テキスト定義からActor/Signal等のエンティティおよびSVGフローチャートが正常にレンダリング表示されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-052",
    "category": "機能",
    "functionCategory": {
      "large": "データ・システム管理",
      "medium": "アップデート処理",
      "small": "コンテンツデータ引き継ぎ"
    },
    "testCase": "アップデートダイアログを通じたコンテンツデータ継承確認",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-004",
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-005",
    "scenario": "アセット・マークダウン原稿・CSSが保持された状態でアップデートを実行し、新バージョンへ全てのデータが継承されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面に原稿・カスタムCSS・「fileList」に添付ファイルが存在すること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」のアップデートボタンを押下する",
        "expectedResult": "アップデートダイアログ（SCR-004）が開くこと"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "「importDialog」でバージョン・エディションを確認し、「dialogActions」の「実行」ボタンを押下する",
        "expectedResult": "引き継ぎ処理（rewirteHtml）が実行され、既存の原稿・CSS・添付ファイル（トリミング情報、レイヤーコンテンツ含む）が失われずにエディタ画面に復帰すること"
      }
    ],
    "expectedResult": "アプリバージョン更新後も、既存のドキュメント、CSS設定、添付画像およびレイヤーデータが100%継承されること。",
    "testData": "kantanVersion=1.0.0, kantanEdition=std",
    "acceptanceCriteria": "アップデートダイアログ経由の更新処理完了後、全コンテンツデータが正しく引き継がれ操作可能であること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-053",
    "category": "機能",
    "functionCategory": {
      "large": "マークダウン編集管理",
      "medium": "基本編集機能",
      "small": "Tabキー展開・インデント"
    },
    "testCase": "Tabキー入力時のタブ展開・インデント動作確認",
    "relatedRequirement": "FR-001",
    "relatedScreens": [
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-012",
    "scenario": "エディタ画面でTabキーを押下した際、設定に基づきタブ展開（スペース挿入）が行われることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "「setting-expand-tab」が有効化されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアで任意の行頭にカーソルを合わせ、Tabキーを押下する",
        "expectedResult": "カーソル位置に設定に応じたスペース（例: スペース2個または4個）が挿入されること"
      }
    ],
    "expectedResult": "Tabキーのkeydownイベントにより、テキストエリアにスペースへのタブ展開が正しく挿入されること。",
    "testData": "editor=Sample Text",
    "acceptanceCriteria": "Tabキー入力時にタブ文字ではなく設定通りのスペースが挿入されインデントされること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-054",
    "category": "機能",
    "functionCategory": {
      "large": "マークダウン編集管理",
      "medium": "基本編集機能",
      "small": "Shift+Tab複数行アウトデント"
    },
    "testCase": "Shift+Tabキー入力時の複数行アウトデント動作確認",
    "relatedRequirement": "FR-001",
    "relatedScreens": [
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-013",
    "scenario": "インデントされた複数行テキストを選択した状態でShift+Tabキーを押下し、一括でアウトデントされることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面（SCR-001）の「editor」に複数行のインデント済みテキストが存在すること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」内でインデントされた複数行（'  Line1\\n  Line2'）を選択し、Shift+Tabキーを押下する",
        "expectedResult": "選択された全行の行頭からスペースが削除され、'Line1\\nLine2' のように一括アウトデントされること"
      }
    ],
    "expectedResult": "Shift+Tabキー操作によって、選択領域内の複数行の先頭インデントが一括して削除・削除整形されること。",
    "testData": "editor=  Line1\\n  Line2",
    "acceptanceCriteria": "Shift+Tabキー押下時、選択された複数行のインデントが一括して正しく解除されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-055",
    "category": "機能",
    "functionCategory": {
      "large": "マークダウン編集管理",
      "medium": "基本編集機能",
      "small": "Undo履歴保持・復元"
    },
    "testCase": "Undo履歴保持・編集操作復元確認",
    "relatedRequirement": "FR-001",
    "relatedScreens": [
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-014",
    "scenario": "テキスト編集およびインデント操作を行った後、Undo操作（Ctrl+Z / Cmd+Z）により前の状態へ復元できることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面（SCR-001）が開いていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」に 'Test Data' と入力した後、Ctrl+Z（Cmd+Z）を押下する",
        "expectedResult": "入力直前の状態に戻り、「editor」から 'Test Data' が消去されること"
      }
    ],
    "expectedResult": "Undo履歴が正しく保持され、キー操作によって直前のテキスト状態に復元されること。",
    "testData": "editor=Test Data",
    "acceptanceCriteria": "Undo（元に戻す）操作が履歴に従って正常に動作すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-056",
    "category": "機能",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用判定",
      "small": "非対応ブラウザ環境切替"
    },
    "testCase": "非対応ブラウザ環境検知時の閲覧専用モード自動切替確認",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-015",
    "scenario": "Blobが利用不可などの編集非対応環境でアプリケーションを起動した際、自動的に閲覧専用モードに切り替わることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "Blob利用不可などの非対応ブラウザ（制限環境）で起動すること。",
    "steps": [
      {
        "order": 1,
        "screen": "プレビュー画面",
        "action": "非対応ブラウザでアプリケーションを開く",
        "expectedResult": "「message-area」に閲覧専用モードである旨の警告メッセージが表示され、画面が閲覧専用モードへ自動切り替えされること"
      }
    ],
    "expectedResult": "システムがクラッシュせずに非対応環境を検知し、安全に閲覧専用モードへと切り替わること。",
    "testData": "browserEnvironment=Blob_Disabled",
    "acceptanceCriteria": "非対応ブラウザ検知時に警告メッセージが表示され、閲覧専用モードへ遷移すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-057",
    "category": "機能",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用判定",
      "small": "ツールバー・エディタ操作制御"
    },
    "testCase": "閲覧専用モードにおけるツールバーおよびエディタ操作無効化確認",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-016",
    "scenario": "閲覧専用モードにおいて、エディタへの入力およびツールバーの操作ボタンが無効化されていることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "閲覧専用モードで画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「toolbar」のボタン群および「editor」テキストエリアをクリックして操作を試みる",
        "expectedResult": "「toolbar」の各種操作ボタンが無効状態（disabled）となり、「editor」テキストエリアへの文字入力・編集が拒否されること"
      }
    ],
    "expectedResult": "閲覧専用モード下において、編集および保存等の書き込み系操作UIが適切に制御・無効化されること。",
    "testData": "mode=read-only",
    "acceptanceCriteria": "閲覧専用モード時にツールバーおよびエディタへの入力操作が完全に無効化されていること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-058",
    "category": "機能",
    "functionCategory": {
      "large": "グラフィック編集管理",
      "medium": "ドロワー描画機能",
      "small": "描画モード切替・描画"
    },
    "testCase": "描画モード切り替えおよびキャンバス描画確認",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-003",
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-017",
    "scenario": "お絵描き画面にて描画モードを切り替え、キャンバス上でドラッグ操作を行って線や図形が描画されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面（SCR-003）が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「mode」ボタン群でペンモードをクリックし、「canvasWrapper」のメインキャンバス上でドラッグ操作を行う",
        "expectedResult": "「mode」がペン描画状態となり、ドラッグした軌跡に沿って手書き線が描画されること"
      }
    ],
    "expectedResult": "選択した描画モード状態に基づき、「canvasWrapper」上に期待通りのグラフィック線描画が行われること。",
    "testData": "mode=pen",
    "acceptanceCriteria": "描画モードボタンの押下でモードが切り替わり、キャンバス上に正確に描画されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-059",
    "category": "機能",
    "functionCategory": {
      "large": "グラフィック編集管理",
      "medium": "ドロワー描画機能",
      "small": "描画スタイル設定・適用"
    },
    "testCase": "描画スタイル（線幅・色・フォント）変更・適用確認",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-003"
    ],
    "relatedViewpoint": "STV-L3-018",
    "scenario": "お絵描き画面で線幅・線色・塗りつぶし色等のコントロールを入力変更し、描画コンテキストに即時適用されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面（SCR-003）が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「styleControls」で「borderWidth」を '5'、「borderColor」を '#0000FF' に変更してキーアップイベントを発生させる",
        "expectedResult": "描画コンテキストの属性が線幅5px・青色に更新され、以降の描画に即時反映されること"
      }
    ],
    "expectedResult": "「borderWidth」や「borderColor」の設定値変更がリアルタイムに描画コンテキストへ反映されること。",
    "testData": "borderWidth=5, borderColor=#0000FF",
    "acceptanceCriteria": "スタイルコントロールの変更値が正しくコンテキストへ適用されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-060",
    "category": "機能",
    "functionCategory": {
      "large": "マークダウン表示管理",
      "medium": "構文拡張レンダリング",
      "small": "GitHubアラート識別子変換"
    },
    "testCase": "識別子検出およびGitHubアラート要素変換確認",
    "relatedRequirement": "FR-004",
    "relatedScreens": [
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-019",
    "scenario": "[!TIP] や [!WARNING] 等の識別子を含む引用ブロックが、対応するGitHubアラートスタイル要素に変換されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面に複数種類のアラート識別子が入力されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "プレビュー画面",
        "action": "「previewer」領域のアラート要素を確認する",
        "expectedResult": "[!TIP] が緑色の 'Tip' アラート、[!WARNING] が黄色の 'Warning' アラートとして各アイコン・タイトル付きHTML構造へ置換描画されること"
      }
    ],
    "expectedResult": "各識別子（[!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION]）が検知され、GitHub仕様のアラート要素へ正しく変換されること。",
    "testData": "editor=> [!TIP]\\nヒント内容\\n> [!WARNING]\\n警告内容",
    "acceptanceCriteria": "記述された識別子に応じて適切なクラス名・アイコン・色がプレビュー要素に付与されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-061",
    "category": "機能",
    "functionCategory": {
      "large": "マークダウン表示管理",
      "medium": "構文拡張レンダリング",
      "small": "リアルタイムプレビュー同期"
    },
    "testCase": "エディタ・プレビュー連動リアルタイム反映確認",
    "relatedRequirement": "FR-004",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-020",
    "scenario": "エディタ画面でテキストを編集した際、プレビュー画面へリアルタイムで同期・反映されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "エディタ画面（SCR-001）とプレビュー画面（SCR-002）が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに '> [!IMPORTANT]\\n重要事項' を追記する",
        "expectedResult": "即時に構文解析が行われ、プレビュー画面（SCR-002）の「previewer」に 'Important' アラートがリアルタイムに表示更新されること"
      }
    ],
    "expectedResult": "エディタのテキスト変更操作が遅延なくプレビュー表示領域へ動的に同期反映されること。",
    "testData": "editor=> [!IMPORTANT]\\n重要事項",
    "acceptanceCriteria": "エディタ入力内容が即座にパースされ、プレビュー画面に表示されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-062",
    "category": "機能",
    "functionCategory": {
      "large": "マークダウン表示管理",
      "medium": "マークダウンパース",
      "small": "HTMLリアルタイム変換・CSS適用"
    },
    "testCase": "マークダウンテキストのHTMLリアルタイム変換と構文表示確認",
    "relatedRequirement": "FR-007",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-028",
    "scenario": "標準的なマークダウン入力およびカスタムCSS設定を行い、プレビュー画面上でスタイルが適用されたHTMLとしてレンダリングされることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面（SCR-001）が開いていること。",
    "steps": [
      {
        "order": 1,
        "screen": "設定画面",
        "action": "「cssEditor」に 'h1 { color: red; }' を入力する",
        "expectedResult": "「cssEditor」のカスタムスタイルがプレビューのスタイリングに反映されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」に '# Test Heading' と入力する",
        "expectedResult": "プレビュー画面（SCR-002）の「previewer」内に 赤色の <h1>Test Heading</h1> 要素が描画されること"
      }
    ],
    "expectedResult": "marked.jsによるHTML変換とカスタムCSSスタイルが正常に機能し、プレビューに反映されること。",
    "testData": "cssEditor=h1 { color: red; }, editor=# Test Heading",
    "acceptanceCriteria": "マークダウン構文が正確にHTML変換され、カスタムCSSの指定が反映されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-063",
    "category": "機能",
    "functionCategory": {
      "large": "ダイアグラム管理",
      "medium": "図形・チャート生成",
      "small": "シーケンス図・フローチャート生成"
    },
    "testCase": "シーケンス図およびSVGフローチャートの動的パース・生成確認",
    "relatedRequirement": "FR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-029",
    "scenario": "Diagram、Actor、Signal表記を含むテキストからシーケンス図が生成され、フローチャート定義からRaphael経由でSVGが生成されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "エディタ画面（SCR-001）が開いていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」に 'title: Sequence\\nUser->Server: Request' を入力する",
        "expectedResult": "「previewer」に 'User' と 'Server' 間を結ぶシーケンス図オブジェクトが動的に生成表示されること"
      }
    ],
    "expectedResult": "js-sequence-diagramsおよびflowchart.jsライブラリを介して構文が正常にパースされ、グラフィカル要素が描画されること。",
    "testData": "editor=title: Sequence\\nUser->Server: Request",
    "acceptanceCriteria": "ダイアグラム構文からエラーなくSVGグラフィックがレンダリングされること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-064",
    "category": "機能",
    "functionCategory": {
      "large": "データ・システム管理",
      "medium": "アップデート処理",
      "small": "データ退避・HTML再構築"
    },
    "testCase": "アップデートダイアログ操作とコンテンツデータ引継ぎ実行確認",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-001",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-030",
    "scenario": "アップデートダイアログで実行を押下し、現在保持しているマークダウン原稿や添付ファイルが退避され新HTML再構築後に復元されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "エディタ上に原稿および「fileList」に添付データが存在すること。",
    "steps": [
      {
        "order": 1,
        "screen": "アップデートダイアログ",
        "action": "「dialogActions」の「実行」ボタン（doUpdate）を押下する",
        "expectedResult": "現在エディタにあるマークダウン、CSS、添付ファイル情報がメモリに退避され、rewirteHtmlの呼び出し完了後にデータが復元されること"
      }
    ],
    "expectedResult": "アップデート処理中にデータ消失が発生せず、イベントリスナーの再登録を含めてアップデートが完了すること。",
    "testData": "kantanVersion=1.0.0",
    "acceptanceCriteria": "退避データが新バージョンの画面構造へ100%引き継がれ、動作すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-065",
    "category": "機能",
    "functionCategory": {
      "large": "ビルド・パッケージング",
      "medium": "マルチエディション生成",
      "small": "単一HTML動作検証"
    },
    "testCase": "各エディション（dev, lite, std, full）単一HTML生成・動作検証",
    "relatedRequirement": "FR-010",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-038",
    "scenario": "Gruntfileによるビルドで生成された各エディション（dev, lite, std, full）の単一HTMLを開き、それぞれの機能が意図通り動作することを確認する。",
    "actor": "管理者",
    "precondition": "Gruntビルドコマンドにより dist/ktm-full.html 等が正常出力されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "ブラウザで ktm-full.html ファイルを開き、「editor」への入力および「previewer」でのダイアグラム表示を確認する",
        "expectedResult": "外部スクリプトの読み込みエラーなく単一HTMLとしてエディタおよびプレビュー機能が正常動作すること"
      }
    ],
    "expectedResult": "ビルド生成された単一HTMLファイルが独立して全機能を正常に実行できること。",
    "testData": "edition=full",
    "acceptanceCriteria": "各エディション（dev, lite, std, full）のHTMLファイルが単独で正しく動作すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-066",
    "category": "機能",
    "functionCategory": {
      "large": "スタンドアロン・動作保証",
      "medium": "オフライン動作",
      "small": "ローカル完結機能検証"
    },
    "testCase": "オフライン・スタンドアロン動作検証",
    "relatedRequirement": "NFR-003",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-003"
    ],
    "relatedViewpoint": "STV-L3-039",
    "scenario": "ネットワーク未接続の完全オフライン状態で、編集・プレビュー・お絵描き・保存等の全機能が動作することを確認する。",
    "actor": "一般ユーザー",
    "precondition": "端末のネットワーク接続を完全に切断（オフライン）した状態であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」でテキストを編集し、お絵描き起動ボタンを押下して「canvasWrapper」で描画を行い保存する",
        "expectedResult": "外部通信を発生させず、すべての編集・プレビュー・画像描画処理がローカル完結で100%正常に動作すること"
      }
    ],
    "expectedResult": "外部サーバーへの通信なしにスタンドアロンでアプリケーションが完全に機能すること。",
    "testData": "networkState=offline",
    "acceptanceCriteria": "オフライン環境下で編集、プレビュー、お絵描き等の全機能が問題なく動作すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-067",
    "category": "機能",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "フォールバック処理",
      "small": "制限環境安全遷移"
    },
    "testCase": "非対応環境検知と閲覧専用モード遷移確認",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-040",
    "scenario": "機能制限のある環境において、例外を発生させずに安全に閲覧専用モードに遷移し警告メッセージが表示されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザの機能が制限された環境であること。",
    "steps": [
      {
        "order": 1,
        "screen": "プレビュー画面",
        "action": "制限環境下でHTMLを開く",
        "expectedResult": "JavaScriptエラーでスクリプトが停止することなく、「message-area」に警告が表示され閲覧専用モードに正常移行すること"
      }
    ],
    "expectedResult": "非対応環境下でのフォールバック制御が働き、安全に閲覧専用モードへと切替が行われること。",
    "testData": "browserRestriction=true",
    "acceptanceCriteria": "システムクラッシュを引き起こさずに閲覧専用モードへ遷移しメッセージが表示されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-068",
    "category": "機能",
    "functionCategory": {
      "large": "ブラウザ互換性・環境検証",
      "medium": "マルチブラウザ動作",
      "small": "互換性検証"
    },
    "testCase": "複数Webブラウザ環境における動作互換性確認",
    "relatedRequirement": "FR-001",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-003"
    ],
    "relatedViewpoint": "STV-L3-065",
    "scenario": "主要な複数のWebブラウザ（Chrome, Firefox, Edge, Safari等）で画面を開き、編集および描画機能が互換性を持って動作することを確認する。",
    "actor": "一般ユーザー",
    "precondition": "各対象Webブラウザが起動可能であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "複数のサポート対象ブラウザでアプリケーションを起動し、「editor」テキスト入力および「canvasWrapper」での描画を行う",
        "expectedResult": "すべてのサポート対象ブラウザでレイアウトの崩れがなく、同等にテキスト編集・お絵描き描画が実行できること"
      }
    ],
    "expectedResult": "特定ブラウザに依存せず、クロスブラウザ環境で機能の互換性が確保されていること。",
    "testData": "targetBrowsers=Chrome,Firefox,Edge,Safari",
    "acceptanceCriteria": "各Webブラウザ上で機能差異や致命的な不具合が発生せずに正常動作すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-069",
    "category": "機能",
    "functionCategory": {
      "large": "スタンドアロン・動作保証",
      "medium": "セキュリティ・オフライン",
      "small": "データ非送信・ローカル保持"
    },
    "testCase": "スタンドアロン・オフライン動作確認",
    "relatedRequirement": "NFR-003",
    "relatedScreens": [
      "SCR-001",
      "SCR-003",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-066",
    "scenario": "オフライン環境およびローカルデータ処理において、データが外部へ送信されずローカル領域のみで安全に管理・保存されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザの開発者ツール（Networkタブ）をモニタリング状態にすること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」への大容量テキスト入力、画像添付、アップデートダイアログでの「実行」操作を行う",
        "expectedResult": "ネットワークログに外部サーバーへのリクエスト（HTTP POST/GET）が一切発生しないクライアント完結動作であること"
      }
    ],
    "expectedResult": "ドキュメント内容やBase64画像データが外部へ一切送信されず、完全なスタンドアロン構造が維持されること。",
    "testData": "networkMonitor=active",
    "acceptanceCriteria": "操作中に外部通信が一切発生せず、クライアントサイドのみでデータ処理が完了すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-070",
    "category": "機能",
    "functionCategory": {
      "large": "画面UIレイアウト",
      "medium": "レスポンシブデザイン",
      "small": "解像度・画面サイズ対応"
    },
    "testCase": "画面サイズ変更・高解像度ディスプレイ表示確認",
    "relatedRequirement": "BR-001",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-003",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-067",
    "scenario": "ウィンドウサイズを可変させたり、高解像度ディスプレイで表示した際に、各画面要素のレイアウトが正しく追従・表示されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "各画面（エディタ、プレビュー、お絵描き、モーダル）が表示可能であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "ブラウザウィンドウの横幅を縮小・拡大し、「toolbar」、「editor」、「previewer」の表示レイアウトを確認する",
        "expectedResult": "ウィンドウサイズ変更に応じて各コンポーネントが伸縮し、ボタンの重なりやテキストの食い込みが発生しないこと"
      }
    ],
    "expectedResult": "画面解像度やウィンドウサイズに関わらず、レスポンシブにUIコンポーネントが正しく配置・表示されること。",
    "testData": "windowWidth=1920->800",
    "acceptanceCriteria": "異なる画面サイズにおいてUIレイアウトが崩れず、操作性が損なわれないこと",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-071",
    "category": "性能",
    "functionCategory": {
      "large": "商品・コンテンツ管理",
      "medium": "マークダウンレンダリング・構文拡張機能",
      "small": "リアルタイムパース性能"
    },
    "testCase": "リアルタイムパースおよびプレビューレンダリングのレスポンス検証",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-006",
    "scenario": "マークダウンエディタ画面でテキストを入力し、プレビュー画面へ300ms以内に更新されるか検証する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザでマークダウンエディタ画面が開かれていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに '[!NOTE]\\nリアルタイム性能テスト' を入力する",
        "expectedResult": "プレビュー画面の「previewer」にGitHubアラート形式のHTML要素が300ms以内に描画更新されること"
      }
    ],
    "expectedResult": "テキスト編集後、300ms以内にプレビュー画面へレンダリング結果が正常に反映されること",
    "testData": "editor='[!NOTE]\\nリアルタイム性能テスト'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-072",
    "category": "性能",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート・データ引き継ぎ機能",
      "small": "大量アセット引き継ぎ負荷検証"
    },
    "testCase": "大量アセット保持時のデータ引き継ぎ処理負荷検証",
    "relatedRequirement": "NFR-007",
    "relatedScreens": [
      "SCR-003",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-007",
    "scenario": "大量のレイヤーコンテンツや添付ファイルを保持した状態からアップデートダイアログ経由でデータ引き継ぎを行い、正常に処理が完了するか検証する。",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面で多数の描画データ（レイヤーコンテンツ）が保存されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "アップデートダイアログ",
        "action": "「kantanVersion」に '1.0.0'、「kantanEdition」に 'std' を選択し、実行ボタンをクリックする",
        "expectedResult": "フリーズすることなくデータが退避され、新バージョンのHTML再構築処理（rewirteHtml）が完了すること"
      }
    ],
    "expectedResult": "大量のアセット情報が存在してもデータが消失せず100%保持・更新されること",
    "testData": "kantanVersion='1.0.0', kantanEdition='std'",
    "acceptanceCriteria": "アプリ更新時に、既存ドキュメント、CSS設定、添付画像データ、レイヤー・トリミング情報が失われずに100%保持・更新されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-073",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "マークダウンエディタ編集機能 (F-001) / GitHubアラート変換機能 (F-004)",
      "small": "編集同期応答速度検証"
    },
    "testCase": "テキスト編集時のプレビュー同期処理時間確認",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-021",
    "scenario": "マークダウンエディタ画面で連続テキスト入力を行い、プレビュー同期処理の時間を計測・確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに '### タイトル\\n[!TIP]\\nヒント情報' を入力する",
        "expectedResult": "プレビュー画面の「previewer」領域の表示が300ms以内に同期されること"
      }
    ],
    "expectedResult": "入力操作に対するプレビューの同期遅延が300ms以内であること",
    "testData": "editor='### タイトル\\n[!TIP]\\nヒント情報'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-074",
    "category": "性能",
    "functionCategory": {
      "large": "グラフィック編集",
      "medium": "お絵描き（ドロワー）描画機能 (F-003)",
      "small": "高密度描画性能検証"
    },
    "testCase": "高密度レイヤーコンテンツ描画時のキャンバスレスポンス確認",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-003"
    ],
    "relatedViewpoint": "STV-L3-022",
    "scenario": "お絵描き画面で高密度の図形描画操作を行い、キャンバスの応答速度および描画レスポンスを確認する。",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面が開かれていること。",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「borderWidth」に '5'、「borderColor」に '#FF0000' を指定し、「canvasWrapper」上で連続ドラッグ操作を行う",
        "expectedResult": "描画線がドラッグ操作に遅延なく追従してメインキャンバスへ描画されること"
      }
    ],
    "expectedResult": "高密度なレイヤー描画を行ってもキャンバスの操作性が低下しないこと",
    "testData": "borderWidth=5, borderColor='#FF0000'",
    "acceptanceCriteria": "高密度なレイヤーコンテンツ操作時においても、大きな描画遅延が発生せず正常に描画できること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-075",
    "category": "性能",
    "functionCategory": {
      "large": "ダイアグラム管理",
      "medium": "マークダウンレンダリング機能・ダイアグラム描画機能",
      "small": "ダイアグラムパース応答性能"
    },
    "testCase": "プレビュー画面のリアルタイム更新応答性能確認",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-031",
    "scenario": "シーケンス図およびフローチャートを含むマークダウンテキストを入力し、ダイアグラム更新の応答性能を検証する。",
    "actor": "一般ユーザー",
    "precondition": "エディタ画面とプレビュー画面が同時表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに 'st=>start: Start\\ne=>end: End\\nst->e' を入力する",
        "expectedResult": "プレビュー画面の「previewer」にSVGフローチャートが300ms以内に生成・表示されること"
      }
    ],
    "expectedResult": "ダイアグラム生成処理を含めて300ms以内にプレビュー表示が更新されること",
    "testData": "editor='st=>start: Start\\ne=>end: End\\nst->e'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-076",
    "category": "性能",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート・データ引き継ぎ機能",
      "small": "アップデート時間計測"
    },
    "testCase": "大量アセットデータ保持状態でのアップデート処理時間確認",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-032",
    "scenario": "大容量データ保持時にアップデートダイアログでアップデートを実行し、処理時間を計測する。",
    "actor": "一般ユーザー",
    "precondition": "エディタ画面に複数枚のBase64画像アセットが読み込まれていること。",
    "steps": [
      {
        "order": 1,
        "screen": "アップデートダイアログ",
        "action": "「importDialog」内で引き継ぎ項目を確認し、「kantanVersion」に '1.1.0' を入力して実行ボタンを押下する",
        "expectedResult": "退避データのHTML書き換えが短時間で実行され、エラーメッセージ等が出力されないこと"
      }
    ],
    "expectedResult": "データ量にかかわらずアップデート処理が円滑に完了すること",
    "testData": "kantanVersion='1.1.0'",
    "acceptanceCriteria": "バージョンアップ時の引き継ぎ処理が完了し、アプリケーションが即座に利用可能状態になること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-077",
    "category": "性能",
    "functionCategory": {
      "large": "システム基盤",
      "medium": "シングルHTML起動・初期ロード",
      "small": "起動性能検証"
    },
    "testCase": "シングルHTML初回読み込み速度検証",
    "relatedRequirement": "NFR-001",
    "relatedScreens": [
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-041",
    "scenario": "Webブラウザで単一HTMLファイルを開き、初期表示および操作可能状態になるまでの到達時間を検証する。",
    "actor": "一般ユーザー",
    "precondition": "Webブラウザが起動可能な状態であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "単一HTMLファイル（ktm-std.html）をWebブラウザで開く",
        "expectedResult": "ファイル起動から1秒以内に「editor」および「toolbar」が初期化され、操作可能状態になること"
      }
    ],
    "expectedResult": "初期ロードおよび操作可能状態の確立が1秒以内に完了すること",
    "testData": "ファイル名='ktm-std.html'",
    "acceptanceCriteria": "一般的なWebブラウザでファイルを開いてから1秒以内に初期表示およびエディタの操作可能状態が完了すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-078",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "リアルタイムパース・レンダリング処理性能",
      "small": "編集同期時間確認"
    },
    "testCase": "マークダウン編集時のリアルタイム同期速度検証",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-042",
    "scenario": "マークダウンエディタ画面での文字入力中に、プレビュー画面とのリアルタイム同期速度を測定する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアへ連続して文字列を入力する",
        "expectedResult": "プレビュー画面の「previewer」に300ms以内のレイテンシでテキストが同期反映されること"
      }
    ],
    "expectedResult": "入力中の同期処理が300ms以内に完了すること",
    "testData": "editor='連続入力テストテキスト'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-079",
    "category": "性能",
    "functionCategory": {
      "large": "システム基盤",
      "medium": "マークダウンエディタ画面 / プレビュー画面",
      "small": "画面起動応答確認"
    },
    "testCase": "初期ロード・起動レスポンス性能確認",
    "relatedRequirement": "NFR-001",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-053",
    "scenario": "アプリケーションのローカル起動時における画面のレンダリング完了速度を検証する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザキャッシュがクリアされた状態であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "HTMLファイルをダブルクリックしてブラウザで表示する",
        "expectedResult": "1秒以内に「editor」テキストエリアおよび「previewer」領域の描画が完了し入力受付可能となること"
      }
    ],
    "expectedResult": "ファイル起動から1秒以内に全画面UIが使用可能状態となること",
    "testData": "ファイル名='ktm-full.html'",
    "acceptanceCriteria": "一般的なWebブラウザでファイルを開いてから1秒以内に初期表示およびエディタの操作可能状態が完了すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-080",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "マークダウンエディタ画面 / プレビュー画面",
      "small": "複合構文パース応答確認"
    },
    "testCase": "リアルタイムパース・レンダリング応答速度確認",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-054",
    "scenario": "コードブロック、GitHubアラート、ダイアグラムを含む複合要素のパース処理時間を検証する。",
    "actor": "一般ユーザー",
    "precondition": "エディタ画面およびプレビュー画面が開いていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」に ```js\\nconsole.log('test');\\n``` および [!IMPORTANT]\\n重要メッセージ を同時入力する",
        "expectedResult": "プレビュー画面「previewer」でコードハイライトおよびGitHubアラートが300ms以内に即時反映されること"
      }
    ],
    "expectedResult": "各種パース拡張機能の全レンダリングが300ms以内に完了すること",
    "testData": "editor='```js\\nconsole.log(\"test\");\\n```\\n[!IMPORTANT]\\n重要メッセージ'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-081",
    "category": "性能",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "マークダウンエディタ画面 / プレビュー画面",
      "small": "大容量ドキュメント処理耐性"
    },
    "testCase": "大規模ドキュメント・高負荷構文処理耐性確認",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-055",
    "scenario": "数千行規模の巨大なマークダウン文書を入力した際、システムがハングアップせず許容性能内で動作するか確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が正常に稼働していること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」テキストエリアに1000行以上のマークダウンテキストを貼り付ける",
        "expectedResult": "ブラウザがフリーズすることなくパースが実行され、「previewer」に表示されること"
      }
    ],
    "expectedResult": "大規模ドキュメント処理時にも画面クラッシュ等の重大な問題が発生しないこと",
    "testData": "editor='1000行のマークダウン本文データ'",
    "acceptanceCriteria": "テキスト編集時、Markdownパース、コードハイライト、GitHubアラート変換、ダイアグラム描画を含めて300ms以内にプレビュー更新されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-082",
    "category": "性能",
    "functionCategory": {
      "large": "データ管理",
      "medium": "マークダウンエディタ画面 / お絵描き画面 / アップデートダイアログ",
      "small": "アセット継承性能検証"
    },
    "testCase": "大容量アセット保持およびデータ継承処理性能確認",
    "relatedRequirement": "NFR-007",
    "relatedScreens": [
      "SCR-001",
      "SCR-003",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-056",
    "scenario": "多数の添付画像およびトリミング・レイヤー情報を含むドキュメントのバージョン更新時の処理性能を検証する。",
    "actor": "一般ユーザー",
    "precondition": "「fileList」に複数の画像アセットが保持されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "アップデートダイアログ",
        "action": "「importDialog」の引き継ぎ項目を有効にし、「kantanEdition」で 'full' を選択して実行ボタンをクリックする",
        "expectedResult": "退避データ（添付ファイル、トリミング情報、レイヤーコンテンツ）の書き換えが正常に終了すること"
      }
    ],
    "expectedResult": "大容量データ移行時もデータ損失なくスムーズに処理が完了すること",
    "testData": "kantanEdition='full'",
    "acceptanceCriteria": "アプリ更新時に、既存ドキュメント、CSS設定、添付画像データ、レイヤー・トリミング情報が失われずに100%保持・更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-083",
    "category": "性能",
    "functionCategory": {
      "large": "システム基盤",
      "medium": "システム全体 / Gruntビルド環境",
      "small": "メモリ・リソース消費確認"
    },
    "testCase": "連続編集操作時のメモリ・リソース消費確認",
    "relatedRequirement": "NFR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-003",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-057",
    "scenario": "長時間にわたる連続的なマークダウン編集およびお絵描き描画操作において、メモリリーク等の問題が発生しないか検証する。",
    "actor": "一般ユーザー",
    "precondition": "エディタ画面およびお絵描き画面が利用可能な状態であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」での編集、「canvasWrapper」での図形描画、「cssEditor」への入力操作を繰り返し30分間実行する",
        "expectedResult": "メモリ消費量が著しく増大することなく、レスポンス速度が維持されること"
      }
    ],
    "expectedResult": "連続操作を行ってもシステムリソースが安定して維持されること",
    "testData": "editor='連続操作用テキスト', borderWidth=3, cssEditor='body { color: red; }'",
    "acceptanceCriteria": "長時間連続編集時においても、著しいパフォーマンス低下やメモリリークが発生しないこと",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-084",
    "category": "性能",
    "functionCategory": {
      "large": "ビルド・運用",
      "medium": "システム全体 / Gruntビルド環境",
      "small": "ビルドバッチ負荷検証"
    },
    "testCase": "パッケージング・ビルドバッチ処理負荷確認",
    "relatedRequirement": "NFR-006",
    "relatedScreens": [],
    "relatedViewpoint": "STV-L3-058",
    "scenario": "Gruntfileを通じてマルチエディションビルドを実行し、ビルド処理にかかる時間と負荷を計測検証する。",
    "actor": "管理者",
    "precondition": "Node.js環境およびGrunt実行環境が構築されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "コマンドラインにて 'grunt build' コマンドを実行する",
        "expectedResult": "Dev/Lite/Std/Fullなどのエディションファイルおよび kantanUpdate.js がエラーなく一定時間内に自動生成されること"
      }
    ],
    "expectedResult": "Gruntビルドタスクが過度な遅延なく正常終了し、各成果物HTMLが作成されること",
    "testData": "コマンド='grunt build'",
    "acceptanceCriteria": "Gruntビルドコマンドにより、Dev/Lite/Std/Fullなどの指定エディションの単一HTMLファイルおよび更新JSがエラーなく生成されること",
    "priority": "中",
    "testType": "自動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-085",
    "category": "障害",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "非対応環境フォールバック"
    },
    "testCase": "編集非対応環境における閲覧専用モードへの安全な遷移確認",
    "relatedRequirement": "NFR-004",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-008",
    "scenario": "Blob利用不可などの編集非対応環境でシステムを起動した際、クラッシュせずに閲覧専用モードに切り替わり警告メッセージが表示されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザのBlob APIが無効化された非対応動作環境であること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "Blob利用不可環境でアプリケーションを起動する",
        "expectedResult": "message-areaに警告メッセージが表示され、toolbarの操作ボタンが無効化されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "画面表示状態を確認する",
        "expectedResult": "システムクラッシュを起こさずに閲覧専用モード画面としてプレビューコンテンツが表示されること"
      }
    ],
    "expectedResult": "システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告メッセージが表示されること",
    "testData": "動作環境=Blob API無効化ブラウザ",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-086",
    "category": "障害",
    "functionCategory": {
      "large": "プレビュー表示",
      "medium": "ダイアグラム描画機能",
      "small": "構文パースエラーハンドリング"
    },
    "testCase": "不正なダイアグラム・アラート構文入力時のエラーハンドリング確認",
    "relatedRequirement": "FR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-009",
    "scenario": "エディタ領域に文法的に不正なシーケンス図またはGitHubアラート記述を入力した際、システムがエラーで終了せず適切にハンドリングされることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が開かれていること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "editorに不正なダイアグラム構文 'sequenceDiagram\\n A->' を入力する",
        "expectedResult": "プレビュー画面へリアルタイム同期が実行される"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "previewerの表示内容を確認する",
        "expectedResult": "画面がフリーズすることなく、エラー状態を検知して安全にプレビュー描画処理が維持されること"
      }
    ],
    "expectedResult": "不正な構文が入力されてもシステムエラーを発生させず安全に例外が処理されること",
    "testData": "editor=sequenceDiagram\\n A->",
    "acceptanceCriteria": "不正なダイアグラム構文入力時にシステムクラッシュせず安全にフォールバック表示されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-087",
    "category": "障害",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "例外ハンドリング"
    },
    "testCase": "制限環境下におけるフォールバック制御・安全停止確認",
    "relatedRequirement": "NFR-004",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-023",
    "scenario": "非対応Safari等の制限環境で起動した場合、操作ボタンが無効化され安全にシステムがフォールバックされることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "非対応Safariブラウザ環境でアプリケーションが実行されていること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "非対応Safari環境でアプリケーションを開く",
        "expectedResult": "message-areaに警告メッセージが表示され、toolbar内のすべての編集・保存操作ボタンが無効状態になること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "editor領域へのテキスト入力を試みる",
        "expectedResult": "編集不可と判断され閲覧専用モードが維持されること"
      }
    ],
    "expectedResult": "制限環境下でツールバーおよびエディタ操作が適切に制御され、安全に閲覧専用モードへ遷移すること",
    "testData": "UserAgent=非対応Safari",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-088",
    "category": "障害",
    "functionCategory": {
      "large": "プレビュー表示",
      "medium": "GitHubアラート変換機能",
      "small": "不正入力処理"
    },
    "testCase": "不整形式アラート記述入力時の回復・描画確認",
    "relatedRequirement": "FR-004",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-024",
    "scenario": "閉じカッコが欠損した [!NOTE などの不整形式なアラート識別子を入力した場合、システムエラーとならず通常引用ブロックとして描画されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が表示されていること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "editor領域に '> [!NOTE 補足テキスト' を入力する",
        "expectedResult": "プレビュー画面へ即座に反映される"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "previewerの描画内容を確認する",
        "expectedResult": "GitHubアラート要素へ変換されず、通常のblockquoteとして安全にHTML変換・表示されること"
      }
    ],
    "expectedResult": "不整形式の入力であってもアプリケーションが正常に描画処理を回復・継続すること",
    "testData": "editor=> [!NOTE 補足テキスト",
    "acceptanceCriteria": "構文異常時にエラーで画面表示が中断せず、通常の引用ブロックとして可視化されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-089",
    "category": "障害",
    "functionCategory": {
      "large": "プレビュー表示",
      "medium": "ダイアグラム描画機能",
      "small": "堅牢性検証"
    },
    "testCase": "ダイアグラム構文エラー時のフォールバックおよびエラーハンドリング確認",
    "relatedRequirement": "FR-006",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-033",
    "scenario": "フローチャートパース時に未定義ノード参照などの構文エラーを含む記述を入力した際、描画スクリプトの例外がハンドリングされることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が開かれていること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "editorに 'st=>start: Start\\ne=>end: End\\nst->undefined_node' を入力する",
        "expectedResult": "フローチャートパース処理が起動する"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "previewer領域の表示状態を確認する",
        "expectedResult": "SVG描画処理の例外によりレイアウト崩れや画面フリーズが発生せず、安全にフォールバック表示されること"
      }
    ],
    "expectedResult": "フローチャート構文エラー発生時にプレビュー画面全体の表示が破綻せず保護されること",
    "testData": "editor=st=>start: Start\\ne=>end: End\\nst->undefined_node",
    "acceptanceCriteria": "ダイアグラムパース例外発生時にもプレビュー描画領域が安全に保護されエラーハンドリングされること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-090",
    "category": "障害",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート・データ引き継ぎ機能",
      "small": "異常系リカバリ"
    },
    "testCase": "バージョン更新キャンセルおよびデータ退避失敗時の安全制御確認",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-001",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-034",
    "scenario": "アップデートダイアログで「キャンセル」を選択した場合、およびデータ退避処理が中断された場合に既存コンテンツが保持されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "エディタ画面にマークダウンテキストおよび添付ファイルデータが存在すること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "toolbarのアップデートボタンを押下する",
        "expectedResult": "アップデートダイアログ（SCR-004）のimportDialogが表示される"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "dialogActions内のキャンセルボタンを押下する",
        "expectedResult": "ダイアログが閉じ、マークダウンエディタ画面へ復帰する"
      },
      {
        "order": 3,
        "screen": "マークダウンエディタ画面",
        "action": "editorおよびfileListの保持状態を確認する",
        "expectedResult": "操作前のマークダウンテキスト、添付ファイル、トリミング情報、レイヤーコンテンツが破棄されず100%保持されていること"
      }
    ],
    "expectedResult": "アップデート処理のキャンセル・中断時にデータが失われず、エディタの状態が完全復元されること",
    "testData": "kantanVersion=1.0.0, kantanEdition=std, editor=# テストドキュメント",
    "acceptanceCriteria": "アプリ更新処理のキャンセル時に既存データが損失せず元状態が正常に保持されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-091",
    "category": "障害",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "制限環境検証"
    },
    "testCase": "ブラウザ機能制限における安全なフォールバック確認",
    "relatedRequirement": "NFR-004",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-043",
    "scenario": "ストレージアクセスやファイル操作に制限が適用された環境でアプリを実行した際、例外エラーを回避して安全に閲覧専用モードへ移行することを確認する。",
    "actor": "一般ユーザー",
    "precondition": "ローカルストレージおよびBlob生成がブロックされた制限ブラウザ環境",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "機能制限環境下でアプリケーションを読み込む",
        "expectedResult": "ブラウザの対応状況チェックが実行され、閲覧専用モード制御が適用される"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "message-areaおよびpreviewerの表示状態を確認する",
        "expectedResult": "編集不可の警告メッセージが表示され、コンテンツが閲覧専用として安全に可視化されること"
      }
    ],
    "expectedResult": "ブラウザ機能制限環境でシステムクラッシュが発生せず、安全にフォールバック遷移すること",
    "testData": "制限設定=LocalStorageアクセス拒否 / Blob生成制限",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-092",
    "category": "障害",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "非対応環境フォールバック"
    },
    "testCase": "Blob非対応・非対応Safari環境における安全なフォールバック確認",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-063",
    "scenario": "Blob APIが利用できない環境または非対応Safariで起動した場合、システムがクラッシュすることなく閲覧専用モードへ100%安全に切替が行われることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "Blob利用不可または非対応Safariの動作環境であること",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "非対応動作環境においてアプリケーションを読み込む",
        "expectedResult": "動作環境判定が行われ、toolbar内の各操作ボタンが無効化される"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "message-areaの警告表示および表示動作を確認する",
        "expectedResult": "警告メッセージが正しく表示され、スクリプトエラーを起こさずに閲覧専用表示が維持されること"
      }
    ],
    "expectedResult": "Blob非対応環境でシステムクラッシュを起こさず100%安全に閲覧専用モードに切り替わること",
    "testData": "UserAgent=非対応Safari環境",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-093",
    "category": "障害",
    "functionCategory": {
      "large": "グラフィック編集",
      "medium": "お絵描き（ドロワー）描画機能",
      "small": "エラーハンドリング"
    },
    "testCase": "構文解析エラー・例外データ入力時のエラーハンドリング確認",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-002",
      "SCR-003"
    ],
    "relatedViewpoint": "STV-L3-064",
    "scenario": "お絵描き画面にて不正な線幅（負の値）や無効なカラーコードを入力して描画を行った際、コンテキストエラーで停止せず安全にデフォルト描画が適用されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面（SCR-003）が表示されていること",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "borderWidthに '-5' を入力し、borderColorに 'INVALID_COLOR' を入力する",
        "expectedResult": "スタイルの更新試行が行われる"
      },
      {
        "order": 2,
        "screen": "お絵描き画面",
        "action": "canvasWrapper上でドラッグ操作を行いキャンバスに線を描画する",
        "expectedResult": "JavaScriptエラーでアプリが停止することなく、安全な初期パラメータまたはデフォルト値で描画が正常に行われること"
      }
    ],
    "expectedResult": "例外データが入力された場合でもシステムが停止せず、ハンドリングされて処理が継続すること",
    "testData": "borderWidth=-5, borderColor=INVALID_COLOR, fillColor=#000000",
    "acceptanceCriteria": "例外データ入力時に描画コンテキストが破損することなく安全にエラーハンドリングされること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-094",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "基本編集機能",
      "small": "インジェクション対策"
    },
    "testCase": "マークダウンエディタ画面におけるスクリプトタグ入力時の実行防止検証",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-010",
    "scenario": "エディタ画面で悪意のあるスクリプトタグを含むマークダウンを入力し、プレビュー表示やダイアログ表示においてスクリプトが実行されないことを確認する。",
    "actor": "一般ユーザー",
    "precondition": "アプリケーションがWebブラウザで正常に起動し、マークダウンエディタ画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '<script>alert(\"XSS\")</script>' を入力する",
        "expectedResult": "入力したテキストが「editor」フィールドに保持され、JavaScriptダイアログが発火しないこと"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」表示領域を確認する",
        "expectedResult": "スクリプトが実行されず、文字列としてサニタイズされた状態（またはエスケープされた状態）で表示されること"
      }
    ],
    "expectedResult": "入力されたスクリプトが実行されず、クライアントローカル環境で安全に無害化処理が行われること",
    "testData": "editor='<script>alert(\"XSS\")</script>'",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-095",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "基本編集機能",
      "small": "外部通信検証"
    },
    "testCase": "マークダウン編集操作時における外部ネットワーク非通信の確認",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-025",
    "scenario": "ブラウザの開発者ツールを開いた状態でマークダウンの入力・編集を行い、外部サーバーへのHTTP/HTTPSリクエストが発生しないことを検証する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザの開発者ツール（ネットワークタブ）が開かれた状態で、マークダウンエディタ画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '# テスト文書\\nテキスト入力' を入力する",
        "expectedResult": "「editor」に入力テキストが即座に反映され、ネットワークタブに新しい外部非同期通信（XHR/Fetch等）が発生しないこと"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」表示領域のレンダリング結果を確認する",
        "expectedResult": "リアルタイムにプレビューが更新され、外部リソースへのアクセスが発生しないこと"
      }
    ],
    "expectedResult": "編集・レンダリング処理が完全にクライアント内で完結し、外部ネットワークへの通信が一切発生しないこと",
    "testData": "editor='# テスト文書\\nテキスト入力'",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-096",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "GitHubアラート変換",
      "small": "XSSサニタイズ"
    },
    "testCase": "GitHubアラート要素変換時におけるHTML属性・スクリプト無害化検証",
    "relatedRequirement": "FR-004",
    "relatedScreens": [
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-026",
    "scenario": "GitHubアラート記述内にイベントハンドラを含む悪意あるHTMLタグを入力し、アラート要素へ変換された際に無害化されるか確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が開かれており、プレビュー画面と連動していること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '> [!NOTE]\\n> <img src=\"x\" onerror=\"alert(1)\">' を入力する",
        "expectedResult": "プレビュー画面にGitHubアラート形式（Note）の枠組みがレンダリングされること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」領域内のGitHubアラート表示を確認する",
        "expectedResult": "onerrorイベントによるJavaScriptダイアログが実行されず、HTML属性がサニタイズされていること"
      }
    ],
    "expectedResult": "GitHubアラートのパース・レンダリング時にスクリプト注入攻撃が無効化されること",
    "testData": "editor='> [!NOTE]\\n> <img src=\"x\" onerror=\"alert(1)\">'",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-097",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "マークダウンレンダリング",
      "small": "XSSサニタイズ"
    },
    "testCase": "プレビュー表示におけるHTML要素無害化とスクリプト実行防止の確認",
    "relatedRequirement": "FR-007",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-035",
    "scenario": "iframeタグやonload属性など多彩なXSSベクトルを含むマークダウンを入力し、プレビュー画面で安全に無害化されることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '<iframe src=\"javascript:alert(1)\"></iframe>' を入力する",
        "expectedResult": "「editor」にテキストが入力されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」領域のDOM構造と描画結果を確認する",
        "expectedResult": "iframe内のJavaScriptが実行されず、安全なプレビューが表示されること"
      }
    ],
    "expectedResult": "不正なHTML/JavaScript要素がレンダリング時にサニタイズされ、XSS攻撃が遮断されること",
    "testData": "editor='<iframe src=\"javascript:alert(1)\"></iframe>'",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-098",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート",
      "small": "ローカルデータ保護"
    },
    "testCase": "アップデートダイアログ実行時の引き継ぎデータ保護とクライアント完結性確認",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-036",
    "scenario": "アプリケーションのバージョンアップデート処理を実行する際、退避・引き継がれるデータが外部へ送信されずローカルメモリ/ストレージ内で安全に処理されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウン、CSS、添付画像データ（Base64）がセットされた状態でアップデートダイアログが表示されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "アップデートダイアログ",
        "action": "「kantanEdition」で 'std' を選択し、「dialogActions」の実行ボタンを押下する",
        "expectedResult": "HTMLの再構築（rewirteHtml）が開始され、外部サーバーとの非同期通信が発生しないこと"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "アップデート完了後の画面遷移とデータ保持状態を確認する",
        "expectedResult": "外部ネットワークへデータが漏洩することなく、マークダウン、CSS、添付ファイルが100%引き継がれていること"
      }
    ],
    "expectedResult": "バージョンアップデート時のデータ引き継ぎ処理がすべてローカル環境で安全に実行されること",
    "testData": "kantanVersion='1.0.0', kantanEdition='std'",
    "acceptanceCriteria": "外部サーバーへの通信なしで、編集・プレビュー・画像添付・お絵描き・データ保存の機能が100%正常に動作すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-099",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "スタンドアロン動作",
      "small": "外部送信防止"
    },
    "testCase": "オフライン環境における全機能実行とデータ非送信の検証",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-003",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-044",
    "scenario": "端末のネットワーク接続をオフライン（機内モード等）にした状態でエディタ・ドロワー・設定機能を利用し、全機能がエラーなくクライアント完結で動作することを確認する。",
    "actor": "一般ユーザー",
    "precondition": "Webブラウザがオフライン状態に設定されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに文章を入力し、「toolbar」のお絵描き起動ボタンを押下する",
        "expectedResult": "エラーが発生せずに「お絵描き画面」へ遷移すること"
      },
      {
        "order": 2,
        "screen": "お絵描き画面",
        "action": "キャンバス上に描画を行い、確定・保存ボタンを押下する",
        "expectedResult": "描画データがレイヤーコンテンツとして保存され、マークダウンエディタ画面に戻ること"
      }
    ],
    "expectedResult": "外部通信を一切必要とせず、すべての編集・描画機能がクライアント完結で安全に動作すること",
    "testData": "borderWidth=2, borderColor='#000000', fillColor='#FFFFFF'",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-100",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "スタンドアロン動作",
      "small": "通信遮断検証"
    },
    "testCase": "全画面操作時における外部ネットワーク通信発生遮断検証",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-003",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-046",
    "scenario": "エディタ入力、プレビュー表示、ドロワー描画、アップデートダイアログ操作、設定変更の一連の全画面操作において、リクエストパケットの外部送信が発生しないことを検証する。",
    "actor": "一般ユーザー",
    "precondition": "パケットキャプチャまたはブラウザ開発者ツールのログ取得が有効になっていること。",
    "steps": [
      {
        "order": 1,
        "screen": "設定画面",
        "action": "「setting-expand-tab」のチェックボックスをONにし、「cssEditor」に 'body { color: red; }' を入力する",
        "expectedResult": "設定変更が即座に反映され、外部通信ログが記録されないこと"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」でTabキーを入力しインデント操作を行う",
        "expectedResult": "スペースが挿入され、通信リクエストが0件であることを確認できること"
      }
    ],
    "expectedResult": "アプリ内のどの画面・機能操作においても外部へのパケット送信が100%遮断されていること",
    "testData": "setting-expand-tab=true, cssEditor='body { color: red; }'",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-101",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "データ保持",
      "small": "アセット保護"
    },
    "testCase": "ローカル保持アセットデータ（Base64・トリミング・レイヤー）の漏洩防止検証",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-047",
    "scenario": "fileListにて管理される画像Base64データやレイヤーコンテンツが、ブラウザのローカルメモリ外や認可されていない領域へ露出・送信されないか確認する。",
    "actor": "一般ユーザー",
    "precondition": "「fileList」に複数の添付画像およびトリミング情報、レイヤーコンテンツが保持されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「fileList」コンポーネントで添付ファイルの情報を更新・参照する操作を行う",
        "expectedResult": "アセットデータがメモリ上で正常に保持され、第三者の外部APIやサーバーへ自動送信されないこと"
      }
    ],
    "expectedResult": "ローカルアセット情報が外部に流出せず、クライアント環境内部のみで安全にカプセル化されて保持されること",
    "testData": "fileList='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-102",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "データ保持",
      "small": "情報漏洩防止"
    },
    "testCase": "大容量添付ファイルおよびカスタムCSS処理における通信遮断・情報漏洩防止検証",
    "relatedRequirement": "NFR-005",
    "relatedScreens": [
      "SCR-001",
      "SCR-003",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-059",
    "scenario": "大容量の添付画像や複雑なカスタムCSSをエディタおよび設定画面に保持させた状態で、データ管理処理（保存・更新）を行い、漏洩や外部送信がないことを確認する。",
    "actor": "一般ユーザー",
    "precondition": "大容量テキストおよび複数の添付アセットがセットされていること。",
    "steps": [
      {
        "order": 1,
        "screen": "設定画面",
        "action": "「cssEditor」に長大なカスタムCSSを入力し、「SCR-001」へ戻る",
        "expectedResult": "プレビュー画面のスタイルが更新され、通信は一切発生しないこと"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "「importDialog」で引き継ぎを実行し、処理中の通信ログを監視する",
        "expectedResult": "すべてのデータが外部へ開示・送信されることなく、ローカルで再構築が完了すること"
      }
    ],
    "expectedResult": "保持されているアセットや入力データが外部ネットワークへ漏洩することなく100%安全に保護されること",
    "testData": "cssEditor='/* 大容量CSS設定 */ h1 { color: blue; }'",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-103",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "マークダウン管理",
      "medium": "マークダウンレンダリング",
      "small": "構文パース無害化"
    },
    "testCase": "ダイアグラムおよびコードブロック構文パース時の無害化（サニタイズ）検証",
    "relatedRequirement": "FR-007",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-060",
    "scenario": "シーケンス図、フローチャート、コードブロックの定義記述の中にスクリプトタグや悪意ある属性を注入し、パース時に無害化されることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面が表示され、リアルタイムプレビューが有効であること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドに '```javascript\\nconsole.log(\"<img src=x onerror=alert(1)>\");\\n```' を入力する",
        "expectedResult": "コード構文ハイライト機能（Highlight.js）によりコードブロックが整形されること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "「previewer」領域のコードブロック描画内容を確認する",
        "expectedResult": "コードブロック内のHTMLタグがエスケープ表示され、onerrorイベントが実行されないこと"
      }
    ],
    "expectedResult": "特殊構文パース処理を通じたスクリプト注入攻撃が適切にエスケープされ無害化されること",
    "testData": "editor='```javascript\\nconsole.log(\"<img src=x onerror=alert(1)>\");\\n```'",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-104",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "設定管理",
      "medium": "スタイル設定",
      "small": "CSSバリデーション"
    },
    "testCase": "お絵描き画面および設定画面におけるスタイル設定値のバリデーション検証",
    "relatedRequirement": "FR-003",
    "relatedScreens": [
      "SCR-003",
      "SCR-004",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-061",
    "scenario": "お絵描き画面のCSSカラー設定値や設定画面のカスタムCSSに、JavaScript実行を試みる不正な文字列（'expression(...)'や'url(javascript:...)'等）を入力した際の安全性を確認する。",
    "actor": "一般ユーザー",
    "precondition": "お絵描き画面または設定画面が開かれていること。",
    "steps": [
      {
        "order": 1,
        "screen": "お絵描き画面",
        "action": "「styleControls」の「borderColor」フィールドに 'javascript:alert(1)' を入力する",
        "expectedResult": "描画コンテキストで無効な色指定として処理されるか無視され、スクリプトが実行されないこと"
      },
      {
        "order": 2,
        "screen": "設定画面",
        "action": "「cssEditor」フィールドに 'body { background: url(\"javascript:alert(1)\"); }' を入力する",
        "expectedResult": "プレビュー適用時にスクリプトが実行されず、無効化されること"
      }
    ],
    "expectedResult": "スタイル入力値に対する安全性の確保により、CSSインジェクションやスクリプト実行が防がれること",
    "testData": "borderColor='javascript:alert(1)', cssEditor='body { background: url(\"javascript:alert(1)\"); }'",
    "acceptanceCriteria": "ドキュメント内容および添付ファイル（Base64等）が外部ネットワークへ送信されないクライアント完結構造を維持すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-105",
    "category": "セキュリティ",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード",
      "small": "アクセス制限"
    },
    "testCase": "非対応ブラウザ・制限環境下における編集機能・操作ボタンアクセス制限検証",
    "relatedRequirement": "FR-002",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-062",
    "scenario": "Blobが利用できないなどの非対応ブラウザ環境をエミュレートした状態でアプリを起動し、編集機能や保存用操作ボタンへのアクセスが確実に制限されることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "ブラウザ環境変数でBlob APIを無効化または非対応環境としてシミュレートしていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "アプリケーションの初期ロードを実行する",
        "expectedResult": "「message-area」に閲覧専用モードの警告メッセージが表示され、「toolbar」内の編集・保存関連ボタンが無効化（disabled）されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "「editor」フィールドをクリックして直接文字入力を試みる",
        "expectedResult": "テキストエリアが読み取り専用（readonly）状態になっており、不正な編集操作が防御されること"
      }
    ],
    "expectedResult": "制限環境下において編集機能へのアクセスが安全に制御され、閲覧専用モードへ確実にフォールバックすること",
    "testData": "environment='Blob_Unavailable'",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-106",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート・データ引き継ぎ機能",
      "small": "データ引継ぎ完全性検証"
    },
    "testCase": "アプリ更新運用におけるコンテンツデータ引継ぎ完全性の実証",
    "relatedRequirement": "NFR-007",
    "relatedScreens": [
      "SCR-004",
      "SCR-001"
    ],
    "relatedViewpoint": "STV-L3-011",
    "scenario": "ユーザーが旧バージョンでマークダウンテキスト、カスタムCSS、添付ファイルおよび描画コンテンツを保存した状態でアップデートダイアログから更新を実行し、データが100%保持されて新バージョンへ引き継がれることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "エディタ画面（SCR-001）のeditorにテキストが入力され、fileListに添付ファイル・トリミング情報・レイヤーコンテンツが存在し、設定画面（SCR-005）のcssEditorにカスタムCSSが入力されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "toolbarの「アップデート」ボタンをクリックする",
        "expectedResult": "アップデートダイアログ（SCR-004）が開かれ、importDialogに現在のバージョンとエディション情報が表示されること"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "引き継ぎ対象項目を確認し、dialogActionsの「実行」ボタンをクリックする",
        "expectedResult": "データ引き継ぎ処理（rewirteHtml）が完了し、マークダウンエディタ画面（SCR-001）へ遷移すること"
      },
      {
        "order": 3,
        "screen": "マークダウンエディタ画面",
        "action": "editorの記述内容およびfileListの添付ファイル、トリミング情報、レイヤーコンテンツを確認する",
        "expectedResult": "更新前のマークダウンテキスト、CSS設定、添付画像データ、レイヤー・トリミング情報が失われずに100%保持・表示されていること"
      }
    ],
    "expectedResult": "アプリ更新時に既存のマークダウンテキスト、CSS設定、添付画像データ、レイヤー・トリミング情報が100%引き継がれ正常に動作すること",
    "testData": "editor='# Title\\nSample Content', cssEditor='body { background: #fff; }', kantanVersion='1.0.0', kantanEdition='std'",
    "acceptanceCriteria": "アプリ更新時に、既存ドキュメント、CSS設定、添付画像データ、レイヤー・トリミング情報が失われずに100%保持・更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-107",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "利用モード制御",
      "medium": "閲覧専用モード判定・制御機能",
      "small": "閲覧専用モード移行シナリオ"
    },
    "testCase": "通常編集モードから閲覧専用モードへの表示・操作移行確認",
    "relatedRequirement": "BR-006",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-027",
    "scenario": "Blob利用不可などの編集非対応ブラウザ環境でアプリケーションを起動し、警告メッセージの表示とともに閲覧専用モードへ自動切り替えが行われ、ツールバー等の編集操作が適切に無効化されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "Blob APIが使用不可に制限されたWebブラウザ環境で単一HTMLを開くこと。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "非対応ブラウザ環境でマークダウンエディタ画面（SCR-001）をロードする",
        "expectedResult": "画面上部のmessage-areaに「編集非対応環境のため閲覧専用モードで起動しました」などの警告メッセージが表示されること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "toolbarの各操作ボタンおよびeditor領域をクリック・キー入力操作する",
        "expectedResult": "toolbarのボタン群が無効化（disabled）されており、editorテキストエリアでの編集操作が受け付けられないこと"
      },
      {
        "order": 3,
        "screen": "プレビュー画面",
        "action": "プレビュー画面（SCR-002）のpreviewer領域を確認する",
        "expectedResult": "既存のマークダウンテキストから変換されたHTMLコンテンツが正しく構造化表示されていること"
      }
    ],
    "expectedResult": "編集非対応環境を検知した場合、システムクラッシュを起こさずに閲覧専用モードへ遷移し、警告表示と編集制御が正常に行われること",
    "testData": "ブラウザ環境=Blob利用不可設定",
    "acceptanceCriteria": "Blob利用不可等の制限環境下において、システムクラッシュを起こさずに閲覧専用モードへ100%安全に遷移し、警告を表示すること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-108",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート・データ引き継ぎ機能",
      "small": "コンテンツ完全移行シナリオ"
    },
    "testCase": "旧バージョン作成コンテンツ（ダイアグラム・アラート含む）の新バージョンへのデータ完全移行確認",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-037",
    "scenario": "シーケンス図、フローチャート、GitHubアラート等の拡張構文を含む旧バージョンのドキュメントを新バージョンへアップデート処理し、データ保持および再レンダリングが正しく完了することを確認する。",
    "actor": "一般ユーザー",
    "precondition": "旧バージョンのエディタ上に、シーケンス図（Diagram）、フローチャート（st=>start）、GitHubアラート（[!NOTE]）の構文が記述されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "toolbarの「アップデート」ボタンをクリックしてアップデートダイアログ（SCR-004）を表示させる",
        "expectedResult": "アップデートダイアログが表示され、現在のバージョン・エディションが確認できること"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "引き継ぎ選択項目でマークダウン原稿・CSS・添付ファイルを選択し、dialogActionsの「実行」ボタンを押下する",
        "expectedResult": "HTMLの再構築（rewirteHtml）が実行され、データの引継ぎが成功してエディタ画面へ閉じること"
      },
      {
        "order": 3,
        "screen": "プレビュー画面",
        "action": "プレビュー画面（SCR-002）のpreviewer表示領域を確認する",
        "expectedResult": "引き継がれたマークダウンテキストに基づき、シーケンス図・SVGフローチャート・GitHubアラートアイコン付きブロックが崩れずにプレビュー描画されること"
      }
    ],
    "expectedResult": "旧バージョンで作成されたダイアグラムやアラート等の各種拡張表現データが失われることなく新バージョンへ移行され、正常にパース・描画されること",
    "testData": "editor='> [!NOTE]\\n> test\\n\\nAlice->Bob: Hello\\n\\nst=>start: Start'",
    "acceptanceCriteria": "アプリ更新時に、既存ドキュメント、CSS設定、添付画像データ、レイヤー・トリミング情報が失われずに100%保持・更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-109",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "ビルド管理",
      "medium": "マルチエディションビルド・パッケージング機能",
      "small": "Gruntビルドパイプライン検証"
    },
    "testCase": "Gruntビルドパイプライン全タスクの正常実行検証",
    "relatedRequirement": "FR-010",
    "relatedScreens": [],
    "relatedViewpoint": "STV-L3-045",
    "scenario": "開発運用においてGruntのビルドコマンドを実行し、clean, copy, cssmin, uglify, inline, replace等のパイプラインタスクがエラーなく完走することを確認する。",
    "actor": "管理者",
    "precondition": "Node.js環境およびGrunt CLIが適切にセットアップされており、ソースコードがsrcディレクトリに配置されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "CLI / コンソール",
        "action": "ターミナル上で 'grunt build' コマンドを実行する",
        "expectedResult": "ビルドタスク（build-dev, build-lite, build-std, build-full, build-updateJs）が順次実行され、エラーメッセージが出力されないこと"
      },
      {
        "order": 2,
        "screen": "ファイルシステム",
        "action": "dist/ ディレクトリ配下の生成ファイル（ktm-dev.html, ktm-lite.html, ktm-std.html, ktm-full.html, kantanUpdate.js）を確認する",
        "expectedResult": "指定されたすべての成果物ファイルがdist/ディレクトリに正しく生成されていること"
      }
    ],
    "expectedResult": "Gruntビルドコマンドにより、エラーなく全エディションのファイル群が自動生成・パッケージングされること",
    "testData": "実行コマンド='grunt build'",
    "acceptanceCriteria": "Gruntビルドコマンドにより、Dev/Lite/Std/Fullなどの指定エディションの単一HTMLファイルおよび更新JSがエラーなく生成されること",
    "priority": "中",
    "testType": "自動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-110",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "ビルド管理",
      "medium": "マルチエディションビルド・パッケージング機能",
      "small": "単一HTML生成検証"
    },
    "testCase": "エディション別（dev, lite, std, full）単一HTML生成およびブラウザ動作検証",
    "relatedRequirement": "NFR-006",
    "relatedScreens": [
      "SCR-001",
      "SCR-002"
    ],
    "relatedViewpoint": "STV-L3-048",
    "scenario": "ビルド生成された各エディション（dev, lite, std, full）の単一HTMLファイルをブラウザでそれぞれ開き、埋め込まれたスクリプトや機能制限に応じて期待通りに機能することを確認する。",
    "actor": "管理者",
    "precondition": "'grunt build' コマンドにより dist/ 配下に各エディションの単一HTMLファイルが生成済みであること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "ブラウザで 'dist/ktm-lite.html' を開き、editor領域にダイアグラム構文を入力する",
        "expectedResult": "liteエディション定義に基づき、ダイアグラム用JS（sequence-diagrams等）が削除されているためダイアグラムが描画されないこと"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "ブラウザで 'dist/ktm-full.html' を開き、editor領域にダイアグラム構文（'Alice->Bob: Hi'）を入力する",
        "expectedResult": "fullエディション定義に基づき、すべてのライブラリがインライン化されており、プレビュー画面（SCR-002）にシーケンス図が正常描画されること"
      }
    ],
    "expectedResult": "各エディション（dev, lite, std, full）に応じた単一HTMLファイルが正しく独立動作すること",
    "testData": "対象ファイル=['dist/ktm-lite.html', 'dist/ktm-full.html']",
    "acceptanceCriteria": "Gruntビルドコマンドにより、Dev/Lite/Std/Fullなどの指定エディションの単一HTMLファイルおよび更新JSがエラーなく生成されること",
    "priority": "中",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-111",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "ビルド管理",
      "medium": "マルチエディションビルド・パッケージング機能",
      "small": "アップデートJSビルド検証"
    },
    "testCase": "アップデート用JavaScript（kantanUpdate.js）ビルドおよびスクリプト生成検証",
    "relatedRequirement": "FR-010",
    "relatedScreens": [
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-049",
    "scenario": "ビルドタスク 'build-updateJs' を実行し、既存HTMLの再構築・更新処理に必要な 'kantanUpdate.js' が問題なく出力され、構文エラーがないことを検証する。",
    "actor": "管理者",
    "precondition": "Gruntfile.jsに 'build-updateJs' タスクが定義されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "CLI / コンソール",
        "action": "ターミナル上で 'grunt build-updateJs' を実行する",
        "expectedResult": "タスクが正常に完了し、'dist/kantanUpdate.js' が生成されること"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "生成された 'kantanUpdate.js' をスクリプトタグとして読み込んだ状態でアップデートダイアログ（SCR-004）の「実行」ボタンをクリックする",
        "expectedResult": "kantanUpdate.js内のデータ退避およびHTML書き換えロジックが正常に呼び出され、エラーなく完了すること"
      }
    ],
    "expectedResult": "更新用JS（kantanUpdate.js）が正常にビルドされ、アップデート時のデータ引き継ぎスクリプトとして機能すること",
    "testData": "実行タスク='grunt build-updateJs', 生成ファイル='dist/kantanUpdate.js'",
    "acceptanceCriteria": "Gruntビルドコマンドにより、Dev/Lite/Std/Fullなどの指定エディションの単一HTMLファイルおよび更新JSがエラーなく生成されること",
    "priority": "中",
    "testType": "自動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-112",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート・データ引き継ぎ機能",
      "small": "ダイアログデータ移行検証"
    },
    "testCase": "アップデートダイアログ経由のデータ移行および再構築（rewirteHtml）検証",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-001",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-050",
    "scenario": "アップデートダイアログの操作フローに従い、メモリ退避処理からHTML再構築、イベントリスナー再登録までの一連の移行処理が正常に行われることを検証する。",
    "actor": "一般ユーザー",
    "precondition": "マークダウンエディタ画面（SCR-001）で編集操作を行い、既存のデータが存在すること。",
    "steps": [
      {
        "order": 1,
        "screen": "マークダウンエディタ画面",
        "action": "toolbarの「アップデート」ボタンをクリックする",
        "expectedResult": "アップデートダイアログ（SCR-004）が表示されること"
      },
      {
        "order": 2,
        "screen": "アップデートダイアログ",
        "action": "kantanVersionおよびkantanEditionを確認し、dialogActionsの「実行」ボタンをクリックする",
        "expectedResult": "現在エディタにあるマークダウン、CSS、添付ファイル（添付ファイル、トリミング情報、レイヤーコンテンツ）がメモリに退避されること"
      },
      {
        "order": 3,
        "screen": "マークダウンエディタ画面",
        "action": "再構築後のマークダウンエディタ画面（SCR-001）でTabキーやShift+Tabキーを押下して操作する",
        "expectedResult": "新バージョンの画面構造へ退避データが引き継がれ、イベントリスナーが再登録されてキー操作が正常に応答すること"
      }
    ],
    "expectedResult": "アップデートダイアログ経由でメモリへのデータ退避・HTML再構築・イベント再登録がスムーズに完了すること",
    "testData": "kantanVersion='1.0.0', kantanEdition='full', editor='Content for migration'",
    "acceptanceCriteria": "アプリ更新時に、既存ドキュメント、CSS設定、添付画像データ、レイヤー・トリミング情報が失われずに100%保持・更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-113",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "データ管理",
      "medium": "バージョンアップデート・データ引き継ぎ機能",
      "small": "エディション・バージョン属性保持検証"
    },
    "testCase": "バージョンアップ実行時におけるエディションおよびバージョン識別属性の保持検証",
    "relatedRequirement": "FR-009",
    "relatedScreens": [
      "SCR-001",
      "SCR-004"
    ],
    "relatedViewpoint": "STV-L3-051",
    "scenario": "アプリケーションのアップデートを行った際、メタデータとして保持されているバージョン番号およびエディション属性（__KANTAN_EDITION__）が新環境に正しく反映・維持されることを確認する。",
    "actor": "一般ユーザー",
    "precondition": "現在のアプリケーションのkantanVersionおよびkantanEditionが設定されていること。",
    "steps": [
      {
        "order": 1,
        "screen": "アップデートダイアログ",
        "action": "アップデートダイアログ（SCR-004）でkantanVersionフィールドの値を新しいバージョン番号に変更し、dialogActionsの「実行」ボタンをクリックする",
        "expectedResult": "アップデート処理が完了し、新HTMLへ書き換えが行われること"
      },
      {
        "order": 2,
        "screen": "マークダウンエディタ画面",
        "action": "アップデート後のマークダウンエディタ画面（SCR-001）でシステム情報/バージョン表示を確認する",
        "expectedResult": "更新後のバージョン番号および元々のkantanEdition（std/full等）が正しく保持・表示されていること"
      }
    ],
    "expectedResult": "バージョンアップ後もアプリケーションのエディションおよびバージョン識別情報が整合性を保って維持されること",
    "testData": "kantanVersion='1.1.0', kantanEdition='std'",
    "acceptanceCriteria": "アプリ更新時に、既存ドキュメント、CSS設定、添付画像データ、レイヤー・トリミング情報が失われずに100%保持・更新されること",
    "priority": "高",
    "testType": "手動"
  },
  {
    "変更区分": "拡張",
    "id": "ST-114",
    "category": "運用シナリオ",
    "functionCategory": {
      "large": "拡張性管理",
      "medium": "プラグイン・描画モジュール拡張構造",
      "small": "新規モジュール組み込み検証"
    },
    "testCase": "新規パース・描画ライブラリ組み込み時のビルドパイプライン拡張容易性検証",
    "relatedRequirement": "NFR-008",
    "relatedScreens": [
      "SCR-001",
      "SCR-002",
      "SCR-005"
    ],
    "relatedViewpoint": "STV-L3-052",
    "scenario": "開発運用において新しい構文パース機能や描画ライブラリをGruntfileおよびスクリプト構成に追加し、ビルドエラーを起こすことなく単一HTMLへインライン化・組み込み可能であることを検証する。",
    "actor": "管理者",
    "precondition": "Gruntfile.jsに新ライブラリのスクリプトインライン化または置換設定を追加していること。",
    "steps": [
      {
        "order": 1,
        "screen": "CLI / コンソール",
        "action": "Gruntfileに新規ダミーモジュール追加タスクを設定し、'grunt build' を実行する",
        "expectedResult": "ビルドパイプラインが正常に実行され、エラーなしで完了すること"
      },
      {
        "order": 2,
        "screen": "プレビュー画面",
        "action": "生成された単一HTMLをブラウザで開き、プレビュー画面（SCR-002）での新モジュール対応構文の入力を検証する",
        "expectedResult": "新しく組み込んだ描画プラグインが既存処理を阻害せず、正常にレンダリングを実行すること"
      }
    ],
    "expectedResult": "既存のビルドパイプライン（Gruntfile）を改修することで、新規ライブラリを容易に追加・拡張できること",
    "testData": "追加モジュール='test-plugin.js'",
    "acceptanceCriteria": "新しい構文パース機能や描画ライブラリを既存のビルドパイプライン（Gruntfile）およびスクリプト構成へ容易に追加・差し替えできること",
    "priority": "中",
    "testType": "手動"
  }
]
```