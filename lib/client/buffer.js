var Util, DOM;

(function(Util, DOM) {
    'use strict';
    
    DOM.Buffer  = new BufferProto();
    
    function BufferProto() {
        var Storage = DOM.Storage,
            Dialog  = DOM.Dialog,
            Files   = DOM.Files,
            Info    = DOM.CurrentInfo,
            
            CLASS   = 'cut-file',
            
            COPY    = 'copy',
            CUT     = 'cut',
            
            Buffer  = {
                cut     : callIfEnabled.bind(null, cut),
                copy    : callIfEnabled.bind(null, copy),
                clear   : callIfEnabled.bind(null, clear),
                paste   : callIfEnabled.bind(null, paste)
            };
        
        function getNames() {
            var name    = Info.name,
                names   = DOM.getSelectedNames(),
                n       = names.length;
            
            return n ? names : [name];
        }
        
        function addCutClass() {
            var files   = DOM.getSelectedFiles(),
                n       = files.length;
            
            if (!n)
                files   = [Info.element];
            
            files.forEach(function(element) {
                DOM.addClass(element, CLASS);
            });
        }
        
        function rmCutClass() {
            var files   = DOM.getSelectedFiles(),
                n       = files.length;
            
            if (!n)
                files   = [Info.element];
            
            files.forEach(function(element) {
                DOM.removeClass(element, CLASS);
            });
        }
        
        function isEnabled(callback) {
            Files.get('config', function(error, config) {
                if (error)
                    Dialog.alert(error);
                else
                    callback(config.buffer);
            });
        }
        
        function callIfEnabled(callback) {
             isEnabled(function(is) {
                if (is)
                    callback();
            });
        }
        
        function copy() {
            var Storage = DOM.Storage,
                names   = getNames(),
                from    = Info.dirPath;
            
            Storage.remove(CUT)
                .set(COPY, {
                    from : from,
                    names: names
                });
        }
        
        function cut() {
            var Storage = DOM.Storage,
                names   = getNames(),
                from    = Info.dirPath;
                
            addCutClass();
            
            Storage.remove(COPY)
                .set(CUT, {
                    from : from,
                    names: names
                });
        }
        
        function clear() {
             Storage.remove(COPY)
                    .remove(CUT);
            
            rmCutClass();
        }
        
        function paste() {
            var copy    = Storage.get.bind(Storage, COPY),
                cut     = Storage.get.bind(Storage, CUT);
            
            Util.exec.parallel([copy, cut], function(error, cp, ct) {
                var data    = {},
                    msg     = 'Path is same!',
                    path    = Info.dirPath;
                
                if (!error && !cp && !ct)
                    error   = 'Buffer is empty!';
                    
                if (error) {
                    DOM.Dialog.alert(error);
                } else if (cp) {
                    data        = Util.parseJSON(cp);
                    data.to     = path;
                    
                    if (data.from === path)
                        Dialog.alert(msg);
                    else
                        DOM.copyFiles(data);
                
                } else if (ct) {
                    data        = Util.parseJSON(ct);
                    data.to     = path;
                    
                    if (data.from === path)
                        Dialog.alert(msg);
                    else
                        DOM.moveFiles(data);
                }
                
                clear();
            });
        }
        
        return Buffer;
    }
})(Util, DOM);