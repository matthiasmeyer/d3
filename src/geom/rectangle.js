import "../core/functor";
import "geom";

d3.geom.rectangle = function (ob, x1, x2, y1, y2) {
	var rect = {};

	rect.x1 = function(d) {
		if (!arguments.length) return this._x1();
		this._x1 = d3_functor(d);
		return rect;
	}

	rect.x2 = function(d) {
		if (!arguments.length) return this._x2();
		this._x2 = d3_functor(d);
		return rect;
	}

	rect.y1 = function(d) {
		if (!arguments.length) return this._y1();
		this._y1 = d3_functor(d);
		return rect;
	}

	rect.y2 = function(d) {
		if (!arguments.length) return this._y2();
		this._y2 = d3_functor(d);
		return rect;
	}

	rect.area = function() {
		return (this.x2() - this.x1()) * (this.y2() - this.y1());
	}

	rect.contains_x = function(x) {
		return (x >= this.x1() && x <= this.x2());
	}

	rect.contains_y = function(y) {
		return (y >= this.y1() && y <= this.y2());
	}

	rect.contains_point = function(x,y) {
		 return this.contains_x(x) && this.contains_y(y);
	}

	rect.obj = function(d) {
		if (!arguments.length) return this._obj;
		this._obj = d;
		return rect;
	}

	rect.cut_x = function(x) {
		if (!this.contains_x(x)) return false;
		var rect1 = d3.geom.rectangle(this._obj, this.x1(),x        ,this.y1(),this.y2()),
			rect2 = d3.geom.rectangle(this._obj, x        ,this.x2(),this.y1(),this.y2());
		return [rect1,rect2];
	}

	rect.cut_y = function(y) {
		if (!this.contains_y(y)) return false;
		var rect1 = d3.geom.rectangle(this._obj, this.x1(),this.x2(),this.y1(),y        ),
			rect2 = d3.geom.rectangle(this._obj, this.x1(),this.x2(),y        ,this.y2());
		return [rect1,rect2];
	}

	rect.clip = function(_rect) {
		var x1 = Math.max(this.x1(),_rect.x1()),
			x2 = Math.min(this.x2(),_rect.x2()),
			y1 = Math.max(this.y1(), _rect.y1()),
			y2 = Math.min(this.y2(), _rect.y2());
		if (x2 - x1 >= 0 && y2 - y1 >= 0)
			return d3.geom.rectangle(null,x1,x2,y1,y2);
		else
			return false;
	}

	rect.overlaps = function(_rect) {
		var x1 = Math.max(this.x1(),_rect.x1()),
			x2 = Math.min(this.x2(),_rect.x2()),
			y1 = Math.max(this.y1(), _rect.y1()),
			y2 = Math.min(this.y2(), _rect.y2());
		return (x2 - x1 >= 0 && y2 - y1 >= 0);
	}

	rect.contains_rect = function(_rect) {
		return (this.contains_point(_rect.x1(),_rect.y1()) && this.contains_point(_rect.x2(),_rect.y2()));
	}

	rect.is_contained = function(_rect) {
		return (_rect.contains_point(this.x1(),this.y1()) && _rect.contains_point(this.x2(), this.y2()));
	}


	rect.centroid = function() {
		return [this.x2() - this.x1(),this.y2() - this.y2()];
	}

	rect.obj(ob);
	rect.x1(Math.min(x1,x2));
	rect.x2(Math.max(x1,x2));
	rect.y1((Math.min(y1,y2));
	rect.y2(Math.max(y1,y2));
	return rect;
}