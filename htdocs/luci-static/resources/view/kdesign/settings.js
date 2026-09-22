'use strict';
'require view';
'require form';
'require fs';
'require request';
'require rpc';
'require ui';

var MAX_BACKGROUND_SIZE = 5 * 1024 * 1024;
var BACKGROUND_PUBLIC_DIRECTORY = '/luci-static/kdesign/custom';
var BACKGROUND_TYPES = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif'
};

function validateResource(sectionId, value) {
	if (!value || /^\//.test(value) || /^https?:\/\//i.test(value))
		return true;
	return _('Enter an absolute web path or an HTTP(S) URL.');
}

function uploadBackground(targetOption, sectionId) {
	return new Promise(function(resolve) {
		var selectedFile = null;
		var selectedExtension = null;
		var status = E('p', { 'class': 'kdesign-upload-status' }, [
			_('Choose a JPEG, PNG, WebP, or GIF image up to 5 MiB.')
		]);
		var input = E('input', {
			type: 'file',
			accept: 'image/jpeg,image/png,image/webp,image/gif',
			style: 'display:none'
		});
		var uploadButton = E('button', {
			class: 'btn cbi-button-action important',
			disabled: true
		}, [ _('Upload') ]);

		input.addEventListener('change', function() {
			selectedFile = input.files[0] || null;
			selectedExtension = selectedFile ? BACKGROUND_TYPES[selectedFile.type] : null;
			if (!selectedFile) {
				status.textContent = _('No image selected.');
				uploadButton.disabled = true;
			}
			else if (!selectedExtension) {
				status.textContent = _('Unsupported image format. Please choose a JPEG, PNG, WebP, or GIF image.');
				uploadButton.disabled = true;
			}
			else if (selectedFile.size > MAX_BACKGROUND_SIZE) {
				status.textContent = _('The selected image exceeds the 5 MiB size limit.');
				uploadButton.disabled = true;
			}
			else {
				status.textContent = _('%s · %1024mB').format(selectedFile.name, selectedFile.size);
				uploadButton.disabled = false;
			}
		});

		uploadButton.addEventListener('click', function() {
			if (!selectedFile || !selectedExtension)
				return;
			uploadButton.disabled = true;
			status.textContent = _('Uploading image…');
			var publicPath = '%s/login-background.%s'.format(BACKGROUND_PUBLIC_DIRECTORY, selectedExtension);
			var uploadedPath = publicPath + '?v=' + Date.now();
			var data = new FormData();
			data.append('sessionid', rpc.getSessionID());
			data.append('filename', '/tmp/kdesign-background-upload');
			data.append('filedata', selectedFile);

			request.post(L.env.cgi_base + '/cgi-upload', data, { timeout: 0 }).then(function(response) {
				var reply = response.json();
				if (L.isObject(reply) && reply.failure)
					throw new Error(reply.message || reply.failure);
				return fs.exec('/usr/libexec/kdesign-background-install', [ selectedExtension ]).then(function(result) {
					if (result.code !== 0)
						throw new Error((result.stderr || '').trim() || _('The uploaded image failed validation.'));
				});
			}).then(function() {
				var widget = targetOption.getUIElement(sectionId);
				targetOption.cfgvalue(sectionId, uploadedPath);
				if (widget)
					widget.setValue(uploadedPath);
				ui.hideModal();
				ui.addNotification(null, E('p', {}, [ _('Image uploaded. Save and apply to use it on the login page.') ]));
				resolve();
			}).catch(function(error) {
				status.textContent = _('Upload failed: %s').format(error.message || error);
				uploadButton.disabled = false;
			});
		});

		ui.showModal(_('Upload login background'), [
			status,
			input,
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'btn', 'click': function() { ui.hideModal(); resolve(); } }, [ _('Cancel') ]),
				' ',
				E('button', { 'class': 'btn cbi-button', 'click': function() { input.click(); } }, [ _('Choose image…') ]),
				' ',
				uploadButton
			])
		]);
	});
}

return view.extend({
	render: function() {
		var m = new form.Map('kdesign', _('KDesign theme settings'),
			_('Customize the KDesign identity and login appearance. Changes take effect after the page is reloaded.'));
		var s = m.section(form.NamedSection, 'theme', 'theme', _('Appearance'));
		s.anonymous = true;
		s.addremove = false;

		s.tab('brand', _('Brand'));
		s.tab('login', _('Login page'));
		s.tab('layout', _('Layout'));

		var o = s.taboption('brand', form.Value, 'brand_name', _('Brand name'));
		o.default = 'KDesign';
		o.rmempty = false;

		o = s.taboption('brand', form.Value, 'brand_subtitle', _('Brand subtitle'));
		o.placeholder = _('Use router hostname');
		o.description = _('Leave empty to display the router hostname.');

		o = s.taboption('brand', form.Value, 'brand_logo', _('Brand logo URL'));
		o.placeholder = '/luci-static/kdesign/logo.svg';
		o.description = _('Use an absolute web path or an HTTP(S) URL. Leave empty to use the built-in logo.');
		o.validate = validateResource;

		o = s.taboption('brand', form.Value, 'footer_text', _('Footer text'));
		o.placeholder = 'KDesign';
		o.description = _('Leave empty to use the brand name.');

		o = s.taboption('login', form.Value, 'login_title', _('Login title'));
		o.placeholder = _('Log in');

		o = s.taboption('login', form.Value, 'login_subtitle', _('Login subtitle'));
		o.placeholder = 'LuCI / KDesign';

		o = s.taboption('login', form.ListValue, 'background_source', _('Background source'));
		o.value('builtin', _('Built-in background'));
		o.value('upload', _('Uploaded image'));
		o.value('url', _('Custom image URL'));
		o.value('bing', _('Bing daily wallpaper'));
		o.default = 'builtin';
		o.rmempty = false;

		o = s.taboption('login', form.Value, 'login_background', _('Background image URL'));
		o.placeholder = '/luci-static/kdesign/custom/background.jpg';
		o.description = _('Use an absolute web path or an HTTP(S) URL. Leave empty for the default background.');
		o.validate = validateResource;
		o.depends('background_source', 'url');
		o.retain = true;

		var uploadedBackground = s.taboption('login', form.Value, 'uploaded_background', _('Uploaded image path'));
		uploadedBackground.readonly = true;
		uploadedBackground.rmempty = false;
		uploadedBackground.placeholder = BACKGROUND_PUBLIC_DIRECTORY + '/login-background.jpg';
		uploadedBackground.depends('background_source', 'upload');
		uploadedBackground.retain = true;
		uploadedBackground.forcewrite = true;
		uploadedBackground.formvalue = function(sectionId) {
			var widget = this.getUIElement(sectionId);
			var value = widget ? widget.getValue() : null;
			return value || this.cfgvalue(sectionId);
		};

		o = s.taboption('login', form.Button, '_upload_background', _('Upload background image'));
		o.inputstyle = 'action';
		o.inputtitle = _('Choose image…');
		o.depends('background_source', 'upload');
		o.onclick = function(sectionId) {
			return uploadBackground(uploadedBackground, sectionId);
		};

		o = s.taboption('login', form.Button, '_refresh_bing', _('Bing wallpaper'));
		o.inputstyle = 'action';
		o.inputtitle = _('Update now');
		o.description = _('The wallpaper is cached locally and refreshed automatically every six hours while Bing mode is enabled.');
		o.depends('background_source', 'bing');
		o.onclick = function() {
			return fs.exec('/usr/libexec/kdesign-bing-update', [ '--force' ]).then(function(result) {
				if (result.code !== 0)
					throw new Error((result.stderr || '').trim() || _('Unable to update the Bing wallpaper.'));
				ui.addNotification(null, E('p', {}, [ _('Bing wallpaper updated.') ]));
			}).catch(function(error) {
				ui.addNotification(null, E('p', {}, [ _('Bing wallpaper update failed: %s').format(error.message || error) ]), 'error');
			});
		};

		o = s.taboption('login', form.Value, 'login_background_color', _('Background color'));
		o.placeholder = '#f7f7f8';
		o.validate = function(sectionId, value) {
			return !value || /^#[0-9a-f]{6}$/i.test(value) || _('Enter a six-digit hexadecimal color such as #f7f7f8.');
		};

		o = s.taboption('login', form.ListValue, 'login_overlay', _('Image darkening'));
		o.default = '0';
		['0', '10', '20', '30', '40', '50', '60', '70', '80'].forEach(function(value) {
			o.value(value, value + '%');
		});

		o = s.taboption('layout', form.Flag, 'sidebar_collapsed', _('Collapse sidebar by default'));
		o.default = o.disabled;
		o.description = _('This default is used until a browser explicitly expands or collapses the sidebar.');

		return m.render();
	}
});
