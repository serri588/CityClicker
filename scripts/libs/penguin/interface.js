define(["penguin/game"], function(game){
    self = this;
    init = false;

    //function scopes
    public = {};
    hidden = {};
    api = {};

    //private variables
    clientCallback = null;
    requiredElements = [];
    allowedActions = ["buy", "sell", "use", "play", "pause"];
    
    //public variables

    //private functions
    var newModel = function (args, index, callback) {
        if (typeof clientCallback == "function") {
            clientCallback(["addModel", { element: args }]);
        }

        if (typeof index == 'integer') {
            return callback[index + 1](args, index, callback);
        }
    }

    var updateModel = function (args, index, callback) {
        if (typeof clientCallback == "function") {
            clientCallback(["updateModel", { element: args }]);
        }

        if (typeof index == 'integer') {
            return callback[index + 1](args, index, callback);
        }
    }

    var loopStatus = function (args, index, callback) {
        if (typeof clientCallback == "function") {
            clientCallback(["loopStatus", args ]);
        }

        if (typeof index == 'integer') {
            return callback[index + 1](args, index, callback);
        }
    }

    var logEvent = function (args, index, callback) {
        if (typeof clientCallback == "function") {
            clientCallback(["logEvent", args]);
        }

        if (typeof index == 'integer') {
            return callback[index + 1](args, index, callback);
        }
    }

    //hidden functions

    public.addAdditionalElements = function(args){
        public.addRequiredElement(args);
        return clientCallback(["addElement", { element: args }]);
    }

    public.addRequiredElement = function (args) {
        if (typeof args === 'undefined' || args === null) {
            throw new CustomError("no arguments sent");
        }
        if (typeof args !== 'string') {
            throw new CustomError("argument wrong type: expected string");
        }

        requiredElements.push(args);
    };

    //api functions

    //public functions
    public.setCallback = function (callback) {
        clientCallback = callback;
    };

    public.getRequiredElements = function(){
        return requiredElements;
    }

    public.getAllowedActions = function () {
        return allowedActions;
    }

    public.sendAction = function (args) {
        if (typeof args === 'undefined' || args === null) {
            throw new CustomError("no arguments sent");
        }
        if (typeof args.event !== 'string') {
            console.log(args);
            throw new CustomError("argument wrong type: expected string");
        }
        if (allowedActions.indexOf(args.event) >= 0) {
            if (args.event == "pause" || args.event == "play") {
                data = {
                    func: "notify",
                    args: {
                        module: "gameLoop",
                        event: args.event,
                        args: {}
                    }
                };

                game.api(data);
            }
            else {
                data = {
                    func: "clientEvent",
                    args: {
                        module: args.module,
                        args: {
                            event: args.event,
                            item: args.item
                        }
                    }
                };

                game.api(data);
            }
        }
    }

        //initialize module
        data = {
            func: "registerNotification",
            args: {
                module: "models",
                event: "new model",
                callback: newModel
            }
        };

        game.api(data);

        data = {
            func: "registerNotification",
            args: {
                module: "models",
                event: "update model",
                callback: updateModel
            }
        };

        game.api(data);

        data = {
            func: "registerNotification",
            args: {
                module: "gameLoop",
                event: "status",
                callback: loopStatus
            }
        };

   

        game.api(data);

        data = {
            func: "registerNotification",
            args: {
                module: "log",
                event: "log",
                callback: logEvent
            }
        };



        game.api(data);

    
  /*  public.width = 2;
    public.height = 2;
    
    public.widthCost = 100;
    public.heightCost = 100;
    
    public.tileWidth = 32;
    public.tileHeight = 32;
    
    public.position = [0,0];
    
    public.layout = new Array();
    
    public.selectedPosition = [0,0];
    
    public.ClickEvent = function(x,y){
        tile = game.Layout.layout[x][y];
        public.selectedPosition= [tile.GetProperty("posX"), tile.GetProperty("posY")];
        $("#tilePos").text(tile.GetProperty("posX") + "/" + tile.GetProperty("posY"));
        $("#tileType").text(tile.DisplayName);
        $("#tileValue").text(tile.GetProperty("value"));
    };
    
    public.ResourceEvent = function(resourceName, value){
        $("#resource"+resourceName).text(parseFloat(value).toFixed(2));
        $("#perTick"+resourceName).text(parseFloat(game.Player.Resources[resourceName].GetProperty('perTick')).toFixed(2));
    };
    
    public.PurchaseEvent = function(player){
        if (typeof player === 'undefined'){
            player = Penguin.Game.player;
        }
        
        var value = $("#tilePurchaseSelect :selected").val();
        
       // console.log('try purchase');
        Penguin.Game.Tiles[value].prototype.TryPurchase(player);
    };
    
    public.FinishPurchase = function(args){
        //console.log(args);
        game.Layout.layout[public.selectedPosition[0]][public.selectedPosition[1]].OnSale(game.Player);
        game.Layout.layout[public.selectedPosition[0]][public.selectedPosition[1]] = new game.Tiles[args]();
        game.Layout.layout[public.selectedPosition[0]][public.selectedPosition[1]].SetPos(public.selectedPosition[0], public.selectedPosition[1]);
        game.Layout.layout[public.selectedPosition[0]][public.selectedPosition[1]].OnPurchase(game.Player);
        game.UpdateGraphics();
    };
    
    public.SendUpdateResources = function(){
       $.each(game.Player.Resources, function(key, value){
            game.worker.postMessage(JSON.stringify({
                callFunction:'resourceUpdate',
                args: {name: key}
            }));
            //$("#resource"+value).text(parseFloat(currentValue).toFixed(2));
           // $("#perTick"+value).text(parseFloat(perTick).toFixed(2));

        });
    };
    
    public.ReceiveUpdateResources = function(args){
        //console.log(args);
        $("#resource"+args.name).text(parseFloat(args.currentCount).toFixed(2));
        $("#perTick"+args.name).text(parseFloat(args.perTick).toFixed(2));

    };
    
    public.CreatePurchaseOptions = function(){
        var select = $("#tilePurchaseSelect");
        
        $.each(game.Tiles, function(index, value){
            select.append('<option value="'+value.prototype.Name+'">'+value.prototype.DisplayName+'</option>');
        });
    };
    
    public.SendPurchaseOptions = function(){
        $.each(game.Tiles, function(index, value){
            value.prototype.PurchaseAvailable();
        });
    };
    
    public.RecievePurchaseOptions = function(args){ 
       // console.log(args.value);
        var select = $("#tilePurchaseSelect");
        
        var update = true;
        
        for (var i = 0; i < args.value.length; i++){
           //console.log(parseFloat(args.args[i]) +": "+ args.value[i])
            if (parseFloat(args.args[i]) < args.value[i]){
                update = false;
            }
        }
        
        if(update){
            $.each($("#tilePurchaseSelect option"), function(key, value){
                //console.log($(value).val());
                if($(value).val() == args.args[args.value.length]){
                    if(update){
                        $(value).attr("disabled", "disabled");
                    }
                    else{
                        $(value).removeAttr('disabled');
                    }
                }
            });
        }
        */
        /*var prevValue = $("#tilePurchaseSelect :selected").val();
        
        select.html('');
        
        $.each(game.Tiles, function(index, value){
           console.log(value.prototype.PurchaseAvailable(player) + ": "/* +value.prototype.PurchaseAvailable());
            if(value.prototype.PurchaseAvailable(player)){
                selected = "";
                if(prevValue === value.prototype.Name){
                    selected = ' selected="selected" ';
                }
                
                select.append('<option value="'+value.prototype.Name+'" '+selected+'>'+value.prototype.DisplayName+'</option>');
                
            }
        });*/

    /*
    };
    
    public.ExtendWidth = function(player){
        if (typeof player === 'undefined'){
            player = game.Player;
        }
        
        if(player.Resources.Cash.GetProperty("currentCount") >= this.widthCost){
            player.Resources.Cash.UpdateCurrentCount(-this.widthCost);
            this.width ++;
            this.heightCost = 100 + Math.round((this.height * 5)*Math.log(this.height) + (this.width * 1.25));
            this.widthCost = 100 + Math.round((this.width * 5)*Math.log(this.width) + (this.height * 1.25));
            for(var i = 0; i < public.height; i++){
                if(!public.layout[public.width - 1]){
                    public.layout[public.width - 1] = [];
                }
                public.layout[public.width - 1][i] = new game.Tiles.BlankTile();
                public.layout[public.width - 1][i].SetPos(public.width -1, i);
            }
            
            game.UpdateGraphics();
        }
    };
    public.ExtendHeight = function(player){
        if (typeof player === 'undefined'){
            player = game.Player;
        }
        
        if(player.Resources.Cash.GetProperty("currentCount") >= this.heightCost){
            player.Resources.Cash.UpdateCurrentCount(-this.heightCost);
            this.height ++;
            this.heightCost = 100 + Math.round((this.height * 5)*Math.log(this.height) + (this.width * 1.25));
            this.widthCost = 100 + Math.round((this.width * 5)*Math.log(this.width) + (this.height * 1.25));
            for(var i = 0; i < public.width; i++){
                if(!public.layout[i]){
                    public.layout[i] = [];
                }
                if(!public.layout[i][public.height - 1]){
                    public.layout[i][public.height - 1] = [];
                }
                public.layout[i][public.height - 1] = new game.Tiles.BlankTile();
                public.layout[i][public.height -1].SetPos(i,public.height -1);
            }
            
            game.UpdateGraphics();
        }
    };
    public.CheckExpansion = function(player)
    {
         if (typeof player === 'undefined'){
            player = Penguin.Game.player;
        }
        
        if(player.Resources.Cash.GetProperty("currentCount") >= this.widthCost){
            $("#width").show();
            $("#widthCost").text('$'+this.widthCost);
        }
        else {
            $("#width").hide();
            $("#widthCost").text('$'+this.widthCost);
        }
        if(player.Resources.Cash.GetProperty("currentCount") >= this.heightCost){
            $("#height").show();
            $("#heightCost").text('$'+this.heightCost);
        }
        else {
            $("#height").hide();
            $("#heightCost").text('$'+this.heightCost);
        }

    };*/
    
    return public;
});

