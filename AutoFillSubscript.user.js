// ==UserScript==
// @name        AutoFillSubscript
// @version     2.1
// @author      MathEnthusiast314
// @description Autofills the subscript with Tab
// @grant       none
// @match       https://*.desmos.com/calculator*
// @downloadURL https://github.com/MathEnthusiast314/AutoFillSubscript/raw/main/AutoFillSubscript.user.js
// @updateURL https://github.com/MathEnthusiast314/AutoFillSubscript/raw/main/AutoFillSubscript.user.js
// ==/UserScript==

(function() {
    'use strict';

Number.prototype.mod = function(b) {
    return ((this % b) + b) % b;
}

function start(){
    var Calc=window.Calc
    function computeContext() {
        // Emulate what happens in the web worker
        const Context = require("core/math/context").Context;
        const context = new Context();
        const changeSet = {
            isCompleteState: true,
            statements: {},
        };
        for (let stmt of Calc.controller.getAllItemModels()) {
            if (stmt.type !== "expression" && stmt.type !== "table") continue;
            changeSet.statements[stmt.id] = stmt;
        }
        const ticker = Calc.controller.listModel.ticker.cachedParsableState;
        if (ticker.handlerLatex) {
            changeSet.statements[ticker] = ticker;
        }
        context.processChangeSet(changeSet);
        context.updateAnalysis();
        return context;
    }
    var save=[0,''];
    function AutoFill(sub,snippedLatex,key){
        var c00=computeContext()
        if (Calc.isAnyExpressionSelected){
            var search=snippedLatex.match(`[a-zA-Z0-9]_\\{${sub}\\}$`)
            if (search){
                search=search[0].replace(/[{}]/g,'');
                var extension=Object.keys(c00.frame).filter(x=>x.indexOf(search)==0);
                if (extension[save[0].mod(extension.length)]){
                    var result=extension[save[0].mod(extension.length)].replace(search,'');
                    save[1]=result;
                    return(result);
                }
            }
        }
    }
    document.addEventListener('keydown', async function(event) {
        if ((event.keyCode==9||(event.keyCode==38&&event.altKey)||(event.keyCode==40&&event.altKey))&&Calc.focusedMathQuill){
            //
            if ((event.keyCode==38||event.keyCode==40)){
                for(var ij=0; ij<save[1].length; ij++){
                    Calc.focusedMathQuill.simulateKeypress('Backspace')
                }
                Calc.focusedMathQuill.simulateKeypress('Right');
            }
            //
            (event.keyCode==9) && (save[0]=0);
            var message=((((Calc.focusedMathQuill||{}).mq||{}).__controller||{}).aria||{}).msg;
            var reg=(message+[]).match(/after Subscript, (.*) \, Baseline/)
            var sel=Calc.focusedMathQuill.selection();
            if (reg&&sel){
                var auto=AutoFill(reg[1].replace(/[ \"]/g,''),sel.latex.substring(0,sel.startIndex),event.keyCode);
                Calc.focusedMathQuill.typedText('_');
                auto&&Calc.focusedMathQuill.typedText(auto);
            }
            //
            (event.keyCode==38)&&save[0]++;
            (event.keyCode==40)&&save[0]--;
        }else{
            save=[0,''];
        }
    });
    document.addEventListener('mousedown', async function(event2) {
        save=[0,''];
    })
}
function tryStart(){
	  if (window.Calc !== undefined) {
	    	start();
	  } else {
	    	setTimeout(tryStart, 50)
	  }
}
tryStart();
})();
