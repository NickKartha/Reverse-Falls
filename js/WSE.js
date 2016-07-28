/* global using */

using("MO5.EventBus", "WSE.assets", "WSE.commands", "WSE.dataSources", "WSE.functions").
define("WSE", function (EventBus, assets, commands, dataSources, functions) {
    
    "use strict";
    
    var WSE = {}, version = "2016.7.0-final.1607281539";
    
    EventBus.inject(WSE);
    
    WSE.dataSources = dataSources;
    WSE.assets = assets;
    WSE.commands = commands;
    WSE.functions = functions;
    
    WSE.getVersion = function () {
        return version;
    };
    
    return WSE;
    
});