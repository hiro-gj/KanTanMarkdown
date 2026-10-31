# 画面UI定義書

```json
{
  "screens": [
    {
      "events": [
        {
          "action": "タブ展開 / インデント挿入",
          "trigger": "keydown (Tab)",
          "description": "設定（setting-expand-tab）に基づきスペースまたはタブ文字を挿入する"
        },
        {
          "action": "アウトデント処理",
          "trigger": "keydown (Shift+Tab)",
          "description": "選択行の行頭からスペースまたはタブを削除する"
        }
      ],
      "fields": [
        {
          "name": "editor",
          "type": "textarea",
          "required": false,
          "validation": "なし",
          "description": "マークダウン文書の入力用テキストエリア"
        }
      ],
      "category": "編集",
      "overview": "マークダウンテキストの入力・編集および添付ファイルの管理を行うメイン画面。",
      "screenId": "SCR-001",
      "components": [
        {
          "name": "editor",
          "type": "form",
          "description": "マークダウン形式のテキストを入力・編集する領域"
        },
        {
          "name": "toolbar",
          "type": "button-group",
          "description": "ファイル保存、各種モード切り替え、設定ダイアログ呼び出し用の操作ボタン群"
        },
        {
          "name": "fileList",
          "type": "sidebar",
          "description": "添付ファイル、トリミング情報、レイヤーコンテンツを管理するファイル一覧"
        }
      ],
      "screenName": "マークダウンエディタ画面",
      "targetUser": "一般ユーザー",
      "transitions": [
        {
          "action": "お絵描き起動ボタン押下",
          "condition": "画像編集・ドロワー機能呼び出し時",
          "destination": "SCR-003"
        },
        {
          "action": "アップデートボタン押下",
          "condition": "更新処理呼び出し時",
          "destination": "SCR-004"
        },
        {
          "action": "設定ボタン押下",
          "condition": "設定モーダル表示時",
          "destination": "SCR-005"
        }
      ],
      "operationSteps": [
        {
          "step": 1,
          "action": "エディタ領域にマークダウンテキストを入力する",
          "systemResponse": "プレビュー画面へリアルタイムに同期・反映される"
        },
        {
          "step": 2,
          "action": "TabキーまたはShift+Tabキーを押下する",
          "systemResponse": "設定に応じてタブ展開（スペース挿入）またはインデント・アウトデントが行われる"
        }
      ],
      "sourceEvidence": [
        "KanTanMarkdown/src/js/kantanEditor.js",
        "KanTanMarkdown/src/js/kantanMarkdown.js"
      ]
    },
    {
      "events": [
        {
          "action": "要素変換・描画",
          "trigger": "render",
          "description": "[!NOTE] や [!TIP] 等の記述をGitHubアラート形式のHTML要素へ置換描画する"
        }
      ],
      "fields": [],
      "category": "閲覧",
      "overview": "入力されたマークダウンをHTMLに変換し、リアルタイムで構造化表示する閲覧専用モード対応画面。Diagram（シーケンス図）やGitHubアラート等の各種拡張表現を表示する。",
      "screenId": "SCR-002",
      "components": [
        {
          "name": "previewer",
          "type": "card",
          "description": "marked.jsおよび拡張プラグインでレンダリングされたHTMLコンテンツを表示する領域"
        },
        {
          "name": "message-area",
          "type": "header",
          "description": "編集不可ブラウザ検出時などに閲覧専用モードメッセージを表示するエリア"
        }
      ],
      "screenName": "プレビュー画面",
      "targetUser": "一般ユーザー",
      "transitions": [],
      "operationSteps": [
        {
          "step": 1,
          "action": "エディタ画面でテキストを編集する",
          "systemResponse": "構文解析が行われ、GitHubアラートやDiagram（Actor, Signal）等の要素がレンダリング表示される"
        }
      ],
      "sourceEvidence": [
        "KanTanMarkdown/src/js/marked.min.js",
        "KanTanMarkdown/src/js/github-alerts.js",
        "KanTanMarkdown/src/js/js-sequence-diagrams.min.js"
      ]
    },
    {
      "events": [
        {
          "action": "モード切替",
          "trigger": "click (ModeButton)",
          "description": "KantanDrawerの描画モードを変更する"
        },
        {
          "action": "色情報更新",
          "trigger": "keyup (borderColor / fillColor)",
          "description": "入力された色コードを描画コンテキストへ即時適用する"
        }
      ],
      "fields": [
        {
          "name": "borderWidth",
          "type": "number",
          "required": false,
          "validation": "1以上の数値",
          "description": "描画する線の太さ"
        },
        {
          "name": "borderColor",
          "type": "text",
          "required": false,
          "validation": "カラーコード形式（HEX/RGBA）",
          "description": "枠線・描画線の色"
        },
        {
          "name": "fillColor",
          "type": "text",
          "required": false,
          "validation": "カラーコード形式（HEX/RGBA）",
          "description": "図形の塗りつぶし色"
        }
      ],
      "category": "描画・編集",
      "overview": "Canvasを利用して手書きの描画や図形の挿入、レイヤーコンテンツの編集を行うKantanDrawer画面。",
      "screenId": "SCR-003",
      "components": [
        {
          "name": "canvasWrapper",
          "type": "card",
          "description": "ベースキャンバス、メインキャンバス、作業用キャンバスを重ね合わせた描画領域"
        },
        {
          "name": "mode",
          "type": "button-group",
          "description": "描画モード（ペン、図形、テキスト等）を選択するツールボタン群"
        },
        {
          "name": "styleControls",
          "type": "form",
          "description": "線の太さ、線色（borderColor）、塗りつぶし色（fillColor）を設定するコントロール群"
        }
      ],
      "screenName": "お絵描き画面",
      "targetUser": "一般ユーザー",
      "transitions": [
        {
          "action": "確定・保存ボタン押下",
          "condition": "描画内容を保存してマークダウンエディタ画面へ戻る時",
          "destination": "SCR-001"
        }
      ],
      "operationSteps": [
        {
          "step": 1,
          "action": "モードボタン（modeButton）を押下して描画ツールを選択する",
          "systemResponse": "選択した描画モード状態に切り替わる"
        },
        {
          "step": 2,
          "action": "キャンバス上でドラッグ操作を行う",
          "systemResponse": "指定された線幅・色でメインキャンバスに図形や線を描画する"
        }
      ],
      "sourceEvidence": [
        "KanTanMarkdown/src/js/kantanDrawer.js"
      ]
    },
    {
      "events": [
        {
          "action": "アップデート処理開始",
          "trigger": "onClick (doUpdate)",
          "description": "バージョンチェックを行い、問題なければデータ引き継ぎ処理（rewirteHtml）を呼び出す"
        }
      ],
      "fields": [
        {
          "name": "kantanVersion",
          "type": "text",
          "required": true,
          "validation": "バージョン形式文字列",
          "description": "現在利用中のKantanMarkdownバージョン"
        },
        {
          "name": "kantanEdition",
          "type": "select",
          "required": true,
          "validation": "lite / std / full / dev のいずれか",
          "description": "アプリケーションのエディション情報"
        }
      ],
      "category": "ダイアログ・モーダル",
      "overview": "アプリケーションのバージョンアップデートを実行し、既存のマークダウンテキストや添付ファイル、トリミング情報などの引き継ぎ設定を行うダイアログ。",
      "screenId": "SCR-004",
      "components": [
        {
          "name": "importDialog",
          "type": "modal",
          "description": "現在のバージョンと新バージョン情報を表示し、引き継ぎ項目を選択・確認するモーダル"
        },
        {
          "name": "dialogActions",
          "type": "button-group",
          "description": "アップデート実行・キャンセルの決定ボタン群"
        }
      ],
      "screenName": "アップデートダイアログ",
      "targetUser": "一般ユーザー",
      "transitions": [
        {
          "action": "アップデート完了時 / キャンセル時",
          "condition": "処理終了後にエディタ画面へ復帰する時",
          "destination": "SCR-001"
        }
      ],
      "operationSteps": [
        {
          "step": 1,
          "action": "アップデート確認ダイアログで引き継ぎ項目を選択し「実行」を押下する",
          "systemResponse": "現在エディタにあるマークダウン、CSS、添付ファイル（添付ファイル、トリミング情報、レイヤーコンテンツ）をメモリに退避する"
        },
        {
          "step": 2,
          "action": "HTMLの再構築（rewirteHtml）が完了する",
          "systemResponse": "新バージョンの画面構造へ退避データが引き継がれ、イベントリスナーが再登録される"
        }
      ],
      "sourceEvidence": [
        "KanTanMarkdown/src/kantanUpdate.js"
      ]
    },
    {
      "events": [
        {
          "action": "エディタ挙動切り替え",
          "trigger": "change (setting-expand-tab)",
          "description": "Tabキー押下時のスペース挿入ロジックを有効化/無効化する"
        }
      ],
      "fields": [
        {
          "name": "setting-expand-tab",
          "type": "checkbox",
          "required": false,
          "validation": "boolean",
          "description": "Tabキー押下時にスペースへ展開するかどうかの設定"
        },
        {
          "name": "cssEditor",
          "type": "textarea",
          "required": false,
          "validation": "CSS構文",
          "description": "プレビュー用カスタムCSSの入力領域"
        }
      ],
      "category": "設定",
      "overview": "エディタの挙動設定（タブ展開の有無）やプレビュー適用用のカスタムCSSの編集を行う設定画面。",
      "screenId": "SCR-005",
      "components": [
        {
          "name": "settingForm",
          "type": "form",
          "description": "エディタの各種オプション設定を行うフォーム"
        },
        {
          "name": "cssEditorContainer",
          "type": "card",
          "description": "カスタムCSSを入力・編集するためのエリア"
        }
      ],
      "screenName": "設定画面",
      "targetUser": "一般ユーザー",
      "transitions": [
        {
          "action": "設定画面を閉じる",
          "condition": "設定変更完了時",
          "destination": "SCR-001"
        }
      ],
      "operationSteps": [
        {
          "step": 1,
          "action": "「タブ展開」チェックボックスのオン/オフを切り替える",
          "systemResponse": "Tabキー入力時の動作（スペース変換の有効/無効）が更新される"
        },
        {
          "step": 2,
          "action": "cssEditorにカスタムスタイルを入力する",
          "systemResponse": "プレビュー画面のCSSスタイルへ反映される"
        }
      ],
      "sourceEvidence": [
        "KanTanMarkdown/src/js/kantanEditor.js",
        "KanTanMarkdown/src/kantanUpdate.js"
      ]
    }
  ]
}
```