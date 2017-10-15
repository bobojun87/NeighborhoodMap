var Marker = function(markerItem, id){
  this.title = ko.observable(markerItem.title);
  this.location = ko.observable(markerItem.location);
  this.id = ko.observable(id);
};

var ViewModel = function(){
  var self = this;
  this.markerList = ko.observableArray([]);

  locations.forEach(function(markerItem, id){
    self.markerList.push(new Marker(markerItem, id));
  });
  
  this.showFlag = ko.observable(true);
  this.showButton = function(){
    self.showFlag(!self.showFlag());
  };

  this.inputValue = ko.observable("");

  this.filter = function(id, title, value){
    this.result = title().indexOf(value());

    if(this.result == -1){
      markers[id()].setMap(null);
      return false;
    }else {
      markers[id()].setMap(map);
      return true;
    }
  };
  this.currentId = ko.observable();
  this.clickListings = function(marker) {
    self.currentId = marker.id();
    markerAnimation(markers[self.currentId]);
    populateInfoWindow(markers[self.currentId], largeInfowindow);
  }
};
