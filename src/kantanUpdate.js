kantanUpdate({
	"newVersion": "<inline src="kantanVersion.txt" />",
	"ktmString": <inline src="ktmString.js" />,
	"doUpdate": function() {
		if (window.KantanModules && window.KantanModules.UpdateInit &&
			typeof window.KantanModules.UpdateInit.hideSettingsPanel === "function") {
			window.KantanModules.UpdateInit.hideSettingsPanel(document);
		} else {
			var settingsPanel = document.getElementById("settings-panel");
			if (settingsPanel) {
				settingsPanel.setAttribute("hidden", "");
			}
		}

		var versionElem = document.getElementById("kantanVersion");
		var kantanVersion = (versionElem && versionElem.getAttribute("data-embedded-version"))
			|| (versionElem ? versionElem.value : "");
		if (kantanVersion == this.newVersion) {
			var confirm = window.confirm("お使いのKantanMarkdownは最新です。それでも強制的にアップデートを実行しますか？");		
			if (confirm == false) {
				return;
			}
		}
		
		showImportDialog(
				"アップデートを適用できます。\n" +
				"\n" +
				"現在ご利用のバージョン：\t" + kantanVersion + "\n" +
				"新しいバージョン　　　：\t" + this.newVersion + "\n" +
				"\n" + 
				"新バージョンに引き継ぐ項目を選んでください。", (function (parent) {

			return function(result) {
				if (result.result == true) {
					parent.rewirteHtml(result);
				}
			}
		})(this));
	},
	"rewirteHtml":function(dialogResult) {
		// アップデート前の値を記憶しておく
		var originalFileList = [];
		var attachFile  = document.querySelectorAll("#fileList li");
		for (var i = 0; i < attachFile.length; i++) {
			var base64Element = attachFile[i].querySelector("script");
			var layerContentElement = attachFile[i].querySelector("script.layerContent");
			var trimInfoElement = attachFile[i].querySelector("script.trimInfo");
			
			var o
			var fileName =  base64Element.title;
			var base64 = base64Element.innerHTML;
			var layerContent = (layerContentElement) ? layerContentElement.innerHTML : "";
			var trimInfo = (trimInfoElement) ? trimInfoElement.innerHTML : "";
			
			originalFileList.push({
				fileName:fileName,
				base64:base64,
				layerContent:layerContent,
				trimInfo:trimInfo,
			});
		}
		var originalMarkdown = document.querySelector("#editor").value;
		var originalCss      = document.querySelector("#cssEditor").value;
		
		// エディションを読み込み
		var kantanEdition = document.querySelector("#kantanEdition").value;
		
		// メモリリーク対策のためにイベントをすべて消す。
		removeAllEvents();
		
		// liteエディションではhljsのcssを消す
		var newHtml = this.ktmString;
		if (kantanEdition == "lite") {
			newHtml = newHtml.replace(/\/\* START_HLJS_CSS \*\/[\s|\S]+\/\* END_HLJS_CSS \*\//, "");
		}

		// 本体をアップデート
		var html = document.querySelector("html");
		html.innerHTML = newHtml;

		// バージョン・エディション更新
		var updatedVerElem = document.getElementById("kantanVersion");
		if (updatedVerElem) {
			updatedVerElem.setAttribute("data-embedded-version", this.newVersion);
		}
		updateKantanVersion(this.newVersion);
		updateKantanEdition(kantanEdition);
		
		// innerHTMLではscriptタグが実行されないのでいったん外して付け直す
		var scriptElements = document.querySelectorAll("script");
		for (var i = 0; i < scriptElements.length; i++) {
			var scriptElement = scriptElements[i];
			var parentNode = scriptElement.parentNode;
			parentNode.removeChild(scriptElement);
		}
		for (var i = 0; i < scriptElements.length; i++) {
			var scriptElement = scriptElements[i];
			if (kantanEdition == "lite" &&
					(  (scriptElement.id == "highlightJs")
					|| (scriptElement.id == "raphaelJs")
					|| (scriptElement.id == "underscoreJs")
					|| (scriptElement.id == "jsSequenceDiagramsJs")
					|| (scriptElement.id == "flowchartJs")
					|| (scriptElement.id == "mermaidJs") )) {
				continue;
			} else if (kantanEdition == "std" && 
					(  (scriptElement.id == "raphaelJs")
					|| (scriptElement.id == "underscoreJs")
					|| (scriptElement.id == "jsSequenceDiagramsJs")
					|| (scriptElement.id == "flowchartJs")
					|| (scriptElement.id == "mermaidJs") )) {
				continue;
			}
			var newScript = document.createElement("script");
			newScript.id = scriptElement.id;
			newScript.innerHTML = scriptElement.innerHTML;
			
			document.querySelector("body").appendChild(newScript);
		}
		
		// 添付ファイル引継ぎ
		if (dialogResult.attach == true) {
			for (var i = 0; i < originalFileList.length; i++) {
				var originalFile = originalFileList[i];
				addAttachFileElement(
						originalFile.fileName,
						originalFile.base64,
						originalFile.layerContent,
						originalFile.trimInfo,
						false);
			}
			saved = false;
		}
		
		// Markdown引継ぎ
		if (dialogResult.markdown == true) {
			var editor = document.querySelector("#editor");
			editor.value = originalMarkdown;
			saved = false;
		}
		
		// CSS上書き・引継ぎ（「CSS(上書き)」チェック時は新バージョンの標準CSSで上書き、未チェック時は既存CSSを引継ぎ）
		var cssEditor = document.querySelector("#cssEditor");
		if (cssEditor) {
			if (window.KantanModules && window.KantanModules.UpdateInit &&
				typeof window.KantanModules.UpdateInit.resolveCssAfterUpdate === "function") {
				var cssResolution = window.KantanModules.UpdateInit.resolveCssAfterUpdate(
					cssEditor.value,
					originalCss,
					Boolean(dialogResult.css)
				);
				cssEditor.value = cssResolution.cssValue;
				if (cssResolution.markUnsaved) {
					saved = false;
				}
			} else if (dialogResult.css == true) {
				saved = false;
			} else if (originalCss) {
				cssEditor.value = originalCss;
			}
		}
		
		// 念のため古いエレメントを削除しておく
		fileListElement = null;

		// アップデート再構築後は初期状態（閲覧モード・ファイラー閉鎖）へ整える
		if (typeof closeFiler === "function") {
			closeFiler();
		}
		if (typeof isEditMode === "function" && isEditMode() && typeof toggleMode === "function") {
			toggleMode();
		}
		
		// プレビュー
		doPreview();
		
		alert("アップデートが完了しました。");
	},
});