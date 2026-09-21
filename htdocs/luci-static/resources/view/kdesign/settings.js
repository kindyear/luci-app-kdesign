'use strict';
'require view';
'require form';

function validateResource(sectionId, value) {
	if (!value || /^\//.test(value) || /^https?:\/\//i.test(value))
		return true;
	return _('Enter an absolute web path or an HTTP(S) URL.');
}

return view.extend({
	render: function() {
		var m = new form.Map('kdesign', _('KDesign theme'),
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

		o = s.taboption('login', form.Value, 'login_background', _('Background image URL'));
		o.placeholder = '/luci-static/kdesign/custom/background.jpg';
		o.description = _('Use an absolute web path or an HTTP(S) URL. Leave empty for the default background.');
		o.validate = validateResource;

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
