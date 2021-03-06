var FbRating = new Class({
	Extends : FbElement,
	initialize : function (element, options, rating) {
		this.field = document.id(element);
		this.parent(element, options);
		if (this.options.canRate === false) {
			return;
		}
		if (this.options.mode === 'creator-rating' && this.options.view === 'details') {
			// deactivate if in detail view and only the record creator can rate
			return;
		}
		this.rating = rating;
		Fabrik.addEvent('fabrik.form.refresh', this.setup.bindWithEvent(this));
		this.setup(this.options.row_id);
		this.setStars();
	},
	
	setup : function (rowid) {
		this.options.row_id = rowid;
		this.element = document.id(this.options.element + '_div');
		this.spinner = new Asset.image(Fabrik.liveSite + 'media/com_fabrik/images/ajax-loader.gif', {
			'alt': 'loading',
			'class': 'ajax-loader'
		});
		this.stars = this.element.getElements('.starRating');
		this.ratingMessage = this.element.getElement('.ratingMessage');
		this.stars.each(function (i) {
			i.addEvent('mouseover', function (e) {
				this.stars.each(function (ii) {
					if (this._getRating(i) >= this._getRating(ii)) {
						ii.src = this.options.insrc;
					}
				}.bind(this));
				this.ratingMessage.innerHTML = i.alt;
			}.bind(this));
		}.bind(this));

		this.stars.each(function (i) {
			i.addEvent('mouseout', function (e) {
				this.stars.each(function (ii) {
					ii.src = this.options.outsrc;
				}.bind(this));
			}.bind(this));
		}.bind(this));

		this.stars.each(function (i) {
			i.addEvent('click', function (e) {
				this.rating = this._getRating(i);
				this.field.value = this.rating;
				this.doAjax();
				this.setStars();
			}.bind(this));
		}.bind(this));
		var clearButton = this.element.getElement('.rate_-1');
		this.element.addEvent('mouseout', function (e) {
			this.setStars();
		}.bind(this));

		this.element.addEvent('mouseover', function (e) {
			if (typeOf(clearButton) !== 'null') {
				clearButton.setStyles({
					visibility : 'visible'
				});
			}
		}.bind(this));

		if (typeOf(clearButton) !== 'null') {
			clearButton.addEvent('mouseover', function (e) {
				e.target.src = this.options.clearinsrc;
				this.ratingMessage.set('html', Joomla.JText._('PLG_ELEMENT_RATING_NO_RATING'));
			}.bind(this));
	
			clearButton.addEvent('mouseout', function (e) {
				if (this.rating !== -1) {
					e.target.src = this.options.clearoutsrc;
				}
			}.bind(this));

			clearButton.addEvent('click', function (e) {
				this.rating = -1;
				this.field.value = '';
				this.stars.each(function (ii) {
					ii.src = this.options.outsrc;
				}.bind(this));
				this.element.getElement('.rate_-1').src = this.options.clearinsrc;
				this.doAjax();
			}.bind(this));
		}
		this.setStars();
	},

	doAjax : function () {
		if (this.options.canRate === false) {
			return;
		}
		if (this.options.editable === false) {
			this.spinner.inject(this.ratingMessage);
			var data = {
				'option': 'com_fabrik',
				'format': 'raw',
				'task': 'plugin.pluginAjax',
				'plugin': 'rating',
				'method': 'ajax_rate',
				'g': 'element',
				'element_id': this.options.elid,
				'row_id': this.options.row_id,
				'elementname': this.options.elid,
				'userid': this.options.userid,
				'rating': this.rating
			};

			var closeFn = new Request({
				url: '',
				'data': data,
				onComplete: function () {
					this.spinner.dispose();
				}.bind(this)
			}).send();
		}
	},

	_getRating : function (i) {
		r = i.className.replace("rate_", "").replace("starRating ", "");
		return r.toInt();
	},

	setStars : function () {
		this.stars.each(function (ii) {
			var starScore = this._getRating(ii);
			ii.src = starScore <= this.rating ? this.options.insrc : this.options.outsrc;
		}.bind(this));
		var clearButton = this.element.getElement('.rate_-1');
		if (typeOf(clearButton) !== 'null') {
			clearButton.src = this.rating !== -1 ? this.options.clearoutsrc : this.options.clearinsrc;
		}
	},

	update : function (val) {
		this.rating = val.toInt().round();
		this.field.value = this.rating;
		this.element.getElement('.ratingScore').setText(val);
		this.setStars();
	}
});