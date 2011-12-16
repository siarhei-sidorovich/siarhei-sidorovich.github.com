var liveSearch = function() {
	// trim() for IE
	if(typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		}
	}
	var inp = document.getElementById('search');
	var res = document.getElementById('res');

	//XmlHttpRequest for all browsers
	var getXmlHttp = function() {
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
			} catch (E) {
				xmlhttp = false;
			}
		}

		if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
	}

	var xmlHttp = getXmlHttp();

	var checkEnter = function(e) {
		if (!e) e = window.event;
		if (!e.which) e.which = e.keyCode;
		if(e.which == 13) {
			if(e.preventDefault) {
				e.preventDefault();
			} else {
				e.returnValue = false;
			}
			this.selectedIndex = -1;
			this.style.display = 'none';
			inp.focus();
		}
	}

	var resToInp = function(e) {
		if (!e) e = window.event;
		if (!e.which) e.which = e.keyCode;
		inp.value = this[this.selectedIndex].text;
		if ( e.which == 1 || e.which == 0) {
			this.selectedIndex = -1;
			this.style.display = 'none';
			inp.focus();
		}
		else if (this.selectedIndex==0 && this.options[0].id != 'first') {
			this.options[0].id = 'first';
		}
		else if(this.selectedIndex!=0 && this.options[0].id == 'first') {
			this.options[0].id = '';
		}
		else if (e.which == 38 && res.selectedIndex==0 && res.options[0] == document.getElementById('first')) {
			inp.focus();
			this.selectedIndex = -1;
		}
	}

	var keys = function(e) {
		if (!e) e = window.event;
		if (!e.which) e.which = e.keyCode;
		if(e.which == 40 && res.style.display == 'block') {
			res.focus();
			res.selectedIndex=0;
			this.value = res[res.selectedIndex].text;
		}
		if(this.value.trim().length < 3) {
			if(res.style.display == 'block') {
				res.style.display = 'none';
			}
			return;
		} else 	response(e);

	}

	var response = function(e) {
		if(e.which == 37 || e.which == 38 || e.which == 39 || e.which == 40) return;// not send request when we using arrow keys
		xmlHttp.open('GET', '/jstraning/countries.php?q='+inp.value, true);
		xmlHttp.onreadystatechange = function()  {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				var json = eval( '(' + xmlHttp.responseText + ')' );
				if(json == '') {
					res.style.display = 'none';
					return;
				}
				res.innerHTML = '';
				if(json.length == 1) {
					res.size = 2;
				}
				else res.size = json.length;

				for (var i = 0; i<json.length; i++)
				{
					var newElement = document.createElement('option');
					newElement.innerHTML =json[i].shortName + ' ( ' + json[i].longName + ' )';
					res.appendChild(newElement);
				}
				if(res.size != 0) {
					res.style.display = 'block';
				}
			}
		}
		xmlHttp.send(null);
	}
	var myEvent = function(el, type, fn){
		if (typeof el.addEventListener === 'function') {
			myEvent = function(el, type, fn) {
				el.addEventListener(type, fn, false);
			};
		} else if (typeof el.attachEvent === 'function'){
			myEvent = function(el, type, fn) {
				el.attachEvent('on' + type, fn);
			};
		} else {
			myEvent = function(el, type, fn) {
				el['on' + type] = fn;
			};
		}

		return myEvent(el, type, fn);
	};


	myEvent(inp, 'keyup', keys);
	myEvent(res, 'keydown', checkEnter);
	myEvent(res, 'keyup', resToInp);
	myEvent(res, 'click', resToInp);
}