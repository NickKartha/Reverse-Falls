/*<ON_DEPLOY_REMOVE>*/
/* global XMLSerializer, document, setTimeout, WSE */
/*
    Copyright (c) 2012, 2013 The WebStory Engine Contributors
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
    
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

    * Neither the name WebStory Engine nor the names of its contributors 
      may be used to endorse or promote products derived from this software 
      without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*</ON_DEPLOY_REMOVE>*/
(function (out)
{
    "use strict";
    
    out.assets.Textbox = function (asset, interpreter)
    {

        if (!(this instanceof out.assets.Textbox))
        {
            return new out.assets.Textbox(asset, interpreter);
        }

        var element, nameElement, textElement, cssid, x, y, width, height;

        this.interpreter = interpreter;
        this.name = asset.getAttribute("name");
        this.stage = interpreter.stage;
        this.bus = interpreter.bus;
        this.type = asset.getAttribute("behaviour") || "adv";
        this.z = asset.getAttribute("z") || 5000;
        this.showNames = asset.getAttribute("namebox") === "yes" ? true : false;
        this.nltobr = asset.getAttribute("nltobr") === "true" ? true : false;
        this.id = out.tools.getUniqueId();
        this.cssid = "wse_textbox_" + this.name;
        this.effectType = asset.getAttribute("effect") || "typewriter";
        this.speed = asset.getAttribute("speed") || 0;
        this.speed = parseInt(this.speed, 10);
        this.fadeDuration = asset.getAttribute("fadeDuration") || 0;
        
        out.tools.applyAssetUnits(this, asset);

        (function (ctx)
        {
            var el, i, len, elms;
            
            try 
            {
                elms = asset.childNodes;
                
                for (i = 0, len = elms.length; i < len; i += 1)
                {
                    if (elms[i].nodeType === 1 && elms[i].tagName === 'nameTemplate')
                    {
                        el = elms[i];
                        break;
                    }
                }
                
                if (!el)
                {
                    throw new Error('No nameTemplate found.');
                }
                
                ctx.nameTemplate = new XMLSerializer().serializeToString(el);
            }
            catch (e) 
            {
                ctx.nameTemplate = '{name}: ';
            }
        }(this));
        
        if (this.type === "nvl")
        {
            this.showNames = false;
        }

        element = document.createElement("div");
        nameElement = document.createElement("div");
        textElement = document.createElement("div");

        element.setAttribute("class", "textbox");
        textElement.setAttribute("class", "text");
        nameElement.setAttribute("class", "name");

        cssid = asset.getAttribute("cssid") || this.cssid;
        element.setAttribute("id", cssid);
        this.cssid = cssid;

        x = asset.getAttribute("x");
        if (x)
        {
            element.style.left = x;
        }

        y = asset.getAttribute("y");
        if (y)
        {
            element.style.top = y;
        }

        element.style.zIndex = this.z;
        width = asset.getAttribute("width");
        height = asset.getAttribute("height");
        
        if (width)
        {
            element.style.width = width;
        }
        
        if (height)
        {
            element.style.height = height;
        }

        element.appendChild(nameElement);
        element.appendChild(textElement);
        this.stage.appendChild(element);

        if (this.showNames === false)
        {
            nameElement.style.display = "none";
        }

        nameElement.setAttribute("id", this.cssid + "_name");
        textElement.setAttribute("id", this.cssid + "_text");

        this.nameElement = this.cssid + "_name";
        this.textElement = this.cssid + "_text";

        element.style.opacity = 0;

        this.bus.trigger("wse.assets.textbox.constructor", this);
    };

    out.tools.mixin(out.assets.mixins.displayable, out.assets.Textbox.prototype);

    out.assets.Textbox.prototype.put = function (text, name)
    {
        var textElement, nameElement, namePart, self;
        
        name = name || null;

        self = this;
        textElement = document.getElementById(this.textElement);
        nameElement = document.getElementById(this.nameElement);

        text = out.tools.replaceVariables(text, this.interpreter);
        //text = out.tools.textToHtml(text, this.nltobr);

        self.interpreter.waitCounter += 1;

        namePart = "";
        if (this.showNames === false && !(!name))
        {
            namePart = this.nameTemplate.replace(/\{name\}/g, name);
        }

        if (name === null)
        {
            name = "";
        }

        if (this.speed < 1)
        {
            if (this.fadeDuration > 0) {
                self.interpreter.waitCounter += 1;
            
                (function ()
                {
                    var valFn, finishFn, options;
                    
                    valFn = function (v)
                    {
                        textElement.style.opacity = v;
                    };
                    
                    finishFn = function ()
                    {
                        self.interpreter.waitCounter -= 1;
                    };
                    
                    options = {
                        duration: self.fadeDuration,
                        onFinish: finishFn
                    };
                    
                    out.fx.transform(valFn, 1, 0, options);
                }());
            }
            else {
                putText();
            }
        }

        if (this.speed > 0)
        {
            if (self.type === 'adv')
            {
                textElement.innerHTML = "";
            }
            
            (function ()
            {
                var container;
                
                container = document.createElement('div');
                container.setAttribute('class', 'line');
                textElement.appendChild(container);
                container.innerHTML = namePart + text;
                nameElement.innerHTML = self.nameTemplate.replace(/\{name\}/g, name);
                self.interpreter.waitCounter += 1;
                
                out.fx.dom.effects.typewriter(
                    container, 
                    { 
                        speed: self.speed, 
                        onFinish: function () 
                        { 
                            self.interpreter.waitCounter -= 1; 
                        }
                    }
                );
            }());
        }
        else if (this.fadeDuration > 0)
        {
            self.interpreter.waitCounter += 1;
            
            setTimeout(
                function ()
                {
            
                    putText();
                    
                    if (self.type === 'nvl')
                    {
                        textElement.innerHTML = '<div>' + textElement.innerHTML + '</div>';
                    }
                    
                    out.fx.transform(
                        function (v)
                        {
                            textElement.style.opacity = v;
                        },
                        0,
                        1,
                        {
                            duration: self.fadeDuration,
                            onFinish: function ()
                            {
                                self.interpreter.waitCounter -= 1;
                            }
                        }
                    );
                },
                self.fadeDuration
            );
        }

        this.bus.trigger("wse.assets.textbox.put", this, false);
        self.interpreter.waitCounter -= 1;

        return {
            doNext: false
        };
        
        function putText () {

            if (self.type === 'adv')
            {
                textElement.innerHTML = "";
            }
            
            textElement.innerHTML += namePart + text;
            nameElement.innerHTML = self.nameTemplate.replace(/\{name\}/g, name);
        }
    };

    out.assets.Textbox.prototype.clear = function ()
    {
        document.getElementById(this.textElement).innerHTML = "";
        document.getElementById(this.nameElement).innerHTML = "";
        this.bus.trigger("wse.assets.textbox.clear", this);
        
        return {
            doNext: true
        };
    };

    out.assets.Textbox.prototype.save = function ()
    {
        return {
            assetType: "Textbox",
            type: this.type,
            showNames: this.showNames,
            nltobr: this.nltobr,
            cssid: this.cssid,
            nameElement: this.nameElement,
            textElement: this.textElement,
            z: this.z
        };
    };

    out.assets.Textbox.prototype.restore = function (save)
    {
        this.type = save.type;
        this.showNames = save.showNames;
        this.nltobr = save.nltobr;
        this.cssid = save.cssid;
        this.nameElement = save.nameElement;
        this.textElement = save.textElement;
        this.z = save.z;

        document.getElementById(this.cssid).style.zIndex = this.z;
    };    
}(WSE));