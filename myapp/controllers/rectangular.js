module.exports = class Rectuangular {
    constructor (name, low_left, top_right){
        this.name = name;
        this.low_left = low_left;
        this.top_right = top_right;
    }
    check_overLap (another_rect) {
        //if one rectangle is on left side of other
        if(this.low_left.x > another_rect.top_right.x || another_rect.low_left.x > this.top_right.x)
            return false;
        //if one rectangle is above other
        else if (this.top_right.y < another_rect.low_left.y || another_rect.top_right.y < this.low_left.y)
            return false;
        else
            return true;
    }
    intersection (another_rect) {
        //return points are have in both regions
        const Victor = require('victor');
        let intersect_lowLeft = new Victor(Math.max(this.low_left.x, another_rect.low_left.x),
            Math.max(this.low_left.y, another_rect.low_left.y));
        let intersect_topRight = new Victor(Math.min(this.top_right.x, another_rect.top_right.x),
            Math.min(this.top_right.y, another_rect.top_right.y));
        let inter_rect = new Rectuangular(this.name + " " +another_rect.name, intersect_lowLeft, intersect_topRight);
        return inter_rect;
    }

    included_point () {
        const Victor = require('victor');
        let points = [];
        console.log(this.low_left.x);
        for (let i=this.low_left.x; i<= this.top_right.x; i++) {
            for (let j=this.low_left.y; j<=this.top_right.y; j++) {
                points.push(new Victor(i,j));
            }
        }
        return points;
    }

}