import "../core/functor";
import "../math/abs";
import "geom";
import "rectangle";

d3.geom.quadtree = function(points, x1, y1, x2, y2) {
  var Ax1 = function (d) {return d.x1();},
      Ay1 = function (d) {return d.y1();},
      Ax2 = function (d) {return d.x2();},
      Ay2 = function (d) {return d.y2();},
      compat;

  // For backwards-compatibility.
  if (compat = arguments.length) {
    x1 = d3_geom_quadtreeCompatX1;
    y1 = d3_geom_quadtreeCompatY1;
    x2 = d3_geom_quadtreeCompatX2;
    y2 = d3_geom_quadtreeCompatY2;
    if (compat === 3) {
      y2 = y1;
      x2 = x1;
      y1 = x1 = 0;
    }    
    return quadtree(points);
  }

  function quadtree(data) {
    var d,
        fx1 = d3_functor(Ax1),
        fy1 = d3_functor(Ay1),
        fx2 = d3_functor(Ax2),
        fy2 = d3_functor(Ay2),
        x1s,
        x2s,
        y1s,
        y2s,
        i,
        n,
        x1_,
        y1_,
        x2_,
        y2_;

    if (x1 != null) {
      x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
    } else {
      // Compute bounds, and cache points temporarily.
      x2_ = y2_ = -(x1_ = y1_ = Infinity);
      x1s = [], y1s = [], x2s = [], y2s = [];
      n = data.length;
      if (compat) for (i = 0; i< n; ++i) {
        d = data[i];
        if (d.x1() < x1_) x1_ = d.x1();
        if (d.y1() < y1_) y1_ = d.y1();
        if (d.x2() > x2_) x2_ = d.x2();
        if (d.y2() > y2_) y2_ = d.y2();
        x1s.push(d.x1());
        y1s.push(d.y1());
        x2s.push(d.x2());
        y2s.push(d.y2());
      } else for (i = 0; i < n; ++i) {
        var dx1 = +fx1(d = data[i], i),
            dy1 = +fy1(d, i),
            dx2 = +fx2(d, i),
            dy2 = +fy2(d, i);
        if (dx1 < x1_) x1_ = dx1;
        if (dy1 < y1_) y1_ = dy1;
        if (dx2 > x2_) x2_ = dx2;
        if (dy2 > y2_) y2_ = dy2;
        x1s.push(dx1);
        y1s.push(dy1);
        x2s.push(dx2);
        y2s.push(dy2);
      } 
    }

    // Squarify the bounds.
    var dx = x2_ - x1_,
        dy = y2_ - y1_;
    if (dx > dy) y2_ = y1_ + dx;
    else x2_ = x1_ + dy;

    // Recursively inserts the specified point p at the node n or one of its
    // descendants. The bounds are defined by [x1, x2] and [y1, y2].
    function insert(n, d, dx1, dy1, dx2, dy2, x1, y1, x2, y2) {
      if (isNaN(dx1) || isNaN(dy1) || isNaN(dx2) || isNaN(dy2)) return; // ignore invalid points
      if (n.leaf) {
        var nx1 = n.x1,
            ny1 = n.y1,
            nx2 = n.x2,
            ny2 = n.y2;
        if (nx1 != null) {
          // If the point at this leaf node is at the same position as the new
          // point we are adding, we leave the point associated with the
          // internal node while adding the new point to a child node. This
          // avoids infinite recursion.
          var dist = d3_geom_quadtreeDistLeg(nx1,nx2,dx1,dx2) 
                     + d3_geom_quadtreeDistLeg(ny1,ny2,dy1,dy2);
          if (dist < .01) {
            insertChild(n, d, dx1, dy1, dx2, dy2, x1, y1, x2, y2);
          } else {
            var nPoint = n.point;
            n.x1 = n.x2 = n.y1 = n.y2 = n.point = null;
            insertChild(n, nPoint, nx1, ny1, nx2, ny2, x1, y1, x2, y2);
            insertChild(n, d, dx1, dy1, dx2, dy2, x1, y1, x2, y2);
          }
        } else {
          n.x1 = dx1, n.y1 = dy1, n.x2 = dx2, n.y2 = dy2, n.point = d;
        }
      } else {
        insertChild(n, d, dx1, dy1, dx2, dy2, x1, y1, x2, y2);
      }
    }

    // Recursively inserts the specified point [x, y] into a descendant of node
    // n. The bounds are defined by [x1, x2] and [y1, y2].
    function insertChild(n, d, dx1, dy1, dx2, dy2, x1, y1, x2, y2) {
      // Compute the split point, and the quadrants in which to insert p.
      var sx = (x1 + x2) * .5,
          sy = (y1 + y2) * .5,
          left = dx1 <= sx,
          top = dy1 <= sy,
          right = dx2 >= sx,
          bottom = dy2 >= sy;
      n.leaf = false;
      // Update the bounds, clip d and recursively insert child
      if (left && top) { 
        n = n.nodes[0] || (n.nodes[0] = d3_geom_quadtreeNode());
        d.x1 = Math.max(dx1, x1); d.y1 = Math.min(dy1,y1);
        d.x2 = Math.min(dx2, sx); d.y2 = Math.max(dy2,sy);
        insert(n, d, d.x1, d.y1, d.x2, d.y2, x1, y1, sx, sy);  
      }
      if (right && top) { 
        n = n.nodes[1] || (n.nodes[1] = d3_geom_quadtreeNode());
        d.x1 = Math.max(dx1, sx); d.y1 = Math.min(dy1,y1);
        d.x2 = Math.min(dx2, x2); d.y2 = Math.max(dy2,sy);
        insert(n, d, d.x1, d.y1, d.x2, d.y2, sx, y1, x2, sy); 

      }
      if (left && bottom) { 
        n = n.nodes[2] || (n.nodes[2] = d3_geom_quadtreeNode());
        d.x1 = Math.max(dx1, x1); d.y1 = Math.min(dy1,sy);
        d.x2 = Math.min(dx2, sx); d.y2 = Math.max(dy2,y2);
        insert(n, d, d.x1, d.y1, d.x2, d.y2, x1, sy, sx, y2);
      }
      if (right && bottom) {
        n = n.nodes[3] || (n.nodes[3] = d3_geom_quadtreeNode());
        d.x1 = Math.max(dx1, sx); d.y1 = Math.min(dy1,sy);
        d.x2 = Math.min(dx2, x2); d.y2 = Math.max(dy2,y2);
        insert(n, d, d.x1, d.y1, d.x2, d.y2, sx, sy, x2, y2);
      }
    }

    // Create the root node.
    var root = d3_geom_quadtreeNode();

    root.add = function(d) {
      insert(root, d, +fx1(d, ++i), +fy1(d, i), +fx2(d, i), +fy2(d, i), x1_, y1_, x2_, y2_);
    };

    root.visit = function(f) {
      d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
    };

    // Insert all points.
    i = -1;
    if (x1 == null) {
      while (++i < n) {
        insert(root, data[i], x1s[i], y1s[i], x2s[i], y2s[i], x1_, y1_, x2_, y2_);
      }
      --i; // index of last insertion
    } else data.forEach(root.add);

    // Discard captured fields.
    x1s = y1s = x2s = y2s = data = d = null;

    return root;
  }

  quadtree.x1 = function(_) {
    return arguments.length ? (Ax1 = _, quadtree) : Ax1;
  };

  quadtree.y1 = function(_) {
    return arguments.length ? (Ay1 = _, quadtree) : Ay1;
  };

  quadtree.x2 = function(_) {
    return arguments.length ? (Ax2 = _, quadtree) : Ax2;
  };

  quadtree.y2 = function(_) {
    return arguments.length ? (Ay2 = _, quadtree) : Ay2;
  };

  quadtree.extent = function(_) {
    if (!arguments.length) return x1 == null ? null : [[x1, y1], [x2, y2]];
    if (_ == null) x1 = y1 = x2 = y2 = null;
    else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], y2 = +_[1][1];
    return quadtree;
  };

  quadtree.size = function(_) {
    if (!arguments.length) return x1 == null ? null : [x2 - x1, y2 - y1];
    if (_ == null) x1 = y1 = x2 = y2 = null;
    else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
    return quadtree;
  };

  return quadtree;
};

function d3_geom_quadtreeCompatX1(d) { return d.x1; }
function d3_geom_quadtreeCompatY1(d) { return d.y1; }
function d3_geom_quadtreeCompatX2(d) { return d.x2; }
function d3_geom_quadtreeCompatY2(d) { return d.y2; }

function d3_geom_quadtreeNode() {
  return {
    leaf: true,
    nodes: [],
    point: null,
    x1: null,
    y1: null,
    x2: null,
    y2: null
  };
}

function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
  if (!f(node, x1, y1, x2, y2)) {
    var sx = (x1 + x2) * .5,
        sy = (y1 + y2) * .5,
        children = node.nodes;
    if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
    if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
    if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
    if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
  }
}

function d3_geom_quadtreeDistLeg(ax1,ax2,bx1,bx2) {
  if (ax1 > bx1) {
    if (ax1 <= bx2) return 0;
    else return ax1 - bx2;
  } else {
    if (ax2 >= bx1) return 0;
    else return bx1 - ax2;
  }
}
