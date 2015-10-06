/**
 * AngularJS module to process a form.
 */
angular.module('myApp', ['ajoslin.promise-tracker','720kb.datepicker'])
  .controller('help', function ($scope, $http, $log, promiseTracker, $timeout) {
    $scope.subjectListOptions = {
      'Chef_inclusive': 'I want a Private Chef inclusive',
      'Bed+Breakfast': 'I want only Breakfast to be inclusive',
      'special': 'I am interested in customized and bespoke arrangements'
    };
    // handle the show/hide of message input
    $scope.subjectList = 'room_only';

    // Inititate the promise tracker to track form submissions.
    $scope.progress = promiseTracker();

    // Form submit handler.
    $scope.submit = function(form) {
      // Trigger validation flag.
      $scope.submitted = true;

      // If form is invalid, return and let AngularJS show validation errors.
      if (form.$invalid) {
        return;
      }

      // function to make a ISO timestamp string
      function displayTime() {
          var str = "";
          var date = new Date();
          var str = date.toISOString();
          return str;
      };

      // function to check if comments has a value, if not set a value
      function comments() {
        if ($scope.comments === undefined) {
          var str ='null';
          return str;
        } else {
          return $scope.comments;
        }
      };

      // Default values for the request.
      var formData = {
          'timestamp' : displayTime(),
          'name' : $scope.name,
          'email' : $scope.email,
          'subjectList' : $scope.subjectList,
          'pax' : $scope.pax,
          'in' : $scope.in,
          'out' : $scope.out,
          'comments' : comments()
      };

      // Perform request.      
      var $promise = $http.post('https://sheetsu.com/apis/11e7a739', formData)
        .success(function(data, status, headers) {
          if (data.status == '201') {
            $scope.name = null;
            $scope.email = null;
            $scope.subjectList = null;
            $scope.pax = null;
            $scope.in = null;
            $scope.out = null;
            $scope.comments = null;
            $scope.messages = 'Your form has been sent!';
            $scope.submitted = false;
          } else {
            $scope.messages = 'Oops, we received your request, but there was an error processing it.';
            $log.error(data);
          }
        })
        .error(function(data, status, headers, formData) {
          $scope.progress = data;
          $scope.messages = 'There was a network error. Try again later.';
          $log.error(data);
        })
        .finally(function() {
          // Hide status messages after three seconds.
          $timeout(function() {
            $scope.messages = null;
          }, 3000);
        });

      // Track the request and show its progress to the user.
      $scope.progress.addPromise($promise);
    };
  })
  // Remember that for a correct form post, the Content-Type header must be changed.
  // To do this globally for all POST requests, this code can be used:
  // from http://stackoverflow.com/questions/11442632/how-can-i-post-data-as-form-data-instead-of-a-request-payload
  .config(['$httpProvider', function ($httpProvider) {
    // Intercept POST requests, convert to standard form encoding
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    $httpProvider.defaults.transformRequest.unshift(function (data, headersGetter) {
      var key, result = [];

      if (typeof data === "string")
        return data;

      for (key in data) {
        if (data.hasOwnProperty(key))
          result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
      }
      return result.join("&");
    });
  }]);