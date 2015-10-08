(function(){

  angular
       .module('notification')
       .controller('NotificationController', ['$log', '$q', '$scope', NotificationController]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function NotificationController( $log, $q, $scope) {
      var self = this;
      self.message     = 'Hello from Web!';
      self.receivedMessages = [];

      $log.log("INIT");
      var message = new proton.Message();
      var messenger = new proton.Messenger();

      self.send = function () {

          $log.log("SEND");

          var address = "amqp://192.168.88.33:5673/amq.fanout";
          var subject = "TRANSCRIPT";
          var body = self.message;

          message.setAddress(address);
          message.setSubject(subject);
          message.setContentType("text/plain")
          message.body = body;

          messenger.put(message);
          messenger.send();

      }

      function receive() {
          messenger.setIncomingWindow(1024);

          messenger.on('error', function(error) {console.log(error);});
          messenger.on('work', pumpData);
          messenger.recv(); // Receive as many messages as messenger can buffer.
          messenger.start();

          messenger.subscribe("amqp://192.168.88.33:5673/amq.fanout");
      }

     function pumpData() {
          while (messenger.incoming()) {
              var t = messenger.get(message);

              $log.log("Address: " + message.getAddress());
              $log.log("Subject: " + message.getSubject());
              $log.log("Id: " + message.getID());

              // body is the body as a native JavaScript Object, useful for most real cases.
              //console.log("Content: " + message.body);

              // data is the body as a proton.Data Object, used in this case because
              // format() returns exactly the same representation as recv.c
              $log.log("Content: " + message.data.format());
              self.receivedMessages.push({ id: self.receivedMessages.length, message: message.body});
              $scope.$apply();

              messenger.accept(t);
          }
      };

      receive();

  }

})();
