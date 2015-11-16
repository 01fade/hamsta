var angular = angular || {};

angular.module('app.services', [])
.factory('ParseService', function() {
  //class name is youtube
  var UserObject = Parse.Object.extend("youtube");
  var userObject = new UserObject();
  var query = new Parse.Query(UserObject);
  var service = {};

  //get method
  service.getData = function(callback) {
    query.find({
      success: function(res) {
          callback(res);
      }, error: function() {

      }
    })

  };

  //update method
  //https://www.parse.com/docs/js_guide#objects-updating
  service.updateHearts = function(_channel, _time, callback) {
    query.equalTo("channel", _channel);
    query.first({
      success: function(object) {
        callback(object);
        for (var i = _time.length - 1; i >= 0; i--) {
          object.add("hearts", _time[i]);
          object.save();
        };
      },
      error: function(error) {
        // alert("Error: " + error.code + " " + error.message);
      }
    });
  };

  service.updateHeartsSum = function(_channel, _sum, callback) {
    query.equalTo("channel", _channel);
    query.first({
      success: function(object) {
        callback(object);
        object.set("heartssum", _sum);
        object.save();
      },
      error: function(error) {
        // alert("Error: " + error.code + " " + error.message);
      }
    });
  };

  return service;
});

//Page titles >>http://stackoverflow.com/questions/12506329/how-to-dynamically-change-header-based-on-angularjs-partial-view