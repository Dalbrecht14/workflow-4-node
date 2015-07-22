"use strict";
"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var is = require("../common/is");
var Block = require("./block");
var WithBody = require("./withBody");
function ForEach() {
  WithBody.call(this);
  this.items = null;
  this.varName = "item";
  this.parallel = false;
  this._bodies = null;
}
util.inherits(ForEach, WithBody);
ForEach.prototype.initializeStructure = function() {
  if (this.parallel) {
    var numCPUs = require("os").cpus().length;
    this._bodies = [];
    if (this.args && this.args.length) {
      for (var i = 0; i < Math.min(process.env.UV_THREADPOOL_SIZE || 100000, numCPUs); i++) {
        var newArgs = [];
        var $__3 = true;
        var $__4 = false;
        var $__5 = undefined;
        try {
          for (var $__1 = void 0,
              $__0 = (this.args)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
            var arg = $__1.value;
            {
              if (arg instanceof Activity) {
                newArgs.push(arg.clone());
              } else {
                newArgs.push(arg);
              }
            }
          }
        } catch ($__6) {
          $__4 = true;
          $__5 = $__6;
        } finally {
          try {
            if (!$__3 && $__0.return != null) {
              $__0.return();
            }
          } finally {
            if ($__4) {
              throw $__5;
            }
          }
        }
        var newBody = new Block();
        newBody.args = newArgs;
        this._bodies.push(newBody);
      }
    }
    this.args = null;
  } else {
    WithBody.prototype.initializeStructure.call(this);
  }
};
ForEach.prototype.run = function(callContext, args) {
  var varName = this.get("varName");
  var items = this.get("items");
  if (!_.isNull(items)) {
    this.set(varName, null);
    callContext.schedule(items, "_itemsGot");
  } else {
    callContext.complete();
  }
};
ForEach.prototype._itemsGot = function(callContext, reason, result) {
  if (reason === Activity.states.complete && !_.isUndefined(result)) {
    this.set("_todo", _.isArray(result) ? result : [result]);
    callContext.activity._doStep.call(this, callContext);
  } else {
    callContext.to(reason, result);
  }
};
ForEach.prototype._doStep = function(callContext, lastResult) {
  var varName = this.get("varName");
  var todo = this.get("_todo");
  if (todo && todo.length) {
    if (this.get("parallel")) {
      var bodies = this.get("_bodies");
      var pack = [];
      var idx = 0;
      while (todo.length && idx < bodies.length) {
        var item = todo[0];
        todo.splice(0, 1);
        var variables = {};
        variables[varName] = item;
        pack.push({
          variables: variables,
          activity: bodies[idx++]
        });
      }
      callContext.schedule(pack, "_bodyFinished");
    } else {
      var item$__7 = todo[0];
      todo.splice(0, 1);
      var variables$__8 = {};
      variables$__8[varName] = item$__7;
      callContext.schedule({
        activity: this.get("_body"),
        variables: variables$__8
      }, "_bodyFinished");
    }
  } else {
    callContext.complete(lastResult);
  }
};
ForEach.prototype._bodyFinished = function(callContext, reason, result) {
  if (reason === Activity.states.complete) {
    callContext.activity._doStep.call(this, callContext, result);
  } else {
    callContext.end(reason, result);
  }
};
module.exports = ForEach;
//# sourceMappingURL=data:application/json;base64,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O0VBQ25DO0FBQUEsQUFDSixDQUFDO0FBRUQsS0FBSyxRQUFRLEVBQUksUUFBTSxDQUFDO0FBQUEiLCJmaWxlIjoiYWN0aXZpdGllcy9mb3JFYWNoLmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IEFjdGl2aXR5ID0gcmVxdWlyZShcIi4vYWN0aXZpdHlcIik7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBCbG9jayA9IHJlcXVpcmUoXCIuL2Jsb2NrXCIpO1xubGV0IFdpdGhCb2R5ID0gcmVxdWlyZShcIi4vd2l0aEJvZHlcIik7XG5cbmZ1bmN0aW9uIEZvckVhY2goKSB7XG4gICAgV2l0aEJvZHkuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuaXRlbXMgPSBudWxsO1xuICAgIHRoaXMudmFyTmFtZSA9IFwiaXRlbVwiO1xuICAgIHRoaXMucGFyYWxsZWwgPSBmYWxzZTtcbiAgICB0aGlzLl9ib2RpZXMgPSBudWxsO1xufVxuXG51dGlsLmluaGVyaXRzKEZvckVhY2gsIFdpdGhCb2R5KTtcblxuRm9yRWFjaC5wcm90b3R5cGUuaW5pdGlhbGl6ZVN0cnVjdHVyZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnBhcmFsbGVsKSB7XG4gICAgICAgIGxldCBudW1DUFVzID0gcmVxdWlyZShcIm9zXCIpLmNwdXMoKS5sZW5ndGg7XG4gICAgICAgIHRoaXMuX2JvZGllcyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5hcmdzICYmIHRoaXMuYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5taW4ocHJvY2Vzcy5lbnYuVVZfVEhSRUFEUE9PTF9TSVpFIHx8IDEwMDAwMCwgbnVtQ1BVcyk7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBuZXdBcmdzID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYXJnIG9mIHRoaXMuYXJncykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJnIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0FyZ3MucHVzaChhcmcuY2xvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBcmdzLnB1c2goYXJnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgbmV3Qm9keSA9IG5ldyBCbG9jaygpO1xuICAgICAgICAgICAgICAgIG5ld0JvZHkuYXJncyA9IG5ld0FyZ3M7XG4gICAgICAgICAgICAgICAgdGhpcy5fYm9kaWVzLnB1c2gobmV3Qm9keSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hcmdzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIFdpdGhCb2R5LnByb3RvdHlwZS5pbml0aWFsaXplU3RydWN0dXJlLmNhbGwodGhpcyk7XG4gICAgfVxufTtcblxuRm9yRWFjaC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBhcmdzKSB7XG4gICAgY29uc3QgdmFyTmFtZSA9IHRoaXMuZ2V0KFwidmFyTmFtZVwiKTtcbiAgICBsZXQgaXRlbXMgPSB0aGlzLmdldChcIml0ZW1zXCIpO1xuICAgIGlmICghXy5pc051bGwoaXRlbXMpKSB7XG4gICAgICAgIHRoaXMuc2V0KHZhck5hbWUsIG51bGwpO1xuICAgICAgICBjYWxsQ29udGV4dC5zY2hlZHVsZShpdGVtcywgXCJfaXRlbXNHb3RcIik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjYWxsQ29udGV4dC5jb21wbGV0ZSgpO1xuICAgIH1cbn07XG5cbkZvckVhY2gucHJvdG90eXBlLl9pdGVtc0dvdCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBpZiAocmVhc29uID09PSBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUgJiYgIV8uaXNVbmRlZmluZWQocmVzdWx0KSkge1xuICAgICAgICB0aGlzLnNldChcIl90b2RvXCIsIF8uaXNBcnJheShyZXN1bHQpID8gcmVzdWx0IDogWyByZXN1bHQgXSk7XG4gICAgICAgIGNhbGxDb250ZXh0LmFjdGl2aXR5Ll9kb1N0ZXAuY2FsbCh0aGlzLCBjYWxsQ29udGV4dCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjYWxsQ29udGV4dC50byhyZWFzb24sIHJlc3VsdCk7XG4gICAgfVxufTtcblxuRm9yRWFjaC5wcm90b3R5cGUuX2RvU3RlcCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgbGFzdFJlc3VsdCkge1xuICAgIGNvbnN0IHZhck5hbWUgPSB0aGlzLmdldChcInZhck5hbWVcIik7XG4gICAgbGV0IHRvZG8gPSB0aGlzLmdldChcIl90b2RvXCIpO1xuICAgIGlmICh0b2RvICYmIHRvZG8ubGVuZ3RoKSB7XG4gICAgICAgIGlmICh0aGlzLmdldChcInBhcmFsbGVsXCIpKSB7XG4gICAgICAgICAgICBsZXQgYm9kaWVzID0gdGhpcy5nZXQoXCJfYm9kaWVzXCIpO1xuICAgICAgICAgICAgbGV0IHBhY2sgPSBbXTtcbiAgICAgICAgICAgIGxldCBpZHggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHRvZG8ubGVuZ3RoICYmIGlkeCA8IGJvZGllcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IHRvZG9bMF07XG4gICAgICAgICAgICAgICAgdG9kby5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgICAgICAgbGV0IHZhcmlhYmxlcyA9IHt9O1xuICAgICAgICAgICAgICAgIHZhcmlhYmxlc1t2YXJOYW1lXSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgcGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzOiB2YXJpYWJsZXMsXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2aXR5OiBib2RpZXNbaWR4KytdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5zY2hlZHVsZShwYWNrLCBcIl9ib2R5RmluaXNoZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHRvZG9bMF07XG4gICAgICAgICAgICB0b2RvLnNwbGljZSgwLCAxKTtcbiAgICAgICAgICAgIGxldCB2YXJpYWJsZXMgPSB7fTtcbiAgICAgICAgICAgIHZhcmlhYmxlc1t2YXJOYW1lXSA9IGl0ZW07XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5zY2hlZHVsZSh7IGFjdGl2aXR5OiB0aGlzLmdldChcIl9ib2R5XCIpLCB2YXJpYWJsZXM6IHZhcmlhYmxlcyB9LCBcIl9ib2R5RmluaXNoZWRcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmNvbXBsZXRlKGxhc3RSZXN1bHQpO1xuICAgIH1cbn07XG5cbkZvckVhY2gucHJvdG90eXBlLl9ib2R5RmluaXNoZWQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgaWYgKHJlYXNvbiA9PT0gQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmFjdGl2aXR5Ll9kb1N0ZXAuY2FsbCh0aGlzLCBjYWxsQ29udGV4dCwgcmVzdWx0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmVuZChyZWFzb24sIHJlc3VsdCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JFYWNoOyJdfQ==