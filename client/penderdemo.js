/**
 * Copyright 2012 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Pender Client Demo
 * 
 * basic demo of client app using Pender
 *
 * Lorin Beer
 * lorin@adobe.com 
 */


/**
 * container for art resource meta data
 */
var buildbotmeta = {
    "framemap" : "",
    "framenumb" : 9,
    "border" : 1,
    "columns" : 4,
    "rows" : 3,
    "height" : 126,
    "width" : 126
}


/**
 * 2D coordinate
 */
function Point(x,y) {
    this.x  = x || 0;
    this.y = y || 0;
}


/**
 * storage class for animation data
 */
function Animation(data,framenumb, cols, rows, framewidth, frameheight, bordersize, initialFrame ) {
    this._currentframe = initialFrame || 0; //optional parameter
    this._frames = []; //coordinate of top left texture coordinate for each frame 
    //copy the data out
    this._framemap = data.framemap; //framemap matching the data
    this._framenumb = data.framenumb;
    this._borderwidth = data.border;
    this._cols = data.columns;
    this._rows = data.rows;
    this._height = data.height;
    this._width = data.width;

    /**
     * currently oscillates, can be changed to provide custom frame updating
     * on a per Animation basis
     */
    this._frameupdate= function() {	
	this._currentframe += 1;
	if( this._currentframe >= this._frames.length ) { this._currentframe = -(this._currentframe-1); }

    }
    
    this.initFrames = function(framenumb) {
	    var i = 0;
	    var done = false;
	    var top = new Point();
	    
	    for (var row  = 0; row < this._rows && !done; row++) {
		for (var col = 0; col < this._cols && !done; col++) {
		    top = new Point( col * (this._frameheight+1)+(col+1)*this._bordersize, row * (this._framewidth+1) +(row+1)* this._bordersize);
		    this._frames.push ( top );
		    i+=1;
		    if( i >= framenumb ) { 
			done = true; 
		    }
		}
	    }
    }
    this.initFrames( framenumb );


    this.draw = function(texid, dx, dy, dWidth, dHeight) {

	
	//absolute value of current frame index is used, allowing for negative frame counts
	var curframe = this._currentframe<0? -1 * this._currentframe : this._currentframe;
	var frametop = this._frames[curframe];
	
	Pender.canvas.drawImage(Pender.getImage(texid), frametop.x, frametop.y, this._framewidth, this._frameheight,
			     dx, dy, dWidth, dHeight);

	//Pender.ctx.drawImage( Pender.getImage(0), frametop.x, frametop.y, this._framewidth, this._frameheight, dx, dy, this._framewidth, this._frameheight   );
	this._frameupdate();
    }


}


function AnimatedSprite(anim) {
    this.xpos = 0;
    this.ypos = 0;
    this.xvel = Math.random()*5;
    this.yvel = Math.random()*5;
    this.width = 128;
    this.height = 128;
    this._animation = anim;
    var self = this;
    
   this.draw = function(texid) {
	self.xpos = self.xpos+ self.xvel;
	self.ypos = self.ypos+ self.yvel;
	if( self.xpos < 0 || self.xpos >= 720-self.width/*Pender.canvas.width*/) {
	    self.xvel = self.xvel * -1; 
	}
	if(self.ypos < 0 || self.ypos >= 1084-self.height/*Pender.canvas.height */) { 
	    self.yvel = self.yvel * -1; 
	}
	
	self._animation.draw( texid, self.xpos, self.ypos, self.width, self.height );
    };
}


var Bots = new function () {
    this.numb = 5;
    this.bots = [];
    this.texid = 0;
    var self = this;
    this.init = function() {
	console.log("initing");
        self.texid = Pender.loadImage ("demos/client/assets/build_bot_map.png");
	for (var i = 0; i < self.numb; i++) {
	    var anim = new Animation (self.texid, 9, 4, 3, 126, 126, 1);
	    self.bots.push (new AnimatedSprite(anim));
	}
    };
    
    this.draw =  function() {
	Pender.canvas.clearRect(0,0,400,400 );
      	for(var i = 0; i < self.numb; i++) {
	    self.bots[i].draw(self.texid);    	     
	}
    };
    
}


function init() {
    console.log("INIT CALLED");
    Bots.init();
    Pender.setInterval(Bots.draw,50);
}