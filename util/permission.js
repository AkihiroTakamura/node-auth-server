// find scope from scope string(expect comma separated)
exports.hasScope = function(req, target) {
  if (!req || !target) return false;
  if (!req.info || !req.info.scope) return false;

  var scopeArray = req.info.scope.split(',');

  for (var i = 0; i < scopeArray.length; i++) {
    if (scopeArray[i] == target) return true;
  }
  return false;
}

