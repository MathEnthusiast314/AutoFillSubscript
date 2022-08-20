// ==UserScript==
// @name        AutoFillSubscript
// @version     1.0
// @author      MathEnthusiast314
// @description Autofills the subscript with Tab
// @grant       none
// @match       https://*.desmos.com/calculator*
// ==/UserScript==

(function() {
    'use strict';

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
    function AutoFill(sub,snippedLatex){
        var c00=computeContext()
        if (Calc.isAnyExpressionSelected){
            var search=snippedLatex.match(`[a-zA-Z0-9]_\\{${sub}\\}$`)
            if (search){
                search=search[0].replace(/[{}]/g,'');
                var extension=Object.keys(c00.frame).filter(x=>x.indexOf(search)==0);
                if (extension[0]){
                    return(extension[0].replace(search,''))
                }
            }
        }
    }
    document.addEventListener('keydown', function(event) {
        if (event.keyCode==9&&Calc.focusedMathQuill){
            var message=((((Calc.focusedMathQuill||{}).mq||{}).__controller||{}).aria||{}).msg
            var reg=(message+[]).match(/after Subscript, (.*) \, Baseline/)
            var sel=Calc.focusedMathQuill.selection()
            if (reg&&sel){
                var auto=AutoFill(reg[1].replace(/[ \"]/g,''),sel.latex.substring(0,sel.startIndex));
                auto?Calc.focusedMathQuill.typedText('_'+auto):''
            }
        }
    });
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
