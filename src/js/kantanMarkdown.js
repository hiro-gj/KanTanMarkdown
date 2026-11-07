	/* 編集不可ブラウザ判定 */

	// Blobが使用できないブラウザは保存不可
	try {
		new Blob(["temp"]);
	} catch(e) {
		setViewOnly(); 
	}

	// Safariはdownload属性に対応していないので閲覧のみ
	var ua = window.navigator.userAgent.toLowerCase();
	if ((ua.indexOf("chrome") == -1) && (ua.indexOf('safari') != -1)) {
		setViewOnly();
	}

	function setViewOnly() {
		document.getElementById("message-area").innerText
				 = "このブラウザでは編集できません。";
		var navElems = document.querySelectorAll("#toolbar button");
		for (var i = 0; i < navElems.length; i++) {
			navElems[i].setAttribute("disabled", "disabled");
		}
	}

	/* アップデート */
    updateKantanVersion(document.getElementById("kantanVersion").value);
	
	var eventRegistry = (window.KantanModules && window.KantanModules.UpdateInit)
		? window.KantanModules.UpdateInit.createEventRegistry(document)
		: null;
	var eventListeners = eventRegistry ? eventRegistry.getListeners() : [];
	function on(elementOrQuery, eventName, callback) {
		if (eventRegistry) {
			eventRegistry.register(elementOrQuery, eventName, callback, document);
			eventListeners = eventRegistry.getListeners();
			return;
		}
		var element;
		if (typeof elementOrQuery === "string") {
			element = document.querySelectorAll(elementOrQuery);
		} else {
			element = [elementOrQuery];
		}
		
		for (var i = 0; i < element.length; i++) {
			var targetEl = element[i];
			if (!targetEl || typeof targetEl.addEventListener !== "function") continue;
			var isDuplicate = false;
			for (var j = 0; j < eventListeners.length; j++) {
				if (eventListeners[j].element === targetEl &&
					eventListeners[j].eventName === eventName &&
					eventListeners[j].callback === callback) {
					isDuplicate = true;
					break;
				}
			}
			if (isDuplicate) continue;
			targetEl.addEventListener(eventName, callback);
			
			eventListeners.push({
				element: targetEl,
				eventName: eventName,
				callback: callback,
			});	
		}
	}

	function removeAllEvents() {
		if (typeof destroyPageBreakMeasurement === "function") {
			destroyPageBreakMeasurement();
		}
		if (eventRegistry) {
			eventRegistry.removeAll();
			eventListeners = eventRegistry.getListeners();
			return;
		}
		for (var i = 0; i < eventListeners.length; i++) {
			var element = eventListeners[i].element;
			var eventName = eventListeners[i].eventName;
			var callback = eventListeners[i].callback;
			element.removeEventListener(eventName, callback);
		}
		eventListeners = [];
	}

	function updateKantanVersion (version) {
		var versionElem = document.getElementById("kantanVersion");
		if (versionElem) {
			versionElem.value = version;
			versionElem.setAttribute("value", version);
		}
		var editionElem = document.getElementById("kantanEdition");
		var edition = editionElem ? editionElem.value : "";
		var versionLabel = (window.KantanModules && window.KantanModules.UpdateInit)
			? window.KantanModules.UpdateInit.formatVersionEditionLabel(version, edition)
			: (version + "_" + edition);
		var versionElements = document.getElementsByClassName("version");
		for (var i = 0 ; i < versionElements.length; i++) {
			versionElements[i].innerText = versionLabel;
		}
	}
	
	function updateKantanEdition (edition) {
		var editionElem = document.getElementById("kantanEdition");
		if (editionElem) {
			editionElem.value = edition;
			editionElem.setAttribute("value", edition);
		}
	}
	
	function kantanUpdate(json) {
		json.doUpdate();
	}
	
	var updateBtnElem = document.getElementById("updateButton");
	if (updateBtnElem) {
		var currentHrefAttr = updateBtnElem.getAttribute("href") || "";
		if (window.KantanModules && window.KantanModules.UpdateInit) {
			updateBtnElem.href = window.KantanModules.UpdateInit.resolveUpdateScriptUrl(
				window.location && window.location.pathname,
				currentHrefAttr
			);
		} else {
			var isPreviewLoc = window.location && window.location.pathname && window.location.pathname.indexOf("/dist/preview/") !== -1;
			if (isPreviewLoc || currentHrefAttr.indexOf("/dist/preview/") !== -1) {
				updateBtnElem.href = "https://hiro-gj.github.io/KanTanMarkdown/dist/preview/kantanUpdate.js";
			} else {
				updateBtnElem.href = "https://hiro-gj.github.io/KanTanMarkdown/dist/kantanUpdate.js";
			}
		}
	}

	on("#updateButton", "click", function(event) {
		event.preventDefault();
		
		if(!window.confirm(
				"最新版にアップデートします。\n" +
				"不測の事態に備えて、現在編集中のドキュメントは保存しておくことをお勧めします。\n" + 
				"\n" + 
				"【OK】：アップデート実行(あと何回かダイアログが表示されます)\n" + 
				"【キャンセル】：キャンセル")){
			return false;
		}
		
		var script = document.createElement("script");
		var currentHref = this.getAttribute("href") || "";
		var updateBaseUrl = (window.KantanModules && window.KantanModules.UpdateInit)
			? window.KantanModules.UpdateInit.resolveUpdateScriptUrl(window.location && window.location.pathname, currentHref)
			: (((window.location && window.location.pathname && window.location.pathname.indexOf("/dist/preview/") !== -1) || currentHref.indexOf("/dist/preview/") !== -1)
				? "https://hiro-gj.github.io/KanTanMarkdown/dist/preview/kantanUpdate.js"
				: "https://hiro-gj.github.io/KanTanMarkdown/dist/kantanUpdate.js");
		this.href = updateBaseUrl;
		script.src = updateBaseUrl + "?t=" + Date.now();
		script.class = "kantanUpdateScript";
		script.onerror = function () {
			alert("アップデートに失敗しました。\n" + 
			"アップデート用のファイルにアクセスできませんでした。\n" + 
			"インターネットに接続されていないか、サーバーダウンです");
		};
		document.querySelector("#updateScriptArea").appendChild(script);
		
		return false;
	})

	var updateNewDocHref = function() {
		var baseUrl = this.href.split("?")[0];
		this.href = baseUrl + "?t=" + Date.now();
	};
	on('a[href*="ktm-new.html"]', "mousedown", updateNewDocHref);
	on('a[href*="ktm-new.html"]', "click", updateNewDocHref);
	
	/* 端末固有設定 */
	// 現在のところチェックボックスのみなので
	// チェックボックスに特化して実装している
	var saveValueElements = document.querySelectorAll(
			"#settings-panel input[type=checkbox]");
	for (var i = 0; i < saveValueElements.length; i++) {
		var element = saveValueElements[i];
		var savedValue = getItem(element.id, null);
		if (savedValue != null) {
			element.checked = (savedValue == "true");
		}
		on (element, "change", function() {
			setItem(this.id, this.checked);
		});
	}
	
	function getItem(name, defaultValue) {
		if (window.KantanModules && window.KantanModules.SettingsUi) {
			return window.KantanModules.SettingsUi.getStorageItem(name, defaultValue);
		}
		try {
			var value = localStorage.getItem("com.tatesuke.ktm." + name);
			return (value != null) ? value : defaultValue;
		} catch(e) {
			return defaultValue;
		}
	}

	function setItem(name, value) {
		if (window.KantanModules && window.KantanModules.SettingsUi) {
			window.KantanModules.SettingsUi.setStorageItem(name, value);
			return;
		}
		try {
			localStorage.setItem("com.tatesuke.ktm." + name, value);
		} catch(e) {
			// 握りつぶし
		}
	}
	
	/* エディタに機能追加 */
	toKantanEditor(document.getElementById("editor"));
	toKantanEditor(document.getElementById("cssEditor"));

	/* marked カスタムレンダラー（Mermaidフェンス対応） */
	var markedRenderer = new marked.Renderer();
	var originalCodeRenderer = markedRenderer.code.bind(markedRenderer);
	markedRenderer.code = function (code, lang, escaped) {
		if (lang === "mermaid" && typeof mermaid !== "undefined") {
			return '<div class="mermaid">' + code + '</div>';
		}
		return originalCodeRenderer(code, lang, escaped);
	};

	/* Qiita Note記法 プラグイン初期化（二重初期化防止） */
	if (typeof QiitaMarker !== "undefined" && typeof marked !== "undefined" && !marked.__qiitaMarkerInstalled) {
		QiitaMarker.install(marked);
	}

	/* シンタックスハイライト設定 */
	if (typeof hljs !== "undefined") {
		marked.setOptions({
			renderer: markedRenderer,
			highlight: function (code, lang) {
				if (lang === "mermaid") {
					return code;
				}
				return hljs.highlightAuto(code, [lang]).value;
			}
		});
	} else {
		marked.setOptions({
			renderer: markedRenderer
		});
	}
	
	/* 画像キャッシュ */
	var imageUrlMap = {};
	function getCachedImageUrl(name, createOnNoCached) {
		var imageUrl = imageUrlMap[name];
		if ((imageUrl == null) && createOnNoCached) {
			var element = document.getElementById("attach-" + name);
			if (element != null) {
				return cacheImageUrl(name, element.innerHTML);
			} else {
				return null;
			}
		} else {
			return imageUrl;
		}	
	}
	
	function cacheImageUrl(name, base64) {
		var imageUrl;
		if (window.URL) {
			var blob = base64ToBlob(base64);
			imageUrl = {
					blobOrBase64:window.URL.createObjectURL(blob),
					base64:base64}
		} else {
			imageUrl = {
					blobOrBase64:base64,
					base64:base64}
		}
		
		imageUrlMap[name] = imageUrl;
		return imageUrl;
	}
	
	function uncacheImageUrl(name) {
		var imageUrl = imageUrlMap[name];
		if (window.URL && imageUrl) {
			window.URL.revokeObjectURL(imageUrl.blobOrBase64 || imageUrl);
		} 
		delete imageUrlMap[name];
	}

	var videoUrlMap = {};
	function isAttachVideo(name, base64) {
		if (window.KantanModules && window.KantanModules.AttachmentManager &&
			typeof window.KantanModules.AttachmentManager.isVideoAttachment === "function") {
			return window.KantanModules.AttachmentManager.isVideoAttachment(name, base64);
		}
		return Boolean(base64 && /^\s*data:video\/[^;]+;base64,/i.test(base64));
	}

	function getCachedVideoBlobUrl(name, createOnNoCached) {
		var cached = videoUrlMap[name];
		if ((cached == null) && createOnNoCached) {
			var element = document.getElementById("attach-" + name);
			if (element != null) {
				var base64 = element.innerHTML;
				if (!isAttachVideo(name, base64)) {
					return null;
				}
				var blob = base64ToBlob(base64);
				var blobUrl = window.URL ? window.URL.createObjectURL(blob) : base64;
				videoUrlMap[name] = {
					blobUrl: blobUrl,
					base64: base64
				};
				return videoUrlMap[name];
			} else {
				return null;
			}
		}
		return cached;
	}

	function uncacheVideoUrl(name) {
		var cached = videoUrlMap[name];
		if (window.URL && cached && cached.blobUrl) {
			window.URL.revokeObjectURL(cached.blobUrl);
		}
		delete videoUrlMap[name];
	}
	
	/* 起動時にコンテンツ読み込み */
	addClass(document.querySelector("body"), "previewMode");
	addClass(document.querySelector("body"), "view-mode");
	removeClass(document.querySelector("body"), "editMode");
	removeClass(document.querySelector("body"), "initialState");

	// 起動時は常に閲覧（プレビュー）モードなので、アタッチ領域、エディタ領域、リサイズハンドルを明示的に非表示にする
	hide(document.getElementById("attach"));
	hide(document.getElementById("editorTabWrapper"));
	hide(document.getElementById("resize-handle"));

	// ツールバーとハンバーガーのイベント
	var toolbar = document.getElementById("toolbar");
	var toggleBtn = document.getElementById("toolbar-toggle");
	var toggleIcon = document.getElementById("toolbar-toggle-icon");
	var isToolbarVisible = getItem("toolbar-visible", "false") === "true";

	if (isToolbarVisible) {
		addClass(toolbar, "visible");
		addClass(document.body, "toolbar-open");
		toggleIcon.innerText = "✕";
	} else {
		removeClass(toolbar, "visible");
		removeClass(document.body, "toolbar-open");
		toggleIcon.innerText = "☰";
	}

	on("#toolbar-toggle", "click", function() {
		if (toolbar.classList.contains("visible")) {
			removeClass(toolbar, "visible");
			removeClass(document.body, "toolbar-open");
			toggleIcon.innerText = "☰";
			setItem("toolbar-visible", "false");
			
			// ツールバーを閉じる際、もし現在編集モード中なら閲覧（プレビュー）モードに切り替える
			if (isEditMode()) {
				toggleMode();
			}
		} else {
			addClass(toolbar, "visible");
			addClass(document.body, "toolbar-open");
			toggleIcon.innerText = "✕";
			setItem("toolbar-visible", "true");
		}
		doLayout();
	});

	// 設定パネルのイベント
	var settingsPanel = document.getElementById("settings-panel");
	function checkAndClearVersionCache() {
		if (typeof window === "undefined" || typeof fetch !== "function") {
			return;
		}
		// 1. サーバー上の kantanVersion.txt をキャッシュ無効(no-store)で取得し、バージョン情報表示部分のみを最新化（画面リロードは行わず編集中の文章を保持）
		var versionUrl = "https://hiro-gj.github.io/KanTanMarkdown/src/kantanVersion.txt?t=" + Date.now();
		fetch(versionUrl, {
			cache: "no-store",
			headers: {
				"Pragma": "no-cache",
				"Cache-Control": "no-cache"
			}
		}).then(function(res) {
			if (!res || !res.ok) return null;
			return res.text();
		}).then(function(verText) {
			if (!verText) return;
			var latestVer = verText.trim();
			if (latestVer) {
				var currentVerElem = document.getElementById("kantanVersion");
				var currentVer = currentVerElem ? currentVerElem.value : "";
				var shouldUpdate = (window.KantanModules && window.KantanModules.UpdateInit && typeof window.KantanModules.UpdateInit.shouldUpdateDisplayedVersion === "function")
					? window.KantanModules.UpdateInit.shouldUpdateDisplayedVersion(currentVer, latestVer)
					: true;
				if (shouldUpdate) {
					updateKantanVersion(latestVer);
				}
			}
		}).catch(function() {});

		// 2. 次回アクセス時用に元URLのブラウザキャッシュのみバックグラウンドで更新（現在の画面・編集中原稿には一切影響しない）
		if (window.location && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
			var cleanUrl = window.location.href.split("?")[0].split("#")[0];
			fetch(cleanUrl, {
				cache: "reload",
				headers: {
					"Pragma": "no-cache",
					"Cache-Control": "no-cache"
				}
			}).catch(function() {});
		}
	}

	on("#btn-settings", "click", function() {
		settingsPanel.removeAttribute("hidden");
		checkAndClearVersionCache();
	});
	on("#btn-settings-close", "click", function() {
		settingsPanel.setAttribute("hidden", "");
	});

	setTimeout(checkAndClearVersionCache, 100);

	// ダークモード
	var isDark = getItem("dark-mode", "false") === "true";
	if (isDark) {
		addClass(document.body, "dark");
		document.getElementById("btn-dark-mode").querySelector(".btn-text").innerText = "ライト";
	} else {
		removeClass(document.body, "dark");
		document.getElementById("btn-dark-mode").querySelector(".btn-text").innerText = "ダーク";
	}

	on("#btn-dark-mode", "click", function() {
		if (document.body.classList.contains("dark")) {
			removeClass(document.body, "dark");
			document.getElementById("btn-dark-mode").querySelector(".btn-text").innerText = "ダーク";
			setItem("dark-mode", "false");
		} else {
			addClass(document.body, "dark");
			document.getElementById("btn-dark-mode").querySelector(".btn-text").innerText = "ライト";
			setItem("dark-mode", "true");
		}
		if (typeof mermaid !== "undefined") {
			doPreview();
		}
		doPreview();
	});

	// エディタ幅の復元
	var savedEditorWidth = getItem("editor-width", "50%");
	document.documentElement.style.setProperty("--editor-width", savedEditorWidth);

	// 起動時は常に閲覧（プレビュー）モードで開始する
	doPreview();

	/* レイアウト調整 */
	doLayout();
	on(window, "resize", doLayout);
	function doLayout() {
		var wrapper = document.getElementById("wrapper");
		var offsetTop = wrapper.offsetTop;
		// toolbar が open の場合は offsetTop を調整
		if (document.body.classList.contains("toolbar-open")) {
			offsetTop = 40; // --toolbar-height
		} else {
			offsetTop = 0;
		}
		var wrapperHeight = window.innerHeight - offsetTop;
		if (isEditMode()) {
			// 編集モード時はアタッチセクションもある
			var attach = document.getElementById("attach");
			if (isVisible(attach)) {
				var filer = document.getElementById("filer");
				var attachHeight = isVisible(filer) ? 200 : 40;
				wrapperHeight -= attachHeight;
			}
			wrapper.style.height = wrapperHeight + "px";
		} else {
			wrapper.style.height = "";
		}
	}

	/* 編集・閲覧切り替え */
	var editorScrollBarPos = 0;
	var caretStartPos = 0;
	var caretEndPos = 0;
	var isPreviewerOpened = true;
	var viewModeIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5 8-5.5 8-5.5zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 4 8 4s3.88.668 5.168 1.957A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12 8 12s-3.879-.668-5.168-1.957A13.134 13.133 0 0 1 1.172 8z"></path><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"></path></svg>';
	var editModeIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"></path></svg>';

	on("#btn-toggle-mode", "click", toggleMode);
	syncModeButton();

	function syncModeButton() {
		var button = document.getElementById("btn-toggle-mode");
		if (!button) return;
		var editMode = isEditMode();
		button.querySelector(".btn-text").innerText = editMode ? "閲覧" : "編集";
		button.querySelector(".btn-icon").innerHTML = editMode ? viewModeIcon : editModeIcon;
	}

	function toggleMode() {
		if (typeof schedulePageBreakUpdate === "function") {
			schedulePageBreakUpdate("toggle-mode");
		}
		var attach = document.getElementById("attach");
		var editorTabWrapper = document.getElementById("editorTabWrapper");
		var editor = document.getElementById("editor");
		var previewer = document.getElementById("previewer");
		var resizeHandle = document.getElementById("resize-handle");
		var toc = document.getElementById("toc");
		var toggleBtnMode = document.getElementById("btn-toggle-mode");

		if (isEditMode()) {
			editorScrollBarPos    = editor.scrollTop;
			caretStartPos = editor.selectionStart;
			caretEndPos = editor.selectionEnd;
		}

		if (isEditMode()) {
			// プレビューモードへ
			isPreviewerOpened = isVisible(previewer);
			if (isPreviewerOpened == false) {
				openPreview();
			}
			
			hide(attach);
			hide(editorTabWrapper);
			hide(resizeHandle);
			doPreview();
			
			// 目次
			if (document.body.classList.contains("toc-visible")) {
				buildToc();
			}
			
			// スクロールバー位置記憶
			var minDiff = null;
			var minElem = null;
			var elems = previewer.querySelectorAll("*");
			for (var i = 0; i < elems.length; i++) {
				var diff = previewer.scrollTop - (elems[i].offsetTop - previewer.offsetTop);
				if ((minDiff == null) || (Math.abs(diff) < Math.abs(minDiff))) {
					minDiff = diff;
					minElem = elems[i];
				}
			}	
			
			// レイアウト修正
			addClass(document.querySelector("body"), "previewMode");
			addClass(document.querySelector("body"), "view-mode");
			removeClass(document.querySelector("body"), "editMode");
			addClass(previewer, "full-width");
			doLayout();
			
			previewer.focus();
			
			if (minElem) {
				wrapper.scrollTop = (minElem.offsetTop - previewer.offsetTop) + minDiff;
			}
			
		} else {
			// 編集モードへ
			showBlock(attach);
			showBlock(editorTabWrapper);
			if (isPreviewerOpened) {
				showBlock(resizeHandle);
			}
			doPreview();
			
			// スクロールバー位置記憶
			var minDiff = null;
			var minElem = null;
			var elems = previewer.querySelectorAll("*");
			for (var i = 0; i < elems.length; i++) {
				var diff = wrapper.scrollTop - (elems[i].offsetTop - previewer.offsetTop);
				if ((minDiff == null) || (Math.abs(diff) < Math.abs(minDiff))) {
					minDiff = diff;
					minElem = elems[i];
				}
			}		
			
			if (isPreviewerOpened == false) {
				closePreview();
			}
			
			// レイアウト修正
			removeClass(document.querySelector("body"), "previewMode");
			removeClass(document.querySelector("body"), "view-mode");
			addClass(document.querySelector("body"), "editMode");
			removeClass(previewer, "full-width");
			doLayout();
			
			if (minElem) {
				previewer.scrollTop = (minElem.offsetTop - previewer.offsetTop) + minDiff;
			}

		}
		
		// 添付ファイル表示状態の同期
		var isFilerVis = isVisible(document.getElementById("filer"));
		document.getElementById("attachToggleButton").innerText = isFilerVis ? "添付ファイルを隠す(Alt+↑)" : "添付ファイルを表示(Alt+↓)";
		var btnToggleAttach = document.getElementById("btn-toggle-attach");
		if (btnToggleAttach) {
			btnToggleAttach.querySelector(".btn-text").innerText = isFilerVis ? "隠す" : "画像を添付";
		}
		
		// プレビュー表示状態の同期
		var isPrevVis = isVisible(document.getElementById("previewer"));
		document.getElementById("previewToggleButton").innerText = isPrevVis ? "プレビューを隠す(Alt+→)" : "プレビューを表示(Alt+←)";
		syncModeButton();

		if (isEditMode()) {
			editor.scrollTop    = editorScrollBarPos;
			editor.selectionStart = caretStartPos;
			editor.selectionEnd = caretEndPos;
			editor.focus();
		}
	}

	/* Markdownエディタとプレビューの同期 */

	// 自動同期チェックボックスをクリックしたらchecked属性を更新する
	// これを行わないと自動同期チェックボックスの状態が保存されない
	on("#setting-auto-sync", "change", function() {
		if (this.checked == true) {
			this.setAttribute("checked", "checked");
		} else {
			this.removeAttribute("checked");
		}
	});

	// エディタに変化があったらプレビュー予約
	on("#editor", "change", queuePreview);
	on("#editor", "keyup", queuePreview);
	
	// 自動更新がONならプレビューする
	// ただし、onkeyupなど呼ばれる頻度が高いので一定時間待って最後の呼び出しのみ実行する
	var previewQueue = null; // キューをストック 
	var queuePreviewWait = 300; // 0.3秒後に実行の場合 
	function queuePreview() {
		var settingAutoSync = document.getElementById("setting-auto-sync");
		if (!settingAutoSync.checked) {
			return;
		}

		// イベント発生の都度、キューをキャンセル 
		clearTimeout( previewQueue );
		 
		// waitで指定したミリ秒後に所定の処理を実行 
		// 経過前に再度イベントが発生した場合
		// キューをキャンセルして再カウント 
		previewQueue = setTimeout(doPreview, queuePreviewWait);
	}
	
	// 同期実行
	function doPreview() {
		// prepreviewedイベントをディスパッチ
		var previewer = document.getElementById("previewer");
		var event = document.createEvent("Event");
		event.initEvent("prepreview", true, true);
		previewer.dispatchEvent(event);

		// スクロールバー下端判定
		var scrollLockFlag = isMaxScroll("previewer");
		
		// 改行に末尾スペース2個を必須にする（require-trailing-spaces）の制御
		var requireSpacesElem = document.getElementById("setting-require-trailing-spaces");
		var requireSpaces = requireSpacesElem ? requireSpacesElem.checked : false;
		marked.setOptions({
			breaks: !requireSpaces
		});

		// マークダウンレンダリング
		previewer.innerHTML = marked(editor.value.replace(/<video\b([^>\n]*?\bsrc=["']attach:[^"']+["'][^>\n]*?)<\/video>/gi, "<video$1></video>"));
		
		// GitHub Alerts のレンダリング適用
		if (typeof GithubAlerts !== 'undefined') {
			GithubAlerts.render(previewer);
		}
		
		// CSS修正
		var previewerStyle = document.querySelector("#previewerStyle");
		var cssEditor = document.querySelector("#cssEditor");
		var replacedCss = replaceAttachURL(cssEditor.value);
		replacedCss = replacedCss.replace(
			/@media\s+print\s*\{\s*\.mermaid,\s*\.mermaid-rendered\s*\{\s*page-break-inside:\s*avoid;\s*break-inside:\s*avoid;\s*max-width:\s*100%\s*!important;\s*\}\s*\.mermaid\s+svg,\s*\.mermaid-rendered\s+svg\s*\{\s*max-width:\s*100%\s*!important;\s*\}\s*\}/g,
			'@media print {\n    .mermaid,\n    .mermaid-rendered {\n        page-break-inside: avoid;\n        break-inside: avoid;\n        max-width: 100% !important;\n    }\n    .mermaid svg,\n    .mermaid-rendered svg {\n        max-width: 100%;\n        height: auto;\n    }\n    .mermaid svg[aria-roledescription^="flowchart"],\n    .mermaid-rendered svg[aria-roledescription^="flowchart"],\n    .mermaid svg[aria-roledescription="sequence"],\n    .mermaid-rendered svg[aria-roledescription="sequence"],\n    .mermaid svg[aria-roledescription^="class"],\n    .mermaid-rendered svg[aria-roledescription^="class"],\n    .mermaid svg[aria-roledescription^="state"],\n    .mermaid-rendered svg[aria-roledescription^="state"],\n    .mermaid svg.statediagram,\n    .mermaid-rendered svg.statediagram {\n        zoom: 0.5;\n    }\n}'
		);
		previewerStyle.innerHTML = replacedCss;
		
		// タイトル変更
		var h1 = document.querySelector("h1");
		if(h1) {
			document.title = h1.textContent;
		} else {
			document.title = "無題";
		}
		if (saved == false) {
			document.title = "* " + document.title;
		}
		
		// 画像埋め込み
		window.__kantanImageDimCache = window.__kantanImageDimCache || {};
		var images = document.querySelectorAll("#previewer img");
		for (var i = 0; i < images.length; i++) {
			var elem = images[i];
			if (elem.dataset && !elem.dataset.kantanImgBound) {
				elem.dataset.kantanImgBound = "true";
				elem.addEventListener("load", function() {
					if (this.naturalWidth > 0 && this.naturalHeight > 0 && this.src) {
						window.__kantanImageDimCache[this.src] = { w: this.naturalWidth, h: this.naturalHeight };
					}
					if (typeof schedulePageBreakUpdate === "function") {
						schedulePageBreakUpdate("image-load");
					}
				});
				elem.addEventListener("error", function() {
					if (typeof schedulePageBreakUpdate === "function") {
						schedulePageBreakUpdate("image-error");
					}
				});
			}
			loadImage(elem);
		}
		
		function decodeAttachName(raw) {
			if (window.KantanModules && window.KantanModules.AttachmentManager &&
				typeof window.KantanModules.AttachmentManager.decodeAttachName === "function") {
				return window.KantanModules.AttachmentManager.decodeAttachName(raw);
			}
			try {
				return decodeURIComponent(raw);
			} catch (_) {
				return raw;
			}
		}

		function extractAttachTarget(val) {
			if (window.KantanModules && window.KantanModules.AttachmentManager &&
				typeof window.KantanModules.AttachmentManager.extractAttachName === "function") {
				return window.KantanModules.AttachmentManager.extractAttachName(val);
			}
			if (!val) return null;
			var m = val.trim().match(/^attach:(.+)/);
			return m ? decodeAttachName(m[1]) : null;
		}

		function findAdjacentVideoForAnchor(anchor, attachName) {
			var node = anchor.nextSibling;
			while (node) {
				if (node.nodeType === 3 && node.nodeValue.trim() === "") {
					node = node.nextSibling;
					continue;
				}
				if (node.nodeType === 1 && node.tagName === "BR") {
					node = node.nextSibling;
					continue;
				}
				if (node.nodeType === 1 && node.tagName === "VIDEO") {
					var vTarget = node.getAttribute("data-kantan-attach") || extractAttachTarget(node.getAttribute("src") || "");
					if (!vTarget || vTarget === attachName) {
						return node;
					}
				}
				break;
			}
			var parent = anchor.parentNode;
			if (parent && parent.tagName === "P") {
				var hasTrailing = false;
				var pNode = anchor.nextSibling;
				while (pNode) {
					if (pNode.nodeType === 3 && pNode.nodeValue.trim() === "") {
						pNode = pNode.nextSibling;
						continue;
					}
					if (pNode.nodeType === 1 && pNode.tagName === "BR") {
						pNode = pNode.nextSibling;
						continue;
					}
					hasTrailing = true;
					break;
				}
				if (!hasTrailing && parent.nextElementSibling && parent.nextElementSibling.tagName === "VIDEO") {
					var nextVideo = parent.nextElementSibling;
					var nvTarget = nextVideo.getAttribute("data-kantan-attach") || extractAttachTarget(nextVideo.getAttribute("src") || "");
					if (!nvTarget || nvTarget === attachName) {
						return nextVideo;
					}
				}
			}
			return null;
		}

		function generateVideoPosterIfNeeded(attachName, cachedEntry) {
			if (!cachedEntry || cachedEntry.posterUrl || cachedEntry.posterGenerating || typeof document === "undefined") {
				return;
			}
			cachedEntry.posterGenerating = true;
			var tempVideo = document.createElement("video");
			tempVideo.muted = true;
			tempVideo.playsInline = true;
			tempVideo.preload = "auto";
			var cleaned = false;
			var cleanup = function() {
				if (cleaned) return;
				cleaned = true;
				cachedEntry.posterGenerating = false;
				try {
					tempVideo.pause();
					tempVideo.removeAttribute("src");
					tempVideo.load();
				} catch (_) {}
			};
			var captureFrame = function() {
				if (cleaned) return;
				try {
					var w = tempVideo.videoWidth || 640;
					var h = tempVideo.videoHeight || 360;
					if (w > 0 && h > 0) {
						var canvas = document.createElement("canvas");
						canvas.width = w;
						canvas.height = h;
						canvas.getContext("2d").drawImage(tempVideo, 0, 0, w, h);
						var dataUrl = canvas.toDataURL("image/jpeg", 0.85);
						if (dataUrl && dataUrl.indexOf("data:image/") === 0) {
							cachedEntry.posterUrl = dataUrl;
							var vList = document.querySelectorAll("#previewer video");
							for (var idx = 0; idx < vList.length; idx++) {
								if (vList[idx].getAttribute("data-kantan-attach") === attachName) {
									syncVideoPrintThumb(vList[idx], attachName, dataUrl);
								}
							}
							if (typeof updatePageBreaks === "function") {
								updatePageBreaks();
							}
						}
					}
				} catch (_) {}
				cleanup();
			};
			tempVideo.addEventListener("loadeddata", function() {
				try {
					var targetTime = (tempVideo.duration && tempVideo.duration > 0.2) ? 0.1 : 0;
					if (targetTime > 0) {
						tempVideo.currentTime = targetTime;
						return;
					}
				} catch (_) {}
				captureFrame();
			}, { once: true });
			tempVideo.addEventListener("seeked", captureFrame, { once: true });
			tempVideo.addEventListener("error", cleanup, { once: true });
			setTimeout(cleanup, 6000);
			tempVideo.src = cachedEntry.blobUrl;
		}
		
		function syncVideoPrintThumb(videoElem, attachName, posterDataUrl) {
			if (!videoElem || !posterDataUrl) return;
			videoElem.poster = posterDataUrl;
			var nextEl = videoElem.nextElementSibling;
			if (!nextEl || !nextEl.classList || !nextEl.classList.contains("kantan-video-print-thumb")) {
				nextEl = document.createElement("img");
				nextEl.className = "kantan-video-print-thumb";
				nextEl.alt = attachName;
				nextEl.addEventListener("load", function() {
					if (typeof schedulePageBreakUpdate === "function") {
						schedulePageBreakUpdate("video-thumb-load");
					}
				});
				if (videoElem.parentNode) {
					videoElem.parentNode.insertBefore(nextEl, videoElem.nextSibling);
				}
			}
			nextEl.setAttribute("data-kantan-attach", attachName);
			if (nextEl.src !== posterDataUrl) {
				nextEl.src = posterDataUrl;
			}
		}

		function ensureVideoPlayerAttrs(videoElem, attachName, blobUrl) {
			var cachedEntry = videoUrlMap[attachName];
			videoElem.controls = true;
			videoElem.setAttribute("controls", "");
			videoElem.setAttribute("preload", "auto");
			videoElem.setAttribute("playsinline", "");
			videoElem.setAttribute("data-kantan-attach", attachName);
			if (cachedEntry && cachedEntry.posterUrl) {
				syncVideoPrintThumb(videoElem, attachName, cachedEntry.posterUrl);
			}
			if (videoElem.src !== blobUrl) {
				videoElem.src = blobUrl;
			}
			if (cachedEntry && !cachedEntry.posterUrl) {
				generateVideoPosterIfNeeded(attachName, cachedEntry);
			}
			if (videoElem.dataset && !videoElem.dataset.kantanMetadataBound) {
				videoElem.dataset.kantanMetadataBound = "true";
				videoElem.addEventListener("loadedmetadata", function() {
					if (typeof updatePageBreaks === "function") {
						updatePageBreaks();
					}
				});
			}
		}

		// リンク
		var anchors = document.querySelectorAll("#previewer a");
		for(var aIdx = 0; aIdx < anchors.length; aIdx++) {
			(function(anchor) {
				var rawHref = anchor.getAttribute("href") || anchor.href;
				var name = extractAttachTarget(rawHref);
				if (name) {
					var attachElem = document.getElementById("attach-" + name);
					if (attachElem && isAttachVideo(name, attachElem.innerHTML)) {
						var cachedVideo = getCachedVideoBlobUrl(name, true);
						if (cachedVideo) {
							anchor.href = cachedVideo.blobUrl;
							anchor.download = name;
							var adjVideo = findAdjacentVideoForAnchor(anchor, name);
							if (!adjVideo) {
								var nextNode = anchor.nextSibling;
								while (nextNode && nextNode.nodeType === 3 && nextNode.nodeValue.trim() === "") {
									nextNode = nextNode.nextSibling;
								}
								var brElem = (nextNode && nextNode.nodeType === 1 && nextNode.tagName === "BR") ? nextNode : null;
								if (!brElem) {
									brElem = document.createElement("br");
									anchor.parentNode.insertBefore(brElem, anchor.nextSibling);
								}
								adjVideo = document.createElement("video");
								brElem.parentNode.insertBefore(adjVideo, brElem.nextSibling);
							}
							ensureVideoPlayerAttrs(adjVideo, name, cachedVideo.blobUrl);
						}
					} else {
						getFileBlog(name, function(blob){
							if (!(blob instanceof Blob)) {
								return;
							}
							var blobUrl = window.URL.createObjectURL(blob);
							anchor.href = blobUrl;
							anchor.download = name;
						});
					}
				}
			})(anchors[aIdx]);
		}

		// 明示的な video タグの解決
		var videos = document.querySelectorAll("#previewer video");
		for (var vIdx = 0; vIdx < videos.length; vIdx++) {
			var videoElem = videos[vIdx];
			var vName = extractAttachTarget(videoElem.getAttribute("src") || "") || videoElem.getAttribute("data-kantan-attach");
			if (!vName) {
				var sourceElem = videoElem.querySelector("source[src]");
				if (sourceElem) {
					vName = extractAttachTarget(sourceElem.getAttribute("src") || "");
				}
			}
			if (vName) {
				var cachedV = getCachedVideoBlobUrl(vName, true);
				if (cachedV) {
					ensureVideoPlayerAttrs(videoElem, vName, cachedV.blobUrl);
				}
			}
		}
		
		
	function getDiagramSource(element) {
		var clone = element.cloneNode(true);
		var breaks = clone.getElementsByTagName("br");
		while (breaks.length > 0) {
			var br = breaks[0];
			br.parentNode.replaceChild(document.createTextNode("\n"), br);
		}
		return clone.textContent;
	}

	function isMermaidErrorSvg(svgCode) {
		if (window.KantanModules && window.KantanModules.PreviewMermaid) {
			return window.KantanModules.PreviewMermaid.isMermaidErrorSvg(svgCode);
		}
		if (!svgCode || typeof svgCode !== "string") return true;
		return svgCode.indexOf('aria-roledescription="error"') !== -1 ||
			svgCode.indexOf('class="error-text"') !== -1 ||
			svgCode.indexOf('Syntax error in graph') !== -1;
	}

	function cleanupMermaidTempDom(id) {
		if (window.KantanModules && window.KantanModules.PreviewMermaid) {
			return window.KantanModules.PreviewMermaid.cleanupMermaidTempDom(id, document, previewer);
		}
		if (!id || typeof document === "undefined") return;
		var tempIds = ["d" + id, "i" + id, id];
		for (var i = 0; i < tempIds.length; i++) {
			var el = document.getElementById(tempIds[i]);
			if (el && (!previewer || !previewer.contains(el))) {
				if (el.parentNode) {
					el.parentNode.removeChild(el);
				}
			}
		}
	}

	function normalizeMermaidText(rawText) {
		if (window.KantanModules && window.KantanModules.PreviewMermaid) {
			return window.KantanModules.PreviewMermaid.normalizeMermaidText(rawText);
		}
		return rawText;
	}

		// シーケンス図
		if (typeof Diagram !== "undefined") {
			var sequences = document.getElementsByClassName("sequence");
			for (var i = 0; i < sequences.length; i++) {
				var sequence = sequences[i];
				var sequenceSource = getDiagramSource(sequence);
				try {
					var diagram = Diagram.parse(sequenceSource);
					sequence.innerHTML = "";
					diagram.drawSVG(sequence, {theme: 'simple'});
				} catch (e) {
					// 1つの不正な図でプレビュー処理とUI初期化全体を停止させない
					sequence.textContent = sequenceSource;
					addClass(sequence, "diagram-error");
					if (window.console && console.warn) {
						console.warn("シーケンス図を描画できませんでした。", e);
					}
				}
			}
		}
		
		// フローチャート
		if (typeof flowchart !== "undefined") {
			var flows = document.getElementsByClassName("flow");
			for (var i = 0; i < flows.length; i++) {
				var flow = flows[i];
				var flowSource = getDiagramSource(flow);
				try {
					var diagram = flowchart.parse(flowSource);
					flow.innerHTML = "";
					diagram.drawSVG(flow);
				} catch (e) {
					// 旧flowchart.jsが循環経路などで失敗しても、他の機能は継続する
					flow.textContent = flowSource;
					addClass(flow, "diagram-error");
					if (window.console && console.warn) {
						console.warn("フローチャートを描画できませんでした。", e);
					}
				}
			}
		}

		// Mermaid ダイアグラム（full / dev エディションのみ実行）
		if (typeof mermaid !== "undefined") {
			var isDark = document.body && document.body.classList.contains("dark");
			var mermaidTheme = isDark ? "dark" : "default";
			window.__kantanMermaidCache = window.__kantanMermaidCache || {};
			try {
				mermaid.initialize({
					startOnLoad: false,
					theme: mermaidTheme,
					securityLevel: "loose"
				});
			} catch (initErr) {
				if (window.console && console.warn) {
					console.warn("Mermaid初期化エラー:", initErr);
				}
			}

			var mermaidNodes = previewer.querySelectorAll(".mermaid, pre code.lang-mermaid, pre code.language-mermaid");
			for (var mi = 0; mi < mermaidNodes.length; mi++) {
				(function (mi) {
					var node = mermaidNodes[mi];
					var container = node;
					if (node.tagName.toLowerCase() === "code") {
						container = node.closest("pre") || node;
					}
					var mermaidSource = getDiagramSource(node);
					var renderSource = normalizeMermaidText(mermaidSource);
					var diagramId = "kantan-mermaid-" + Date.now() + "-" + mi;
					var cacheKey = mermaidTheme + "\n" + renderSource;
					var isAsyncDiagram = /^\s*(?:%%[^\n]*\n\s*)*(?:mindmap|timeline|flowchart-elk)\b/i.test(renderSource);

					if (window.__kantanMermaidCache[cacheKey] && !isMermaidErrorSvg(window.__kantanMermaidCache[cacheKey])) {
						container.innerHTML = window.__kantanMermaidCache[cacheKey];
						container.classList.add("mermaid-rendered");
						container.classList.remove("mermaid-error");
					} else if ((isAsyncDiagram || typeof mermaid.render !== "function") && typeof mermaid.renderAsync === "function") {
						try {
							mermaid.renderAsync(diagramId, renderSource, function (svgCode, bindFunctions) {
								if (isMermaidErrorSvg(svgCode)) {
									cleanupMermaidTempDom(diagramId);
									container.textContent = mermaidSource;
									container.classList.add("mermaid-error");
									container.classList.remove("mermaid-rendered");
									return;
								}
								window.__kantanMermaidCache[cacheKey] = svgCode;
								container.innerHTML = svgCode;
								container.classList.add("mermaid-rendered");
								container.classList.remove("mermaid-error");
								if (typeof bindFunctions === "function") {
									bindFunctions(container);
								}
								if (typeof schedulePageBreakUpdate === "function") {
									schedulePageBreakUpdate("mermaid-async");
								}
							}, container)["catch"](function (mErr) {
								cleanupMermaidTempDom(diagramId);
								container.textContent = mermaidSource;
								container.classList.add("mermaid-error");
								container.classList.remove("mermaid-rendered");
								if (window.console && console.warn) {
									console.warn("Mermaidを描画できませんでした。", mErr);
								}
							});
						} catch (mErr) {
							cleanupMermaidTempDom(diagramId);
							container.textContent = mermaidSource;
							container.classList.add("mermaid-error");
							container.classList.remove("mermaid-rendered");
							if (window.console && console.warn) {
								console.warn("Mermaidを描画できませんでした。", mErr);
							}
						}
					} else {
						try {
							mermaid.render(diagramId, renderSource, function (svgCode, bindFunctions) {
								if (isMermaidErrorSvg(svgCode)) {
									cleanupMermaidTempDom(diagramId);
									container.textContent = mermaidSource;
									container.classList.add("mermaid-error");
									container.classList.remove("mermaid-rendered");
									return;
								}
								window.__kantanMermaidCache[cacheKey] = svgCode;
								container.innerHTML = svgCode;
								container.classList.add("mermaid-rendered");
								container.classList.remove("mermaid-error");
								if (typeof bindFunctions === "function") {
									bindFunctions(container);
								}
							}, container);
						} catch (mErr) {
							cleanupMermaidTempDom(diagramId);
							container.textContent = mermaidSource;
							container.classList.add("mermaid-error");
							container.classList.remove("mermaid-rendered");
							if (window.console && console.warn) {
								console.warn("Mermaidを描画できませんでした。", mErr);
							}
						}
					}
				})(mi);
			}
		}
		
		// スクロールバーが最下部にある場合、更新後も最下部にする。
		if (scrollLockFlag == true) {
			previewer.scrollTop = previewer.scrollHeight;
		}
		
		// previewedイベントをディスパッチ
		var event = document.createEvent("Event");
		event.initEvent("previewed", true, true);
		previewer.dispatchEvent(event);
	}
	
	function replaceAttachURL(str) {
		if (window.KantanModules && window.KantanModules.PreviewMermaid) {
			return window.KantanModules.PreviewMermaid.replaceAttachUrlInCss(str, function(name) {
				return getCachedImageUrl(name, true);
			});
		}
		var replaced = "";
		var i = 0;
		var prefix = 'url("attach:';
		var surfix = '"';
		while (i < str.length) {
			if ((i + prefix.length) < str.length && str.substr(i, prefix.length) == prefix) {
				i += prefix.length;
				var name = "";
				var c = str.charAt(i++);
				while (c != surfix) {
					name += c;
					c = str.charAt(i++);
				}
				var url = getCachedImageUrl(name, true);
				replaced += (url == null) ? (prefix + name + surfix) : ('url("' + url.blobOrBase64 + surfix);
				continue;
			}
			var c = str.charAt(i++);
			replaced += c;
			if (c == '"') {
				c = str.charAt(i++);
				while (c != '"') {
					replaced += c;
					c = str.charAt(i++);
				}
				replaced += c;
			}
		}
		return replaced;
	}
	
	function loadImage(elem) {
		var name = null;
		if (elem.name) {
			name = elem.name;
		} else if (elem.src) {
			var matchs = elem.src.trim().match(/^attach:(.+)/);
			if (matchs) {
				name = decodeURIComponent(matchs[1]);
			}
		}
		
		if (name == null) {
			return;
		}
		
		loadImageByName(
				name,
				function(width, height) {
				 	// 大きさが決まったら仮のイメージで領域だけ確保しておく
					var canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;
					elem.src = canvas.toDataURL();
				},
				function(imageUrl) {
					elem.src = imageUrl.blobOrBase64;
				});
	}
	
	function loadImageByName(name, onLoadSize, onLoadImage) {
		var base64Script = document.getElementById("attach-" + name);
		if (base64Script != null) {
			var rootElem = base64Script.parentNode;
			var base64 = base64Script.innerHTML;
			var layer64 = rootElem.querySelector("script.layerContent").innerHTML;
			var trimInfo = rootElem.querySelector("script.trimInfo").innerHTML;
			trimInfo = (trimInfo != "") ? JSON.parse(trimInfo) : null;
			
			var cached = getCachedImageUrl(name, false);
			if (cached) {
				onLoadImage(cached);
				return;
			}
			
			if (trimInfo == null) {
				var url = cacheImageUrl(name, base64);
				onLoadImage(url);
				return;
			}
			
			onLoadSize(trimInfo.w, trimInfo.h);
			
			var baseImage = new Image();
			baseImage.onload = function() {
				var canvas = document.createElement("canvas");
				canvas.width = trimInfo.w;
				canvas.height = trimInfo.h;
				var ctx = canvas.getContext('2d');
				ctx.translate(-trimInfo.x, -trimInfo.y);
				ctx.drawImage(baseImage,0, 0);
				if (layer64 != "") {
					var layerImage = new Image();
					layerImage.onload = function() {
						ctx.drawImage(layerImage,0, 0);
						
						var content = canvas.toDataURL();
						var url = cacheImageUrl(name, content);
						onLoadImage(url);
					};
					layerImage.src = layer64;
				} else {
					var content = canvas.toDataURL();
					var url = cacheImageUrl(name, content);
					onLoadImage(url);
				}
			};
			baseImage.src= base64;
		}
	}
	
	function isMaxScroll (id) {
		var elem = document.getElementById(id);
		
		var scrollHeight = elem.scrollHeight;
		var clientHeight = elem.clientHeight;
		var scrollTop = elem.scrollTop;
		var diff = scrollHeight - (clientHeight + scrollTop)
		
		// 小数点付きの計算なので数ピクセルの誤差を許容する
		return (-1.0 <= diff) && (diff <= 1.0);
	}
	
	/* CSSエディタ変更周り */
	// エディタに変化があったらプレビュー予約
	on("#cssEditor", "change", cssChanged);
	on("#cssEditor", "keyup", cssChanged);

	function cssChanged() {
		saved = false;
		var title = document.title;
		if (!title.match(/^\*/)) {
			document.title = "* " + title;
		}
	}

	/* ファイル添付 */
	on("#attachButton", "change", function(e) {
		var elem = e.target;
	    var files = elem.files;
	    attachFiles(files);
	});
	on("body", "dragover", function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		addClass(this, 'onDragover');
	});
	on("body", "drop", function(e) {
		e.stopPropagation();
		e.preventDefault();
		attachFiles(e.dataTransfer.files);
		removeClass(this, "onDragover");
	});
	on("body", "dragleave", function(e){
		removeClass(this, "onDragover");
	});

	function attachFiles(files){
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			var type = files[i].type;
			if (type == "text/html") {
				attachHtmlFile(file)
			} else {
				attachFile(file);
			}
		}
	}
	
	function attachFile(file, fileName) {
		var fr = new FileReader();
		if (fileName) {
			fr.fileName = fileName;
		} else {
			fr.fileName = file.name;
		}
	    fr.onload = function(e) {
			var target = e.target;
			addAttachFileElement(target.fileName, target.result, "", "", true);
		};
		fr.readAsDataURL(file);
	}
	
	function attachHtmlFile(file) {
		var fr = new FileReader();
		fr.fileName = file.name;
		fr.onload = (function (file) {
			return function(e) {
				// <html></html>の中身だけ取り出し疑似的にdomを作る
				var result = e.target.result;
				var innerHtml = result.substring(23, result.length - 8);
				var dummyHtml = document.createElement("html");
				dummyHtml.innerHTML = innerHtml;
				
				// 簡単HTMLの構造か調べる
				var importFlag = false;
				var fileListElement = dummyHtml.querySelector("ul#fileList");
				var editorElement = dummyHtml.querySelector("textarea#editor");
				if (fileListElement && editorElement) {
					showImportDialog(
							"かんたんMarkdownのファイルを検出しました。どの項目をインポートしますか？"
							, function(result){
						if (result.result == true) {
							importKantanMarkdown(result, dummyHtml, file);
						} else {
							attachFile(file);
						}
					});
					
				} else {
					attachFile(file);
				}
			}
		})(file);
		fr.readAsText(file)
	}
	
	function importKantanMarkdown(result, dummyHtml, file) {
		if (result.attach == true) {
			var fileListElement = dummyHtml.querySelectorAll("ul#fileList li");
			for (var i = 0; i < fileListElement.length; i++) {
				var scriptElement = fileListElement[i].querySelector("script");
				var fileName = scriptElement.title;
				var content = scriptElement.innerHTML;
				
				var layerElement = fileListElement[i].querySelector("script.layerContent");
				var layerContent = (layerElement) ? layerElement.innerHTML : "";
				
				var trimInfoElement = fileListElement[i].querySelector("script.trimInfo");
				var trimInfo = (trimInfoElement) ? trimInfoElement.innerHTML : "";
				
				addAttachFileElement(fileName, content, layerContent, trimInfo, false);
			}
			saved = false;
		}
		
		if (result.markdown == true) {
			var editorElement = dummyHtml.querySelector("textarea#editor")
			var editor = document.getElementById("editor");
			editor.value = editor.value + editorElement.value;
			saved = false;
		}
		
		if (result.css == true) {
			var styleElement = dummyHtml.querySelector("#previewerStyle");
			if (styleElement) {
				var cssEditor = document.getElementById("cssEditor");
				var dummyCssEditor = dummyHtml.querySelector("#cssEditor");
				if (styleElement.innerHTML.trim() != "") {
					cssEditor.value = styleElement.innerHTML;
					saved = false;
				} else if (dummyCssEditor) {
					cssEditor.value = dummyCssEditor.value;
					saved = false;
				}
			}
		}
		
		doPreview();
	} 
	
	function showImportDialog(msg, callback) {
		document.getElementById("btn-save").disabled =  true;
		document.getElementById("importDialogMessage").innerText = msg;
		var dialogElement = document.getElementById("importDialog");
		dialogElement.querySelector("form").reset();
		
		document.getElementById("importDialogOkButton").onclick = function(e){
			e.preventDefault();
			hide(dialogElement);
			document.getElementById("importDialogMessage").innerText = "";
			
			var result = {
				result: true,
				attach: document.getElementById("importDialogAttach").checked,
				markdown:document.getElementById("importDialogMarkdown").checked,
				css:document.getElementById("importDialogCss").checked,
			}
			callback(result);
			
			if (document.getElementById("importDialogOkButton")) {
				document.getElementById("importDialogOkButton").onclick = null;
			}
			if (document.getElementById("importDialogCancelButton")) {
				document.getElementById("importDialogCancelButton").onclick;
			}
			if (document.getElementById("btn-save")) {
				document.getElementById("btn-save").disabled =  false;
			}
			
			return false;
		};
		
		
		document.getElementById("importDialogCancelButton").onclick = function(e) {
			e.preventDefault();
			hide(dialogElement);
			document.getElementById("importDialogMessage").innerText = "";
			
			callback({result:false});
			
			delete document.getElementById("importDialogOkButton").onclick;
			delete document.getElementById("importDialogCancelButton").onclick;
			document.getElementById("btn-save").disabled =  false;
			
			return false;
		}
		
		showBlock(dialogElement);
		
		var body = document.querySelector("body");
		dialogElement.style.top = "10px";
		dialogElement.style.left = ((body.offsetWidth / 2.0) - (dialogElement.offsetWidth / 2.0)) + "px";
	}
	
	function addAttachFileElement(fileName, content, layerContent, trimInfo, insertImgTag) {
		var name = (window.KantanModules && window.KantanModules.AttachmentManager)
			? window.KantanModules.AttachmentManager.resolveUniqueAttachName(fileName, function(candidate) {
				return Boolean(document.querySelector("#fileList script[title='" + candidate + "']"));
			})
			: fileName;
		if (!(window.KantanModules && window.KantanModules.AttachmentManager)) {
			var existingScript = document.querySelector("#fileList script[title='" + name + "']");
			var i = 2;
			while (existingScript) {
				var pos = fileName.lastIndexOf(".");
				pos = (pos != -1) ? pos : fileName.length;
				name = fileName.substring(0, pos) + "_" + i + fileName.substr(pos);
				existingScript = document.querySelector("#fileList script[title='" + name + "']");
				i++;
			}
		}
		
		var li = document.createElement("li");
		
		var script = document.createElement("script");
		script.type  = "text/template";
		script.id    = "attach-" + name;
		script.title = name;
		script.innerHTML = content;
		li.appendChild(script);
		
		var layerScript = document.createElement("script");
		layerScript.type  = "text/template";
		addClass(layerScript, "layerContent");
		layerScript.innerHTML = layerContent;
		li.appendChild(layerScript);
		
		var trimScript = document.createElement("script");
		trimScript.type  = "text/template";
		addClass(trimScript, "trimInfo");
		trimScript.innerHTML = trimInfo;
		li.appendChild(trimScript);
		
		var upButton = document.createElement("button");
		addClass(upButton, 'upButton');
		upButton.innerHTML = "↑";
		on(upButton, "click", onUpButtonClicked);
		li.appendChild(upButton);
		
		var downButton = document.createElement("button");
		addClass(downButton, 'downButton');
		downButton.innerHTML = "↓";
		on(downButton, "click", onDownButtonClicked);
		li.appendChild(downButton);
		
		var input  = document.createElement("input");
		input.type = "text";
		addClass(input, 'fileName');
		input.value = name;
		on(input, "blur", onFileNameChanged);
		li.appendChild(input);
		
		var insertButton = document.createElement("button");
		addClass(insertButton, 'insertButton');
		insertButton.innerHTML = "Insert Tag";
		on(insertButton, "click", onInsertButtonClicked);
		li.appendChild(insertButton);
		
		var isImage = content.match("data:image/.+?;base64,");
		var editoButton = document.createElement("button");
		addClass(editoButton, 'editButton');
		editoButton.innerHTML = "Edit";
		editoButton.disabled = !isImage;
		on(editoButton, "click", onEditButtonClicked);
		li.appendChild(editoButton);
		
		var downloadButton = document.createElement("button");
		addClass(downloadButton, 'downloadButton');
		downloadButton.innerHTML = "Download";
		on(downloadButton, "click", onDownloadButtonClicked);
		li.appendChild(downloadButton);
		
		var detachButton = document.createElement("button");
		addClass(detachButton, 'detachButton');
		detachButton.innerHTML = "×";
		on(detachButton, "click", onDetachButtonClicked);
		li.appendChild(detachButton);
		
		document.getElementById("fileList").appendChild(li);
		
		// ファイル添付領域を開く
		var editor = document.getElementById("editor");
		var filer = document.getElementById("filer");
		if (!isEditMode()) {
			toggleMode();
		}
		if (!isVisible(filer)) {
			openFiler();
		}
		
		// イメージタグを挿入
		var setting = document.querySelector("#setting-insert-img-tag");
		if (isImage && insertImgTag && setting && setting.checked) {
			var tag = '<img src="attach:' + name  + '">';
			insertToEditor(document.getElementById("editor"), tag);
		}
		
		saved = false;
		queuePreview();
	}

	function getFileBlog(name, onLoaded) {
		var script = document.getElementById("attach-" + name);
		if (!script) {
			onLoaded(null);
			return;
		}
		
		var callBack = function(imageUrl) {
			
		}
		
		var base64 = script.innerHTML;
		var mimeType = base64.match(/^\s*data:(.*);base64/)[1];
		if (mimeType.match("^image")) {
			loadImageByName(name, function(){}, function(imageUrl) {
				onLoaded(base64ToBlob(imageUrl.base64));
			});
		} else {
			onLoaded(base64ToBlob(base64));
		}
	}

	function base64ToBlob(base64) {
		if (window.KantanModules && window.KantanModules.AttachmentManager) {
			return window.KantanModules.AttachmentManager.base64ToBlob(base64);
		}
		var mimeType = base64.match(/^\s*data:(.*);base64/)[1];
		var bin = atob(base64.replace(/^.*,/, ''));
		var buffer = new Uint8Array(bin.length);
		for (var i = 0; i < bin.length; i++) {
			buffer[i] = bin.charCodeAt(i);
		}
		var blob = new Blob([buffer.buffer], {
			type: mimeType
		});
		return blob;
	}

	/* 添付ファイル並び替え */
	on(".upButton", "click", onUpButtonClicked);
	function onUpButtonClicked(e) {
		var currentLi = e.target.parentNode;
		var previousLi = currentLi.previousElementSibling;
		if (previousLi) {
			var ul = currentLi.parentNode;
			ul.insertBefore(currentLi, previousLi);
		}
	}
	
	on(".downButton", "click", onDownButtonClicked);
	function onDownButtonClicked(e) {
		var currentLi = e.target.parentNode;
		var nextLi = currentLi.nextElementSibling;
		if (nextLi) {
			var ul = currentLi.parentNode;
			ul.insertBefore(nextLi, currentLi);
		}
	}
	
	/* ファイル削除 */
	on(".detachButton", "click", onDetachButtonClicked);
	function onDetachButtonClicked(e) {
		// 削除ボタンが押されたら親要素(li)ごと削除
		if(window.confirm('削除していいですか?')){
			var parent = e.target.parentNode;
			var sc = parent.querySelector("script");
			var name = sc.title || sc.name;
			uncacheImageUrl(name);
			uncacheVideoUrl(name);
			parent.parentNode.removeChild(parent);
			saved = false;
		}
	}

	/* ファイル名変更 */
	var fileNameElems = document.getElementsByClassName("fileName");
	for (var i = 0; i < fileNameElems.length; i++) {
		// なぜかvale属性の変更が保存されないので起動時に引っ張ってきてやる
		var fileNameElem = fileNameElems[i];
		var script = fileNameElem.parentNode.querySelector("script");
		var fileName = script.title;
		fileNameElem.value = fileName;
	}
	on("#fileList input", "blur", onFileNameChanged);
	function onFileNameChanged (e) {
		var target = e.target;
		var name = target.value.trim();
		var selfName = target.parentNode.querySelector("script").title;
		var checkResult = (window.KantanModules && window.KantanModules.AttachmentManager)
			? window.KantanModules.AttachmentManager.validateAttachmentRename(name, selfName, function(candidate) {
				return Boolean(document.querySelector("#fileList script[title='" + candidate + "']"));
			})
			: null;
		
		if (checkResult ? checkResult.unchanged : (name == selfName)) {
			return true;
		}
		if (checkResult ? (checkResult.reason === "empty") : (name == "")) {
			alert("名前は必ず入力してください。");
			e.target.focus();
			return false;
		}
		var isDup = checkResult ? (checkResult.reason === "duplicate") : Boolean(document.querySelector("#fileList script[title='" + name + "']"));
		if (isDup) {
			alert("名前が重複しています。");
			target.focus();
			target.selectionStart = 0;
			target.selectionEnd = name.length;
			return false;
		} 
		var scriptTag = target.parentNode.querySelector("script");
		uncacheImageUrl(scriptTag.title);
		uncacheVideoUrl(scriptTag.title);
		scriptTag.id =  "attach-" + name;
		scriptTag.title = name;
		saved = false;
		queuePreview();
		return true;
	}

	/* 添付ファイルをエディタに挿入 */
	on(".insertButton", "click", onInsertButtonClicked);
	function onInsertButtonClicked (e) {
		var target = e.target;
		var script = target.parentNode.querySelector("script");
		var isImage = script.innerHTML.match("data:image/.+?;base64,");
		var fileName = script.title;
		
		var editor = document.getElementById("editor");
		if (isVisible(editor)) {
			var insertText = (window.KantanModules && window.KantanModules.AttachmentManager)
				? window.KantanModules.AttachmentManager.buildAttachmentInsertTag(fileName, script.innerHTML, "markdown")
				: (isImage
					? ('<img src="attach:' + fileName  + '">')
					: (isAttachVideo(fileName, script.innerHTML)
						? ('<a href="attach:' + fileName + '">' + fileName + '</a><br>\n<video controls preload="metadata" playsinline src="attach:' + fileName + '"></video>')
						: ('<a href="attach:' + fileName +'">' + fileName + '</a>')));
			insertToEditor(editor, insertText);
		}
		var cssEditor = document.getElementById("cssEditor");
		if (isVisible(cssEditor) && isImage) {
			var cssInsertText = (window.KantanModules && window.KantanModules.AttachmentManager)
				? window.KantanModules.AttachmentManager.buildAttachmentInsertTag(fileName, script.innerHTML, "css")
				: ('url("attach:' + fileName  + '")');
			insertToEditor(cssEditor, cssInsertText);
		}
	}
	
	function insertToEditor(editor, insertText) {
		var text = editor.value;
		var newPos = editor.selectionStart + insertText.length;
		var part1 = text.substring(0, editor.selectionStart);
		var part2 = text.substr(editor.selectionEnd);
		editor.value = part1 + insertText + part2;
		editor.selectionStart = newPos;
		editor.selectionEnd = newPos;
		updateScrollPos(editor);
		var event= document.createEvent("Event");
		event.initEvent("changeByJs",false,false);
		editor.dispatchEvent(event);
	}
	
	/* 添付ファイルをダウンロード */
	on(".downloadButton", "click", onDownloadButtonClicked);
	function onDownloadButtonClicked (e) {
		var target = e.target;
		var script = target.parentNode.querySelector("script");
		var fileName = script.title;
		getFileBlog(fileName, function(blob) {
			if (window.KantanModules && window.KantanModules.SaveExport) {
				window.KantanModules.SaveExport.triggerBlobDownload(blob, fileName, document, window);
			} else {
				var blobURL = window.URL.createObjectURL(blob);
				var a = document.createElement('a');
				a.download = fileName;
				a.href = blobURL;
				a.click();
			}
		});
	}
	
	/* お絵かき周り */
	var drawer = new KantanDrawer(document.querySelector("#drawArea"));
	on(".editButton", "click", onEditButtonClicked);
	function onEditButtonClicked(e) {
		var rootElement = e.target.parentNode;
		var contentElement = rootElement.querySelector("script");
		var layerElement = rootElement.querySelector("script.layerContent");
		var trimElement = rootElement.querySelector("script.trimInfo");
		
		addClass(document.querySelector("body"), "drawMode");
		
		var nav = document.querySelector("nav");
		var attach = document.querySelector("#attach");
		var wrapper = document.querySelector("#wrapper");
		
		hide(nav);;
		hide(attach);
		hide(wrapper);
		
		drawer.show(contentElement.innerHTML,
				layerElement.innerHTML,
				trimElement.innerHTML,
				function(layerContent, trimInfo) {
					layerElement.innerHTML = layerContent;
					trimElement.innerHTML = trimInfo;
					
					showBlock(nav);
					showBlock(attach);
					showBlock(wrapper);
					removeClass(document.querySelector("body"), "drawMode");
					
					uncacheImageUrl(contentElement.title);
					doPreview();
				},
				function() {
					showBlock(nav);
					showBlock(attach);
					showBlock(wrapper);
					removeClass(document.querySelector("body"), "drawMode");
				}
		);
	}
	
	/* 添付ファイル領域開け閉め */
	on("#attachToggleButton", "click", function() {
		if (isVisible(document.getElementById("filer"))){
			closeFiler();
		} else {
			openFiler();
		}
	});
	on("#btn-toggle-attach", "click", function() {
		// もし現在閲覧モード（プレビューモード）なら、自動的に編集モードへ移行する
		if (!isEditMode()) {
			toggleMode();
		}
		
		// 底のボタンのクリックを呼ぶのではなく、直接 filer の表示・非表示関数を実行する
		if (isVisible(document.getElementById("filer"))){
			closeFiler();
		} else {
			openFiler();
		}
	});

	/* プレビュー領域開け閉め */
	on("#previewToggleButton", "click", function() {
		if (isVisible(document.getElementById("previewer"))){
			closePreview();
		} else {
			openPreview();
		}
	});

	function openFiler() {
		document.getElementById("attachToggleButton").innerText = "添付ファイルを隠す(Alt+↑)";
		showBlock(document.getElementById("attachForm"));
		showBlock(document.getElementById("filer"));
		var btnToggleAttach = document.getElementById("btn-toggle-attach");
		if (btnToggleAttach) {
			btnToggleAttach.querySelector(".btn-text").innerText = "隠す";
		}
		doLayout();
	}

	function closeFiler() {
		document.getElementById("attachToggleButton").innerText = "添付ファイルを表示(Alt+↓)";
		hide(document.getElementById("attachForm"));
		hide(document.getElementById("filer"));
		var btnToggleAttach = document.getElementById("btn-toggle-attach");
		if (btnToggleAttach) {
			btnToggleAttach.querySelector(".btn-text").innerText = "画像を添付";
		}
		doLayout();
	}

	function openPreview() {
		// エディタサイズに相対値を利用しているためプレビュー表示されていない場合のみ実行
		// 閲覧モード時は実行しない
		var editorTabWrapper = document.getElementById("editorTabWrapper");
		var previewer = document.getElementById("previewer");
		var resizeHandle = document.getElementById("resize-handle");
		if (isEditMode() && !isVisible(previewer)) {
			document.getElementById("previewToggleButton").innerText = "プレビューを隠す(Alt+→)";
			removeClass(editorTabWrapper, "fullWidth");
			showBlock(previewer);
			showBlock(resizeHandle);
			doLayout();
		}
	}

	function closePreview() {
		// エディタサイズに相対値を利用しているためプレビュー表示されている場合のみ実行
		// 閲覧モード時は実行しない
		var editorTabWrapper = document.getElementById("editorTabWrapper");
		var previewer = document.getElementById("previewer");
		var resizeHandle = document.getElementById("resize-handle");
		if (isEditMode() && isVisible(previewer)) {
			document.getElementById("previewToggleButton").innerText = "プレビューを表示(Alt+←)";
			addClass(editorTabWrapper, "fullWidth");
			hide(previewer);
			hide(resizeHandle);
			doLayout();
		}
	}

	/* 保存 */
	var contentAtSave = editor.value;
	on("#btn-save", "click", save);
	function save() {
		var html = getHTMLForSave();
		var cleanTitle = document.title.replace(/^\* /, "");
		var blob = new Blob([html], {type: "text/html;charset=utf-8"});
		if (window.KantanModules && window.KantanModules.SaveExport) {
			window.KantanModules.SaveExport.triggerBlobDownload(blob, cleanTitle + ".html", document, window);
		} else {
			var blobURL = window.URL.createObjectURL(blob);
			var a = document.createElement('a');
			a.download = cleanTitle + ".html";
			a.href = blobURL;
			a.click();
		}
	}

	function getHTMLForSave() {
		var wrapperScrollTop = document.getElementById("wrapper").scrollTop;
		var previewerScrollTop = document.getElementById("previewer").scrollTop;
		var hasSaveExport = Boolean(window.KantanModules && window.KantanModules.SaveExport);

		// Stage 1: Collect current markdown, CSS, attachments, and settings state
		var saveState = hasSaveExport
			? window.KantanModules.SaveExport.collectDocumentSaveState(document)
			: null;
		var saveUpdateBtn = document.getElementById("updateButton");
		var saveHref = saveUpdateBtn ? (saveUpdateBtn.getAttribute("href") || "") : "";
		var isPrev = (window.location && window.location.pathname && window.location.pathname.indexOf("/dist/preview/") !== -1) || saveHref.indexOf("/dist/preview/") !== -1;

		// Stage 2: Assemble and sanitize/escape save payload
		var savePayload = (hasSaveExport && saveState)
			? window.KantanModules.SaveExport.prepareSavePayload(saveState, { isPreviewPath: isPrev })
			: null;
		
		// アップデート用のscriptタグを消す
		document.querySelector("#updateScriptArea").innerHTML = "";
		
		// テキストエリアは値を入れなおさないと保存されない。
		var editor = document.getElementById("editor");
		editor.innerHTML = savePayload ? savePayload.escapedMarkdown : editor.value.replace(/</g, "\x26lt;");
		
		var cssEditor = document.getElementById("cssEditor");
		cssEditor.innerHTML = savePayload ? savePayload.rawCss : cssEditor.value;
		
		var toggleFlag = isEditMode();
		if (toggleFlag == true) {
			toggleMode();
		}
		addClass(document.querySelector("body"), "initialState");
		
		/* ファイルの肥大化を防ぐため中身を消去 */
		if (typeof destroyPageBreakMeasurement === "function") {
			destroyPageBreakMeasurement();
		}
		if (hasSaveExport && typeof window.KantanModules.SaveExport.cleanupTemporaryDomForSave === "function") {
			window.KantanModules.SaveExport.cleanupTemporaryDomForSave(document);
		}
		document.getElementById("previewer").innerHTML = "";
		document.getElementById("message-area").innerHTML = "";
		document.getElementById("previewerStyle").innerHTML="";
		var strayMermaid = document.querySelectorAll('#kantan-print-measure-frame, .kantan-print-measure-frame, #kantan-page-break-overlay, .kantan-page-break-overlay, .page-break-indicator, div[id^="dkantan-mermaid-"], iframe[id^="ikantan-mermaid-"], body > svg[id^="kantan-mermaid-"]');
		for (var sm = 0; sm < strayMermaid.length; sm++) {
			if (strayMermaid[sm].parentNode) {
				strayMermaid[sm].parentNode.removeChild(strayMermaid[sm]);
			}
		}
		
		// 不要なdiffの原因となるスタイルなどを削除
		if (savePayload) {
			document.title = savePayload.cleanTitle;
		} else if (document.title.match(/^\* .*/)) {
			document.title = document.title.substr("\* ".length);
		}
		
		var stylees = document.querySelectorAll("*[style]");
		for (var i = 0; i < stylees.length; i++) {
			var stylee = stylees[i];
			stylee.removeAttribute("style");
		}
		
		document.querySelector("#previewer").className = "full-width";
		if (saveUpdateBtn) {
			var targetUpdateUrl = savePayload
				? savePayload.updateScriptUrl
				: (isPrev ? "https://hiro-gj.github.io/KanTanMarkdown/dist/preview/kantanUpdate.js" : "https://hiro-gj.github.io/KanTanMarkdown/dist/kantanUpdate.js");
			saveUpdateBtn.setAttribute("href", targetUpdateUrl);
		}
		var newDocLinks = document.querySelectorAll('a[href*="ktm-new.html"]');
		for (var n = 0; n < newDocLinks.length; n++) {
			newDocLinks[n].setAttribute("href", savePayload ? savePayload.newDocUrl : "https://hiro-gj.github.io/KanTanMarkdown/ktm-new.html");
		}
		var tabLinks = document.querySelectorAll("#markdownTab, #cssTab");
		for (var t = 0; t < tabLinks.length; t++) {
			tabLinks[t].setAttribute("href", "javascript:void(0)");
		}
		
		// Stage 3: Serialize into self-contained single-file HTML document
		if (typeof destroyPageBreakMeasurement === "function") {
			destroyPageBreakMeasurement();
		}
		if (hasSaveExport && typeof window.KantanModules.SaveExport.cleanupTemporaryDomForSave === "function") {
			window.KantanModules.SaveExport.cleanupTemporaryDomForSave(document);
		}
		var html;
		if (hasSaveExport) {
			html = window.KantanModules.SaveExport.serializeSingleHtmlDocument(document.getElementsByTagName("html")[0].innerHTML);
		} else {
			html = "<!doctype html>\n<html>\n";
			html += document.getElementsByTagName("html")[0].innerHTML;
			var idx = html.lastIndexOf("/script>");
			html = html.substring(0, idx) + "/script>\n</body>\n</html>";
		}
		
		contentAtSave = editor.value;
		saved = true;
		removeClass(document.querySelector("body"), "initialState");
		document.documentElement.style.setProperty("--editor-width", getItem("editor-width", "50%"));
		if (typeof applyEditorZoom === "function") {
			applyEditorZoom();
		}
		if (toggleFlag == true) {
			toggleMode();
		} else {
			doPreview();
		}
		
		document.getElementById("previewer").scrollTop = previewerScrollTop;
		document.getElementById("wrapper").scrollTop = wrapperScrollTop;
		return html;
	}

	/* 更新時、終了時の警告 */
	var saved = true;
	window.onbeforeunload = function() {
		if (!saved) {
			return "ドキュメントが保存されていません。"
		}
	}

	on("#editor", "input", updateSavedFlag);

	function updateSavedFlag() {
		if (contentAtSave == document.getElementById("editor").value) {
			saved = true;
		} else {
			saved = false;
		}
	}

	/* 見出し同期 */

	on("#previewer", "previewed", function(e) {
		if (isEditMode()) {
			var headings = e.target.querySelectorAll("h1, h2, h3, h4, h5, h6");
			for (var i = 0; i < headings.length; i++) {
				// 見出しにイベントを設定する。メモリリーク対策でプレビュー時に
				// イベントを外しやすくするために、on**で実装する。 
				headings[i].onmouseover = function(){
					this.style.cursor = "pointer";
				}
				headings[i].onclick = headingSyncToEditor;
			}
		}
	});
	
	on("#previewer", "prepreview", function(e) {
		var headings = document.getElementById("previewer")
				.querySelectorAll("h1, h2, h3, h4, h5, h6");
		for (var i = 0; i < headings.length; i++) {
			headings[i].onmouseover = null;
			headings[i].onclick = null;
		}
	});

	function headingSyncToPreviewer() {
		var editor = document.getElementById("editor");
		var previewer = document.getElementById("previewer");
		
		var num = getCurrentNumberOfHeading(editor);
		scrollPreviewerToHeading(previewer, num);
	}

	function headingSyncToEditor(e) {
		var editor = document.getElementById("editor");
		var previewer = document.getElementById("previewer");
		var num = getNumberOfHeading(previewer, e.target);
		scrollEditorToHeading(editor, num);
	}

	function getNumberOfHeading(previewer, elem) {
		var headings = previewer.querySelectorAll("h1, h2, h3, h4, h5, h6");
		var i;
		for (i = 0; i < headings.length; i++) {
			if (headings[i] == elem) {
				break;
			}
		}
		return i + 1;
	}

	function scrollEditorToHeading(editor, num) {
		var value = editor.value;
		var processedLines = processForHeadingSync(value, value.length);

		
		var headingCount = 0;
		var i;
		for (var i = 0; i < processedLines.length; i++) {
			var line = processedLines[i];
			if (line.match(/^# .+$/)) {
				headingCount++;
				
				if (headingCount == num) {
					break;
				}
			}
		}
		
		var j = 0;
		if (i != 0) {
			var lineBreakCount = 0;
			for (j = 0; j < value.length ; j++) {
				var c = value.charAt(j);
				if (c == "\n") {
					lineBreakCount++;
					if (lineBreakCount == i) {
						j++;
						break;
					}
				}
			}
		}
		
		var end = editor.value.indexOf("\n", j);
		end = (end == -1) ? editor.value.length : end;
		
		editor.selectionStart = j;
		editor.selectionEnd = end;
		updateScrollPos(editor);
		// chromeだとupdateScrollPosのバグで強制的にsaved=trueになってしまう
		// そのため、updateSavedFlagを呼び出して元に戻す。
		// TODO いつか治したい
		updateSavedFlag();
		editor.focus();
	}

	function getCurrentNumberOfHeading(editor) {
		var value = editor.value;
		
		// ==や--によるheadingに対応するため
		// キャレットの次の行まで読み込む
		var length = editor.selectionStart;
		var lineBreakCount = 0;
		while ((length < value.length) && (lineBreakCount < 2)) {
			if (value.charAt(length) == "\n") {
				lineBreakCount++;
			}
			length++;
		}
		length--;
		
		var processed = processForHeadingSync(value, length);
		if ((lineBreakCount == 2)
				&& processed[processed.length - 1].match(/^#{1,6}\s(.+)$/)) {
			// キャレットの次の行がheadingだったらそれは捨てる
			processed.pop();
		}
		return processed.join().split("# ").length - 1;
	}

	function scrollPreviewerToHeading(previewer, numberOfHeading) {
		if (numberOfHeading == 0) {
			previewer.scrollTop = 0;
		} else {
			var hElems = previewer.querySelectorAll("h1, h2, h3, h4, h5, h6");
			var elem = hElems[numberOfHeading - 1];
			previewer.scrollTop = elem.offsetTop - previewer.offsetTop;
		}
	}

	function processForHeadingSync(str, length) {
		var style = window.getComputedStyle(editor, '');
		var tabSize = style.tabSize
					|| style.MozTabSize
					|| 8;
		tabSize = Number(tabSize);
		if (window.KantanModules && window.KantanModules.PreviewMermaid) {
			return window.KantanModules.PreviewMermaid.parseLinesForHeadingSync(str, length, tabSize);
		}
		return str.substring(0, length).split("\n");
	}

	function updateScrollPos(editor) {
		// 初期状態を保存
		var text = editor.value;
		var selectionStart = editor.selectionStart;
		var selectionEnd   = editor.selectionEnd;

		// insertTextコマンドで適当な文字(X)の追加を試みる
		var isInsertEnabled;
		try {
			isInsertEnabled = document.execCommand("insertText", false, "X");
		} catch(e) {
			// IE10では何故かfalseを返さずに例外が発生するのでcatchで対応する
			isInsertEnabled = false;
		}
		
		if (isInsertEnabled) {
			// insertTextに成功したらChrome
			// chromeはどう頑張ってもまっとうな手段が通用しない。
			// 苦肉の策としてselectionStart,endを揃えてから
			// 一旦フォーカスを外してすぐに戻す。そうするとスクロールバーが追従する
			// これにより、chromeではblurやfocusイベントはまともに使えなくなる黒魔術
			editor.value = text;
			editor.selectionStart = selectionStart;
			editor.selectionEnd = selectionStart;
			editor.blur();
			editor.focus();
			
			// valは戻してあるのでキャレット位置のみ元に戻す
			editor.selectionStart = selectionStart;
			editor.selectionEnd = selectionEnd;
		} else {
			// IE,FirefoxはinsertTextに失敗するのでval関数で適当な文字(X)を挿入する。
			// IEではその後にその文字を選択してdeleteコマンドで削除するとスクロールバーが追従する
			var part1 = text.substring(0, selectionStart);
			var part2 = text.substr(selectionEnd);
			editor.value = part1 + "X" + part2;
			editor.selectionStart = part1.length;
			editor.selectionEnd = part1.length + 1;
			var isDeleteEnabled = document.execCommand("delete", false, null);
			
			// 追従した後はvalとキャレットを元に戻す
			editor.value = text;
			editor.selectionStart = selectionStart;
			editor.selectionEnd = selectionEnd;
		}
	}
	
	/* Markdown, CSS切り替え */
	on("#markdownTab", "click", function(e) {
		e.preventDefault();
		showMarkdown();
		return false;
	});
	
	on("#cssTab", "click", function(e) {
		e.preventDefault();
		showCss(e);
		return false;
	});
	
	function showMarkdown() {
		var markdownTab = document.querySelector("#markdownTab").parentNode;
		addClass(markdownTab, "selected");
		var editor = document.querySelector("#editor");
		showBlock(editor);
		editor.focus();
		
		var cssTab = document.querySelector("#cssTab").parentNode;
		removeClass(cssTab, "selected");
		var cssEditor = document.querySelector("#cssEditor");
		hide(cssEditor);
	}
	
	function showCss() {
		var markdownTab = document.querySelector("#markdownTab").parentNode;
		removeClass(markdownTab, "selected");
		var editor = document.querySelector("#editor");
		hide(document.querySelector("#editor"));
		
		var cssTab = document.querySelector("#cssTab").parentNode;
		addClass(cssTab, "selected");
		var cssEditor = document.querySelector("#cssEditor");
		showBlock(cssEditor);
		cssEditor.focus();
	}
	
	function addAttachEditLayer(fileName, content) {
		var script = document.createElement("script");
		script.type  = "text/template";
		script.className = "editLayer";
		script.innerHTML = content;
		
		var attach = document.getElementById("attach-" + fileName);
		var parent = attach.parentNode;
		parent.insertBefore(script, attach.nextSibling);
	}
	
	/* 画面キャプチャ貼り付け */
	// Chrome向け
	on("#paste-area", "paste",function(e){
		if (!e.clipboardData || !e.clipboardData.types) {
			return true;
		}
		
		var fileFlag = false;
		for (var i=0; i < e.clipboardData.types.length; i++) {
			if (e.clipboardData.types[i] == "Files") {
				fileFlag = true;
				break;
			}
		}
		if (fileFlag == false) {
			return true;
		}
		
		e.preventDefault();
		for (var i = 0; i < e.clipboardData.items.length; i++) {
			attachFile(e.clipboardData.items[i].getAsFile(), "clipboard");
		}
		return false;
	});
	
	// FF, IE向け
	on("#paste-area", "keyup",function(e){
		e.preventDefault();
		
		var dummyElement = document.createElement("div");
		dummyElement.innerHTML = this.innerHTML;
		var imgElement = dummyElement.querySelector("img");
		if (imgElement) {
			var base64 = imgElement.src;
			addAttachFileElement("clipboard", base64, "", "", true);
		}
		
		this.innerHTML = "ここをクリックしてCtrl+Vでクリップボードの画像を添付できます";
		return false;
	});
	
	/* ショートカットキー */
	on("body", "keydown", function(event) {
		var code = (event.keyCode ? event.keyCode : event.which);
		
		if (isDrawMode()) {
			if (code == 83 && (event.ctrlKey || event.metaKey)){
				event.preventDefault();
				return false;
			} else {
				return true;
			}
		}
		
		if (code == 27) {
			// ESCキー
			event.preventDefault();
			
			var settingsPanel = document.getElementById("settings-panel");
			if (settingsPanel && !settingsPanel.hasAttribute("hidden")) {
				settingsPanel.setAttribute("hidden", "");
			} else {
				// 閲覧/編集モード切り替え
				var toggleBtn = document.getElementById("btn-toggle-mode");
				if (isEnable(toggleBtn)) {
					toggleBtn.click();
				}
			}
			return false;
		}
		
		if (code == 83 && event.shiftKey && (event.ctrlKey || event.metaKey)) {
			// CTRL+SHIFT+Sで書き出し
			event.preventDefault();
			var exportBtn = document.getElementById("btn-export");
			if (isEnable(exportBtn)) {
				exportBtn.click();
			}
			return false;
		}
		
		if (code == 83 && (event.ctrlKey || event.metaKey)){
			// CTRL+Sで保存する
			event.preventDefault();
			
			var saveButton = document.getElementById("btn-save");
			if (isEnable(saveButton)) {
				saveButton.click();
			}
			return false;
		}
		
		if (code == 116 ||
				((code == 82) && (event.ctrlKey || event.metaKey))){
			// F5 or Ctrl + Rでエディタとプレビューアを同期
			event.preventDefault();
			doPreview();
			return false;
		}
		
		if (code == 112){
			// F1でヘルプ
			event.preventDefault();
			
			var helpButton = document.getElementById("helpButton");
			helpButton.click();
			
			return false;
		}

		if ((code == 37) && event.altKey) {
			// Alt+←
			event.preventDefault();
			openPreview();
			return false;
		}

		if ((code == 38) && event.altKey) {
			// Alt+↑
			event.preventDefault();
			closeFiler();
			return false;
		}

		if ((code == 39) && event.altKey) {
			// Alt+→
			event.preventDefault();
			closePreview();
			return false;
		}
		
		if ((code == 40) && event.altKey) {
			// Alt+↓
			event.preventDefault();
			openFiler();
			return false;
		}
		
		if (code == 113) {
			// F2で見出し同期（エディタ→プレビューア）
			event.preventDefault();
			headingSyncToPreviewer();
			return false;
		}
		
		return true;
	});
	
	function isEditMode() {
		return isVisible(document.querySelector("#editorTabWrapper"));
	}
	
	function isDrawMode() {
		return document.querySelector("body").classList.contains("drawMode");
	}
	
	function isEnable(elem) {
		return elem &&
				((typeof elem.disabled === "undefined")
				|| (elem.disabled == false));
	}

	function isVisible(elem) {
		var style = window.getComputedStyle(elem, '');
		if (style.display == "none") {
			return false;
		}
		var parent = (elem.tagName.toLowerCase() == "body") ? null : elem.parentNode;
		if (!parent) {
			return true;
		} else {
			return isVisible(parent);
		}
	}

	function showBlock(elem) {
		elem.style.display = "";
		if (!isVisible(elem)) {
			elem.style.display = "block";
		}
	}

	function hide(elem) {
		elem.style.display = "";
		if (isVisible(elem)) {
			elem.style.display = "none";
		}
	}
	
	function addClass(elem, className) {
		elem.classList.add(className);
	}
	
	function removeClass(elem, className) {
		elem.classList.remove(className);
		if (elem.className == "") {
			elem.removeAttribute("class");
		}
	}

	// 新規移植機能: リサイズ、目次、書き出し（エクスポート）

	// --- 1. リサイズハンドル ---
	var resizeHandle = document.getElementById("resize-handle");
	var editorTabWrapper = document.getElementById("editorTabWrapper");
	var isResizing = false;

	on(resizeHandle, "mousedown", startResize);
	on(resizeHandle, "touchstart", startResize);

	function startResize(e) {
		isResizing = true;
		addClass(resizeHandle, "active");
		document.body.style.userSelect = "none";
		document.body.style.cursor = "col-resize";
		
		window.addEventListener("mousemove", resize);
		window.addEventListener("touchmove", resize);
		window.addEventListener("mouseup", stopResize);
		window.addEventListener("touchend", stopResize);
	}

	function resize(e) {
		if (!isResizing) return;
		var clientX = e.clientX || (e.touches && e.touches[0].clientX);
		if (!clientX) return;
		var rawPercent = (clientX / window.innerWidth) * 100;
		var widthPercent = (window.KantanModules && window.KantanModules.SettingsUi)
			? window.KantanModules.SettingsUi.clampPaneWidthPercent(rawPercent)
			: Math.max(20, Math.min(80, rawPercent));
		var widthStr = widthPercent + "%";
		document.documentElement.style.setProperty("--editor-width", widthStr);
		setItem("editor-width", widthStr);
	}

	function stopResize() {
		if (!isResizing) return;
		isResizing = false;
		removeClass(resizeHandle, "active");
		document.body.style.userSelect = "";
		document.body.style.cursor = "";
		window.removeEventListener("mousemove", resize);
		window.removeEventListener("touchmove", resize);
		window.removeEventListener("mouseup", stopResize);
		window.removeEventListener("touchend", stopResize);
		if (typeof schedulePageBreakUpdate === "function") {
			schedulePageBreakUpdate("pane-resize");
		}
	}

	// --- 2. 目次機能 ---
	var isTocVisible = getItem("toc-visible", "false") === "true";
	if (isTocVisible) {
		addClass(document.body, "toc-visible");
		addClass(document.getElementById("btn-toggle-toc"), "active-toggle");
	} else {
		removeClass(document.body, "toc-visible");
		removeClass(document.getElementById("btn-toggle-toc"), "active-toggle");
	}

	on("#btn-toggle-toc", "click", toggleToc);

	function toggleToc() {
		var btn = document.getElementById("btn-toggle-toc");
		if (document.body.classList.contains("toc-visible")) {
			removeClass(document.body, "toc-visible");
			removeClass(btn, "active-toggle");
			setItem("toc-visible", "false");
		} else {
			addClass(document.body, "toc-visible");
			addClass(btn, "active-toggle");
			setItem("toc-visible", "true");
		}
		buildToc();
		doLayout();
		if (typeof schedulePageBreakUpdate === "function") {
			schedulePageBreakUpdate("toggle-toc");
		}
	}

	on("#previewer", "previewed", function() {
		buildToc();
		if (typeof schedulePageBreakUpdate === "function") {
			schedulePageBreakUpdate("previewed");
		} else {
			updatePageBreaks();
		}
	});

	function buildToc() {
		var toc = document.getElementById("toc");
		if (!toc) return;
		var tocBody = toc.querySelector(".toc-body");
		tocBody.innerHTML = "";
		
		var previewer = document.getElementById("previewer");
		var headings = previewer.querySelectorAll("h1, h2, h3, h4, h5, h6");
		
		if (headings.length === 0) {
			tocBody.innerHTML = '<div class="toc-empty">見出しがありません</div>';
			return;
		}

		var minLevel = 6;
		for (var i = 0; i < headings.length; i++) {
			var level = parseInt(headings[i].tagName.substring(1));
			if (level < minLevel) minLevel = level;
		}

		for (var i = 0; i < headings.length; i++) {
			var heading = headings[i];
			var level = parseInt(heading.tagName.substring(1));
			var text = heading.textContent;
			
			if (!heading.id) {
				heading.id = "heading-" + i;
			}
			
			var link = document.createElement("a");
			link.className = "toc-link toc-h" + level;
			link.href = "#" + heading.id;
			link.innerText = text;
			link.setAttribute("data-target", heading.id);
			
			var paddingLeft = (level - minLevel + 1) * 14;
			link.style.paddingLeft = paddingLeft + "px";
			
			on(link, "click", function(e) {
				e.preventDefault();
				var targetId = this.getAttribute("data-target");
				var targetElem = document.getElementById(targetId);
				if (targetElem) {
					targetElem.scrollIntoView({ behavior: "smooth" });
				}
			});
			
			tocBody.appendChild(link);
		}
		
		updateTocActive();
	}

	var isScrolling = false;
	var scrollSyncLock = null;
	var scrollSyncTimer = null;
	var editorZoomLevels = [0.67, 1, 1.2, 1.4, 1.6, 1.8, 2];
	var editorZoomIndex = 0;

	function applyEditorZoom() {
		var zoomVal = editorZoomLevels[editorZoomIndex];
		document.documentElement.style.setProperty("--editor-zoom", String(zoomVal));
	}

	on("#btn-editor-zoom-in", "click", function() {
		if (window.KantanModules && window.KantanModules.SettingsUi) {
			var nextZoom = window.KantanModules.SettingsUi.getNextEditorZoom(editorZoomLevels[editorZoomIndex]);
			var nextIdx = editorZoomLevels.indexOf(nextZoom);
			if (nextIdx !== -1) {
				editorZoomIndex = nextIdx;
			}
			applyEditorZoom();
		} else if (editorZoomIndex < editorZoomLevels.length - 1) {
			editorZoomIndex++;
			applyEditorZoom();
		}
	});

	on("#btn-editor-zoom-reset", "click", function() {
		editorZoomIndex = 0;
		applyEditorZoom();
	});

	function syncEditorPreviewScroll(source, target, sourceName) {
		if (!isEditMode() || !isVisible(source) || !isVisible(target)) return;
		if (scrollSyncLock && scrollSyncLock !== sourceName) return;

		scrollSyncLock = sourceName;
		var sourceMax = source.scrollHeight - source.clientHeight;
		var targetMax = target.scrollHeight - target.clientHeight;
		if (sourceMax > 0 && targetMax > 0) {
			var nextTop = (window.KantanModules && window.KantanModules.SettingsUi)
				? window.KantanModules.SettingsUi.calculateSyncedScrollTop(
					{ scrollTop: source.scrollTop, scrollHeight: source.scrollHeight, clientHeight: source.clientHeight },
					{ scrollHeight: target.scrollHeight, clientHeight: target.clientHeight }
				)
				: (source.scrollTop / sourceMax) * targetMax;
			if (Math.abs(target.scrollTop - nextTop) > 1) {
				target.scrollTop = nextTop;
			}
		} else if (source.scrollTop === 0 && target.scrollTop !== 0) {
			target.scrollTop = 0;
		}
		clearTimeout(scrollSyncTimer);
		scrollSyncTimer = setTimeout(function() {
			scrollSyncLock = null;
		}, 60);
	}

	on("#editor", "scroll", function() {
		syncEditorPreviewScroll(document.getElementById("editor"), document.getElementById("previewer"), "editor");
	});

	on("#previewer", "scroll", function() {
		syncEditorPreviewScroll(document.getElementById("previewer"), document.getElementById("editor"), "previewer");
		if (!isScrolling) {
			isScrolling = true;
			requestAnimationFrame(function() {
				updateTocActive();
				isScrolling = false;
			});
		}
	});

	function updateTocActive() {
		if (!document.body.classList.contains("toc-visible")) return;
		var previewer = document.getElementById("previewer");
		var headings = previewer.querySelectorAll("h1, h2, h3, h4, h5, h6");
		var links = document.querySelectorAll("#toc .toc-link");
		
		var activeIndex = -1;
		var previewerTop = previewer.getBoundingClientRect().top;
		
		for (var i = 0; i < headings.length; i++) {
			var rect = headings[i].getBoundingClientRect();
			if (rect.top - previewerTop <= 20) {
				activeIndex = i;
			} else {
				break;
			}
		}
		
		if (activeIndex === -1 && headings.length > 0) activeIndex = 0;
		
		for (var i = 0; i < links.length; i++) {
			if (i === activeIndex) {
				addClass(links[i], "active");
			} else {
				removeClass(links[i], "active");
			}
		}
	}

	// --- 3. 書き出し（エクスポート） ---
	on("#btn-export", "click", exportHTML);

	function exportHTML() {
		doPreview(); // 最新の状態で書き出し
		
		var title = document.title.replace(/^\* /, "");
		var previewerStyle = document.getElementById("previewerStyle").innerHTML;
		var previewerClone = document.getElementById("previewer").cloneNode(true);
		var exportInds = previewerClone.querySelectorAll("#kantan-page-break-overlay, .kantan-page-break-overlay, .page-break-indicator");
		for (var ei = 0; ei < exportInds.length; ei++) {
			if (exportInds[ei].parentNode) {
				exportInds[ei].parentNode.removeChild(exportInds[ei]);
			}
		}
		var previewerContent = previewerClone.innerHTML;
		
		var tocHtml = "";
		if (document.body.classList.contains("toc-visible")) {
			var tocClone = document.getElementById("toc").cloneNode(true);
			tocHtml = tocClone.outerHTML;
		}

		var html = '<!doctype html>\n<html lang="ja">\n<head>\n';
		html += '<meta charset="utf-8">\n';
		html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
		html += '<title>' + title + '</title>\n';
		html += '<style>\n';
		html += ':root {\n';
		html += '    --bg: #f6f8fa;\n';
		html += '    --bg-surface: #fff;\n';
		html += '    --bg-preview: #fff;\n';
		html += '    --border: #d1d9e0;\n';
		html += '    --text: #1f2328;\n';
		html += '    --text-muted: #59636e;\n';
		html += '    --accent: #0969da;\n';
		html += '    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", Roboto, sans-serif;\n';
		html += '}\n';
		if (document.body.classList.contains("dark")) {
			html += 'body {\n';
			html += '    --bg: #0d1117;\n';
			html += '    --bg-surface: #161b22;\n';
			html += '    --bg-preview: #1c2128;\n';
			html += '    --border: #30363d;\n';
			html += '    --text: #c9d1d9;\n';
			html += '    --text-muted: #8b949e;\n';
			html += '    --accent: #58a6ff;\n';
			html += '}\n';
		}
		html += 'body {\n';
		html += '    font-family: var(--font-sans);\n';
		html += '    color: var(--text);\n';
		html += '    background: var(--bg);\n';
		html += '    margin: 0; padding: 0;\n';
		html += '}\n';
		html += '#wrapper {\n';
		html += '    display: flex;\n';
		html += '    justify-content: center;\n';
		html += '    align-items: flex-start;\n';
		html += '    gap: 16px;\n';
		html += '    padding: 32px 24px;\n';
		html += '}\n';
		html += '#previewer {\n';
		html += '    background: var(--bg-preview);\n';
		html += '    border: 1px solid var(--border);\n';
		html += '    width: 100%;\n';
		html += '    max-width: 300mm;\n';
		html += '    min-height: 424mm;\n';
		html += '    --page-aspect-ratio: 210 / 297;\n';
		html += '    height: auto;\n';
		html += '    border-radius: 4px;\n';
		html += '    padding: 32px 40px;\n';
		html += '    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n';
		html += '}\n';
		html += '#toc {\n';
		html += '    background: var(--bg-surface);\n';
		html += '    border: 1px solid var(--border);\n';
		html += '    width: 300px;\n';
		html += '    border-radius: 4px;\n';
		html += '    padding: 16px;\n';
		html += '    font-size: 13px;\n';
		html += '    line-height: 1.5;\n';
		html += '    position: sticky;\n';
		html += '    top: 32px;\n';
		html += '    display: block;\n';
		html += '}\n';
		html += '#toc .toc-title {\n';
		html += '    border-bottom: 1px solid var(--border);\n';
		html += '    margin-bottom: 8px;\n';
		html += '    padding-bottom: 8px;\n';
		html += '    font-weight: 600;\n';
		html += '}\n';
		html += '#toc .toc-link {\n';
		html += '    color: var(--text-muted);\n';
		html += '    text-decoration: none;\n';
		html += '    display: block;\n';
		html += '    padding: 4px 6px 4px 14px;\n';
		html += '    border-radius: 4px;\n';
		html += '}\n';
		html += '#toc .toc-link:hover { background: var(--bg); color: var(--text); }\n';
		html += '#toc .toc-link.active { color: var(--accent); font-weight: 600; }\n';
		html += '#previewer h1, #previewer h2, #previewer h3, #previewer h4, #previewer h5, #previewer h6 {\n';
		html += '    border-bottom: 1px solid var(--border);\n';
		html += '    padding-bottom: 0.3em;\n';
		html += '}\n';
		html += previewerStyle + '\n';
		html += '</style>\n';
		html += '</head>\n';
		html += '<body>\n';
		html += '<div id="wrapper">\n';
		html += '    <div id="previewer">' + previewerContent + '</div>\n';
		if (tocHtml !== "") {
			html += '    ' + tocHtml + '\n';
		}
		html += '</div>\n';
		
		html += '<script>\n';
		html += 'document.querySelectorAll("#toc .toc-link").forEach(function(link) {\n';
		html += '    link.addEventListener("click", function(e) {\n';
		html += '        e.preventDefault();\n';
		html += '        var target = document.getElementById(this.getAttribute("href").substring(1));\n';
		html += '        if (target) target.scrollIntoView({ behavior: "smooth" });\n';
		html += '    });\n';
		html += '});\n';
		html += 'window.addEventListener("scroll", function() {\n';
		html += '    var headings = document.querySelectorAll("#previewer h1, #previewer h2, #previewer h3, #previewer h4, #previewer h5, #previewer h6");\n';
		html += '    var links = document.querySelectorAll("#toc .toc-link");\n';
		html += '    var activeIndex = -1;\n';
		html += '    var previewerTop = document.getElementById("previewer").getBoundingClientRect().top;\n';
		html += '    headings.forEach(function(heading, i) {\n';
		html += '        if (heading.getBoundingClientRect().top - previewerTop <= 50) activeIndex = i;\n';
		html += '    });\n';
		html += '    if (activeIndex === -1 && headings.length > 0) activeIndex = 0;\n';
		html += '    links.forEach(function(link, i) {\n';
		html += '        if (i === activeIndex) link.classList.add("active"); else link.classList.remove("active");\n';
		html += '    });\n';
		html += '});\n';
		html += '<\' + \'/script>\n';
		
		html += '</body>\n</html>';

		var blob = new Blob([html], {type: "text/html;charset=utf-8"});
		var exportFileName = title.replace(/^\* /, "") + "_export.html";
		if (window.KantanModules && window.KantanModules.SaveExport) {
			window.KantanModules.SaveExport.triggerBlobDownload(blob, exportFileName, document, window);
		} else {
			var blobURL = window.URL.createObjectURL(blob);
			var a = document.createElement('a');
			a.download = exportFileName;
			a.href = blobURL;
			a.click();
		}
	}

	var pageBreakGenerationId = 0;
	var pageBreakRafId = null;
	var pageBreakFollowupTimer = null;
	var currentPrintProfileState = null;

	function getSettingsUiModule() {
		return (window.KantanModules && window.KantanModules.SettingsUi) ? window.KantanModules.SettingsUi : null;
	}

	function initPrintProfileState() {
		var sui = getSettingsUiModule();
		if (!sui) return;
		var savedJson = getItem("print-profile-json", null);
		if (savedJson) {
			var validated = sui.validateAndNormalizePrintProfile(savedJson);
			if (validated && validated.valid) {
				currentPrintProfileState = validated;
				syncPrintProfileUi();
				return;
			}
		}
		currentPrintProfileState = sui.validateAndNormalizePrintProfile(sui.ADOPTED_PRINT_PROFILE);
		syncPrintProfileUi();
	}

	function syncPrintProfileUi() {
		var sui = getSettingsUiModule();
		var statusEl = document.getElementById("print-profile-status");
		var condEl = document.getElementById("print-profile-condition");
		var guideEl = document.getElementById("print-profile-guidance");
		if (!sui || !currentPrintProfileState) return;
		var texts = sui.formatPrintProfileStatusText(currentPrintProfileState);
		if (statusEl) {
			statusEl.innerText = texts.statusLabel;
			statusEl.setAttribute("data-ready", currentPrintProfileState.measurementReady ? "true" : "false");
		}
		if (condEl) condEl.innerText = texts.conditionLabel;
		if (guideEl) guideEl.innerText = texts.guidanceLabel;
	}

	on("#print-profile-file", "change", function(e) {
		var input = e.target;
		if (!input || !input.files || input.files.length === 0) return;
		var file = input.files[0];
		var reader = new FileReader();
		reader.onload = function() {
			var sui = getSettingsUiModule();
			if (!sui) return;
			var rawText = typeof reader.result === "string" ? reader.result : "";
			var validated = sui.validateAndNormalizePrintProfile(rawText);
			if (!validated || !validated.valid) {
				var errSummary = sui ? sui.formatPrintProfileStatusText(validated) : null;
				if (typeof window.alert === "function") {
					window.alert("印刷プロファイルJSONの検証に失敗しました。既存設定を維持します。\n" + (errSummary ? errSummary.guidanceLabel : ""));
				}
				syncPrintProfileUi();
				return;
			}
			var summary = sui.formatPrintProfileStatusText(validated);
			var confirmMsg = "以下の印刷プロファイルを取り込みますか？\n\n" +
				"状態: " + summary.statusLabel + "\n" +
				"条件: " + summary.conditionLabel + "\n\n" +
				summary.guidanceLabel;
			if (typeof window.confirm === "function" && !window.confirm(confirmMsg)) {
				return;
			}
			currentPrintProfileState = validated;
			setItem("print-profile-json", JSON.stringify(validated.profile));
			syncPrintProfileUi();
			schedulePageBreakUpdate("profile-import");
		};
		reader.readAsText(file, "utf-8");
		try { input.value = ""; } catch (_) {}
	});

	on("#btn-print-profile-reset", "click", function() {
		var sui = getSettingsUiModule();
		if (!sui) return;
		currentPrintProfileState = sui.validateAndNormalizePrintProfile(sui.ADOPTED_PRINT_PROFILE);
		setItem("print-profile-json", JSON.stringify(currentPrintProfileState.profile));
		syncPrintProfileUi();
		schedulePageBreakUpdate("profile-reset");
	});

	function schedulePageBreakUpdate(reason) {
		var gen = ++pageBreakGenerationId;
		if (pageBreakRafId != null && typeof cancelAnimationFrame === "function") {
			cancelAnimationFrame(pageBreakRafId);
			pageBreakRafId = null;
		}
		if (pageBreakFollowupTimer != null) {
			clearTimeout(pageBreakFollowupTimer);
			pageBreakFollowupTimer = null;
		}
		var runner = function() {
			pageBreakRafId = null;
			if (gen !== pageBreakGenerationId) return;
			updatePageBreaks(gen, reason);
		};
		if (typeof requestAnimationFrame === "function") {
			pageBreakRafId = requestAnimationFrame(runner);
		} else {
			pageBreakFollowupTimer = setTimeout(runner, 16);
		}
	}

	function destroyPageBreakMeasurement() {
		pageBreakGenerationId++;
		if (pageBreakRafId != null && typeof cancelAnimationFrame === "function") {
			cancelAnimationFrame(pageBreakRafId);
			pageBreakRafId = null;
		}
		if (pageBreakFollowupTimer != null) {
			clearTimeout(pageBreakFollowupTimer);
			pageBreakFollowupTimer = null;
		}
		var frame = document.getElementById("kantan-print-measure-frame");
		if (frame && frame.parentNode) {
			frame.parentNode.removeChild(frame);
		}
		var overlay = document.getElementById("kantan-page-break-overlay");
		if (overlay && overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
		var inds = document.querySelectorAll(".page-break-indicator");
		for (var i = 0; i < inds.length; i++) {
			if (inds[i].parentNode) inds[i].parentNode.removeChild(inds[i]);
		}
	}

	function unwrapPrintMediaRules(cssText) {
		if (!cssText) return "";
		var out = [];
		var re = /@media\s+print\s*\{/gi;
		var match;
		while ((match = re.exec(cssText)) !== null) {
			var startIdx = re.lastIndex;
			var depth = 1;
			var pos = startIdx;
			while (pos < cssText.length && depth > 0) {
				var ch = cssText.charAt(pos);
				if (ch === "{") depth++;
				else if (ch === "}") depth--;
				pos++;
			}
			if (depth === 0) {
				out.push(cssText.substring(startIdx, pos - 1));
			}
		}
		return out.join("\n");
	}

	function buildSharedPrintMeasurementCss() {
		var isDark = document.body && document.body.classList.contains("dark");
		var baseStyles = [
			":root{--bg:" + (isDark ? "#0d1117" : "#f6f8fa") + ";--bg-surface:" + (isDark ? "#161b22" : "#fff") + ";--bg-preview:" + (isDark ? "#1c2128" : "#fff") + ";--border:" + (isDark ? "#30363d" : "#d1d9e0") + ";--text:" + (isDark ? "#c9d1d9" : "#1f2328") + ";--text-muted:" + (isDark ? "#8b949e" : "#59636e") + ";--accent:" + (isDark ? "#58a6ff" : "#0969da") + ";--danger:#cf222e;--radius:6px;--inline-code-bg:#818b981f;--font-sans:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"Noto Sans JP\",Roboto,sans-serif;--font-mono:\"Cascadia Code\",\"JetBrains Mono\",\"Noto Sans Mono\",Consolas,monospace}",
			"html,body{margin:0;padding:0;width:100%;height:auto;overflow:visible;font-family:var(--font-sans);font-size:14px;color:var(--text);background:transparent}",
			"#wrapper{margin:0;padding:0;display:flex;flex-direction:column;align-items:stretch;width:100%;height:auto;overflow:visible}",
			"#toc{display:block;width:100%;max-height:none;overflow:visible;position:relative;border:none;box-shadow:none;padding:0;margin:0 0 24px 0;order:-1;font-size:13px;line-height:1.5}",
			"#toc .toc-header,#toc .toc-title,#toc .toc-body,#toc .toc-link{display:block;flex:none;height:auto;max-height:none;overflow:visible}",
			"#toc .toc-title{text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:1px solid var(--border);margin-bottom:8px;padding:0 6px 8px;font-size:12px;font-weight:600}",
			"#toc .toc-link{color:var(--text-muted);word-break:break-word;border-radius:4px;padding:4px 6px 4px 14px;text-decoration:none}",
			"#previewer{box-sizing:border-box;border:0;margin:0;padding:0;width:100%;max-width:none;min-height:0;box-shadow:none;display:block;zoom:1;word-wrap:break-word}",
			"#previewer h1,#previewer h2,#previewer h3,#previewer h4,#previewer h5,#previewer h6{border-bottom:1px solid var(--border);padding-bottom:0.3em}",
			"#previewer video{display:none!important}",
			"#previewer img.kantan-video-print-thumb{display:block!important;max-width:100%!important;height:auto!important;margin-top:8px;page-break-inside:avoid;break-inside:avoid}",
			".note.info,.note.warn,.note.alert{page-break-inside:avoid;break-inside:avoid}",
			".mermaid,.mermaid-rendered{page-break-inside:avoid;break-inside:avoid;max-width:100%!important}",
			".mermaid svg,.mermaid-rendered svg{max-width:100%;height:auto}",
			".mermaid svg[aria-roledescription^=\"flowchart\"],.mermaid-rendered svg[aria-roledescription^=\"flowchart\"],.mermaid svg[aria-roledescription=\"sequence\"],.mermaid-rendered svg[aria-roledescription=\"sequence\"],.mermaid svg[aria-roledescription^=\"class\"],.mermaid-rendered svg[aria-roledescription^=\"class\"],.mermaid svg[aria-roledescription^=\"state\"],.mermaid-rendered svg[aria-roledescription^=\"state\"],.mermaid svg.statediagram,.mermaid-rendered svg.statediagram{zoom:0.5}"
		].join("\n");
		var previewerStyleEl = document.getElementById("previewerStyle");
		var customCss = previewerStyleEl ? (previewerStyleEl.innerHTML || "") : "";
		return baseStyles + "\n" + customCss + "\n" + unwrapPrintMediaRules(customCss);
	}

	function ensurePrintMeasureFrame(widthMm, heightMm) {
		if (!document.body) return null;
		var frame = document.getElementById("kantan-print-measure-frame");
		if (!frame) {
			frame = document.createElement("iframe");
			frame.id = "kantan-print-measure-frame";
			frame.className = "kantan-print-measure-frame";
			frame.setAttribute("aria-hidden", "true");
			frame.setAttribute("tabindex", "-1");
			document.body.appendChild(frame);
		}
		frame.style.width = widthMm + "mm";
		frame.style.height = heightMm + "mm";
		return frame;
	}

	function isAvoidBreakElement(el, computedStyle) {
		if (!el || !el.tagName) return false;
		var tag = el.tagName.toUpperCase();
		if (tag === "IMG" || tag === "SVG" || tag === "HR") return true;
		if (el.classList) {
			if (el.classList.contains("mermaid") ||
				el.classList.contains("mermaid-rendered") ||
				el.classList.contains("sequence") ||
				el.classList.contains("flow") ||
				el.classList.contains("kantan-video-print-thumb")) {
				return true;
			}
			if (el.classList.contains("note") &&
				(el.classList.contains("info") || el.classList.contains("warn") || el.classList.contains("alert"))) {
				return true;
			}
		}
		if (computedStyle) {
			var bi = computedStyle.breakInside || computedStyle.pageBreakInside || "";
			if (bi === "avoid" || bi === "avoid-page") return true;
		}
		return false;
	}

	function collectMeasuredSubItems(blockEl, mDoc, baseTop) {
		var items = [];
		if (!blockEl || !mDoc) return items;
		var tag = (blockEl.tagName || "").toUpperCase();

		if (tag === "TABLE") {
			var rows = blockEl.querySelectorAll("tr");
			for (var r = 0; r < rows.length; r++) {
				var rRect = rows[r].getBoundingClientRect();
				if (rRect.height > 0) {
					items.push({
						subIndex: r,
						top: rRect.top - baseTop,
						bottom: rRect.bottom - baseTop,
						height: rRect.height,
						charOffset: null
					});
				}
			}
			return items;
		}

		if (tag === "UL" || tag === "OL") {
			var listItems = blockEl.children;
			var liIdx = 0;
			for (var l = 0; l < listItems.length; l++) {
				if ((listItems[l].tagName || "").toUpperCase() !== "LI") continue;
				var lRect = listItems[l].getBoundingClientRect();
				if (lRect.height > 0) {
					items.push({
						subIndex: liIdx++,
						top: lRect.top - baseTop,
						bottom: lRect.bottom - baseTop,
						height: lRect.height,
						charOffset: null
					});
				}
			}
			return items;
		}

		// Collect embedded atomic images / video print thumbs inside paragraph or container
		var innerImgs = blockEl.querySelectorAll("img");
		var mediaIdx = 0;
		for (var im = 0; im < innerImgs.length; im++) {
			var imgEl = innerImgs[im];
			var imgRect = imgEl.getBoundingClientRect();
			if (imgRect.height > 0 && imgRect.width > 0) {
				items.push({
					subIndex: 0,
					mediaIndex: mediaIdx++,
					top: imgRect.top - baseTop,
					bottom: imgRect.bottom - baseTop,
					height: imgRect.height,
					charOffset: null,
					avoidBreakInside: true
				});
			}
		}

		// Collect text line boxes via Range with character offsets for accurate screen mapping
		if (typeof mDoc.createRange === "function" && typeof mDoc.createTreeWalker === "function") {
			var range = mDoc.createRange();
			var walker = mDoc.createTreeWalker(blockEl, 4 /* NodeFilter.SHOW_TEXT */, null, false);
			var textNode;
			var runningCharOffset = 0;
			var lastLineTop = null;
			while ((textNode = walker.nextNode())) {
				var val = textNode.nodeValue || "";
				var len = val.length;
				if (len === 0) continue;
				if (!val.trim()) {
					runningCharOffset += len;
					continue;
				}
				var step = 1;
				for (var c = 0; c < len; c += step) {
					range.setStart(textNode, c);
					range.setEnd(textNode, c + 1);
					var rects = range.getClientRects();
					if (rects && rects.length > 0) {
						var rc = rects[0];
						if (rc.height > 0) {
							var relTop = rc.top - baseTop;
							var relBottom = rc.bottom - baseTop;
							if (lastLineTop === null || Math.abs(relTop - lastLineTop) > 3) {
								items.push({
									subIndex: items.length,
									top: relTop,
									bottom: relBottom,
									height: rc.height,
									charOffset: runningCharOffset + c
								});
								lastLineTop = relTop;
							} else if (items.length > 0) {
								var prevItem = items[items.length - 1];
								if (relBottom > prevItem.bottom) {
									prevItem.bottom = relBottom;
									prevItem.height = prevItem.bottom - prevItem.top;
								}
							}
						}
					}
				}
				runningCharOffset += len;
			}
		}

		items.sort(function(a, b) { return a.top - b.top; });
		for (var si = 0; si < items.length; si++) {
			items[si].subIndex = si;
		}
		return items;
	}

	function resolveCharOffsetTopInElement(blockEl, targetCharOffset, previewerEl) {
		if (!blockEl || typeof document.createRange !== "function" || typeof document.createTreeWalker !== "function") {
			return null;
		}
		var walker = document.createTreeWalker(blockEl, 4 /* NodeFilter.SHOW_TEXT */, null, false);
		var node;
		var running = 0;
		while ((node = walker.nextNode())) {
			var len = (node.nodeValue || "").length;
			if (targetCharOffset < running + len) {
				var localIdx = Math.max(0, Math.min(len - 1, targetCharOffset - running));
				var range = document.createRange();
				range.setStart(node, localIdx);
				range.setEnd(node, Math.min(len, localIdx + 1));
				var rects = range.getClientRects();
				if (rects && rects.length > 0) {
					var bRect = blockEl.getBoundingClientRect();
					var bOffsetHeight = blockEl.offsetHeight || bRect.height;
					var scaleFactor = (bRect.height > 0 && bOffsetHeight > 0) ? (bOffsetHeight / bRect.height) : 1;
					var relInBlock = (rects[0].top - bRect.top) * scaleFactor;
					return (blockEl.offsetTop - (previewerEl ? 0 : 0)) + relInBlock;
				}
				return null;
			}
			running += len;
		}
		return null;
	}

	function clearPageBreakOverlay(previewerEl) {
		var p = previewerEl || document.getElementById("previewer");
		if (!p) return;
		var overlay = document.getElementById("kantan-page-break-overlay");
		if (overlay) {
			overlay.innerHTML = "";
		}
		var legacyInds = p.querySelectorAll(".page-break-indicator");
		for (var i = 0; i < legacyInds.length; i++) {
			if (!overlay || !overlay.contains(legacyInds[i])) {
				if (legacyInds[i].parentNode) legacyInds[i].parentNode.removeChild(legacyInds[i]);
			}
		}
	}

	function renderPageBreakOverlay(previewerEl, mappedBreaks) {
		if (!previewerEl) return;
		clearPageBreakOverlay(previewerEl);
		if (!Array.isArray(mappedBreaks) || mappedBreaks.length === 0) return;

		var overlay = document.getElementById("kantan-page-break-overlay");
		if (!overlay || overlay.parentNode !== previewerEl) {
			if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
			overlay = document.createElement("div");
			overlay.id = "kantan-page-break-overlay";
			overlay.className = "kantan-page-break-overlay";
			overlay.setAttribute("aria-hidden", "true");
			previewerEl.appendChild(overlay);
		}

		for (var i = 0; i < mappedBreaks.length; i++) {
			var brk = mappedBreaks[i];
			if (!brk || brk.isToc) continue;
			var ind = document.createElement("div");
			ind.className = "page-break-indicator";
			ind.setAttribute("data-page", "Page " + brk.pageNumber);
			ind.setAttribute("data-break-reason", brk.reason || "page-overflow");
			ind.setAttribute("data-anchor-type", brk.anchorType || "before-block");
			ind.style.top = brk.screenY + "px";
			overlay.appendChild(ind);
		}
	}

	function collectScreenBlocks(previewerEl, bodyChildren) {
		var screenBlocks = [];
		for (var k = 0; k < bodyChildren.length; k++) {
			(function(idx, el) {
				var elTop = el.offsetTop;
				var elHeight = el.offsetHeight;
				var elBottom = elTop + elHeight;
				var subItems = [];
				var tag = (el.tagName || "").toUpperCase();
				if (tag === "TABLE") {
					var rows = el.querySelectorAll("tr");
					for (var r = 0; r < rows.length; r++) {
						var rTop = elTop + rows[r].offsetTop;
						subItems.push({ subIndex: r, top: rTop, bottom: rTop + rows[r].offsetHeight });
					}
				} else if (tag === "UL" || tag === "OL") {
					var liIdx = 0;
					for (var l = 0; l < el.children.length; l++) {
						if ((el.children[l].tagName || "").toUpperCase() !== "LI") continue;
						var lEl = el.children[l];
						var lTop = elTop + (lEl.offsetTop - el.offsetTop);
						subItems.push({ subIndex: liIdx++, top: lTop, bottom: lTop + lEl.offsetHeight });
					}
				} else {
					var mediaEls = el.querySelectorAll("img:not(.kantan-video-print-thumb), video");
					for (var me = 0; me < mediaEls.length; me++) {
						var mNode = mediaEls[me];
						if (mNode.offsetHeight > 0) {
							var mTop = elTop + (mNode.offsetTop - el.offsetTop);
							subItems.push({ subIndex: me, mediaIndex: me, top: mTop, bottom: mTop + mNode.offsetHeight });
						}
					}
				}
				screenBlocks.push({
					blockIndex: idx,
					isToc: false,
					top: elTop,
					bottom: elBottom,
					height: elHeight,
					subItems: subItems,
					resolveCharOffsetTop: function(charOffset) {
						return resolveCharOffsetTopInElement(el, charOffset, previewerEl);
					}
				});
			})(k, bodyChildren[k]);
		}
		return screenBlocks;
	}

	function measureDomInFrame(bodyChildren, widthMm, heightMm) {
		var frame = ensurePrintMeasureFrame(widthMm, heightMm);
		var mDoc = frame && (frame.contentDocument || (frame.contentWindow && frame.contentWindow.document));
		if (!mDoc) return null;

		if (!mDoc.body || !mDoc.head) {
			mDoc.open();
			mDoc.write("<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>");
			mDoc.close();
		}

		var mWin = frame.contentWindow || window;
		mDoc.documentElement.style.width = widthMm + "mm";
		mDoc.body.style.width = widthMm + "mm";
		mDoc.body.className = document.body ? document.body.className : "";
		var styleEl = mDoc.getElementById("kantan-measure-style");
		if (!styleEl) {
			styleEl = mDoc.createElement("style");
			styleEl.id = "kantan-measure-style";
			mDoc.head.appendChild(styleEl);
		}
		styleEl.textContent = buildSharedPrintMeasurementCss();

		mDoc.body.innerHTML = '<div id="wrapper"><div id="previewer"></div></div>';
		var mWrapper = mDoc.getElementById("wrapper");
		var mPreviewer = mDoc.getElementById("previewer");

		var mToc = null;
		if (document.body && document.body.classList.contains("toc-visible")) {
			var srcToc = document.getElementById("toc");
			if (srcToc) {
				mToc = srcToc.cloneNode(true);
				mWrapper.insertBefore(mToc, mPreviewer);
			}
		}

		var measuredNodeList = [];
		for (var idx = 0; idx < bodyChildren.length; idx++) {
			var srcChild = bodyChildren[idx];
			var cloneChild = srcChild.cloneNode(true);
			var srcImgs = srcChild.querySelectorAll("img");
			var cloneImgs = cloneChild.querySelectorAll("img");
			for (var imIdx = 0; imIdx < srcImgs.length && imIdx < cloneImgs.length; imIdx++) {
				var sImg = srcImgs[imIdx];
				var cachedDim = (window.__kantanImageDimCache && sImg.src) ? window.__kantanImageDimCache[sImg.src] : null;
				var nw = sImg.naturalWidth || (cachedDim ? cachedDim.w : 0);
				var nh = sImg.naturalHeight || (cachedDim ? cachedDim.h : 0);
				if (nw > 0 && nh > 0) {
					if (sImg.src && window.__kantanImageDimCache) {
						window.__kantanImageDimCache[sImg.src] = { w: nw, h: nh };
					}
					if (!cloneImgs[imIdx].style.width) cloneImgs[imIdx].style.width = nw + "px";
					cloneImgs[imIdx].style.aspectRatio = nw + " / " + nh;
					cloneImgs[imIdx].style.maxWidth = "100%";
					cloneImgs[imIdx].style.height = "auto";
				}
			}
			var innerInds = cloneChild.querySelectorAll("#kantan-page-break-overlay, .kantan-page-break-overlay, .page-break-indicator");
			for (var ii = 0; ii < innerInds.length; ii++) {
				if (innerInds[ii].parentNode) innerInds[ii].parentNode.removeChild(innerInds[ii]);
			}
			mPreviewer.appendChild(cloneChild);
			measuredNodeList.push({ blockIndex: idx, el: cloneChild });
		}

		var baseTop = mWrapper.getBoundingClientRect().top;
		var measuredBlocks = [];

		if (mToc) {
			var tocRect = mToc.getBoundingClientRect();
			if (tocRect.height > 0) {
				var tocLinks = mToc.querySelectorAll(".toc-header, .toc-link");
				var tocSubs = [];
				for (var tl = 0; tl < tocLinks.length; tl++) {
					var tlRect = tocLinks[tl].getBoundingClientRect();
					if (tlRect.height > 0) {
						tocSubs.push({ subIndex: tl, top: tlRect.top - baseTop, bottom: tlRect.bottom - baseTop, height: tlRect.height });
					}
				}
				measuredBlocks.push({
					blockIndex: -1, tagName: "ASIDE",
					top: tocRect.top - baseTop, bottom: tocRect.bottom - baseTop, height: tocRect.height,
					isToc: true, isHeading: false, forceBreakBefore: false, forceBreakAfter: false, avoidBreakInside: false, subItems: tocSubs
				});
			}
		}

		for (var m = 0; m < measuredNodeList.length; m++) {
			var item = measuredNodeList[m];
			var mEl = item.el;
			var rect = mEl.getBoundingClientRect();
			var cStyle = (mWin && typeof mWin.getComputedStyle === "function") ? mWin.getComputedStyle(mEl) : null;
			if (cStyle && cStyle.display === "none") continue;
			var mTop = rect.top - baseTop, mBottom = rect.bottom - baseTop, mHeight = rect.height;
			var tagName = (mEl.tagName || "").toUpperCase();
			var isHeading = /^H[1-6]$/.test(tagName);
			var avoidInside = isAvoidBreakElement(mEl, cStyle);
			var bb = cStyle ? (cStyle.breakBefore || cStyle.pageBreakBefore || "") : "";
			var ba = cStyle ? (cStyle.breakAfter || cStyle.pageBreakAfter || "") : "";
			var subItems = (!avoidInside && mHeight > 20) ? collectMeasuredSubItems(mEl, mDoc, baseTop) : [];

			measuredBlocks.push({
				blockIndex: item.blockIndex, tagName: tagName,
				top: mTop, bottom: mBottom, height: mHeight,
				isToc: false, isHeading: isHeading,
				forceBreakBefore: (bb === "page" || bb === "always"),
				forceBreakAfter: (ba === "page" || ba === "always"),
				avoidBreakInside: avoidInside,
				avoidBreakAfter: (ba === "avoid" || ba === "avoid-page"),
				subItems: subItems
			});
		}
		return measuredBlocks;
	}

	function updatePageBreaks(genId) {
		var p = document.getElementById("previewer");
		if (!p) return;
		if (genId != null && genId !== pageBreakGenerationId) return;

		var sui = getSettingsUiModule();
		if (!currentPrintProfileState && sui) {
			initPrintProfileState();
		}
		if (!sui || !currentPrintProfileState || !currentPrintProfileState.measurementReady || !currentPrintProfileState.contentAreaMm) {
			clearPageBreakOverlay(p);
			window.__kantanLastPageBreakModel = { measurementReady: false, totalPages: 1, breaks: [] };
			return;
		}

		var bodyChildren = [];
		for (var j = 0; j < p.children.length; j++) {
			var c = p.children[j];
			if (c.id === "kantan-page-break-overlay" ||
				c.classList.contains("kantan-page-break-overlay") ||
				c.classList.contains("page-break-indicator")) {
				continue;
			}
			bodyChildren.push(c);
		}
		if (bodyChildren.length === 0) {
			clearPageBreakOverlay(p);
			window.__kantanLastPageBreakModel = { measurementReady: true, totalPages: 1, breaks: [] };
			return;
		}

		var widthMm = currentPrintProfileState.contentAreaMm.width;
		var heightMm = currentPrintProfileState.contentAreaMm.height;
		var pageWidthPx = currentPrintProfileState.contentAreaPx ? currentPrintProfileState.contentAreaPx.width : sui.mmToCssPx(widthMm);
		var pageHeightPx = currentPrintProfileState.contentAreaPx ? currentPrintProfileState.contentAreaPx.height : sui.mmToCssPx(heightMm);

		var measuredBlocks = measureDomInFrame(bodyChildren, widthMm, heightMm);
		if (!measuredBlocks) {
			clearPageBreakOverlay(p);
			return;
		}

		var model = sui.computePageBreakModel(measuredBlocks, { pageHeightPx: pageHeightPx, pageWidthPx: pageWidthPx });
		window.__kantanLastPageBreakModel = model;

		var screenBlocks = collectScreenBlocks(p, bodyChildren);
		var mappedBreaks = sui.mapBreaksToScreenPositions(model.breaks, screenBlocks);
		renderPageBreakOverlay(p, mappedBreaks);
	}

	initPrintProfileState();
	on(window, "resize", function() {
		schedulePageBreakUpdate("window-resize");
	});
	on(window, "beforeprint", function() {
		if (!currentPrintProfileState || !currentPrintProfileState.measurementReady) {
			clearPageBreakOverlay(document.getElementById("previewer"));
		}
	});
	if (typeof document !== "undefined" && document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
		document.fonts.ready.then(function() {
			schedulePageBreakUpdate("fonts-ready");
		})["catch"](function() {});
	}
	schedulePageBreakUpdate("init");


