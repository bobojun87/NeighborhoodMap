//创建列表中的marker对象
var Marker = function(markerItem, id){
  this.title = ko.observable(markerItem.title);
  this.location = ko.observable(markerItem.location);
  this.id = ko.observable(id);
};

var ViewModel = function(){
  var self = this;
  //marker列表数组
  this.markerList = ko.observableArray([]);
  //遍历locations数据，初始化数据并传入markerList数组
  locations.forEach(function(markerItem, id){
    self.markerList.push(new Marker(markerItem, id));
  });
  //左侧列表是否显示的布尔值
  this.showFlag = ko.observable(true);
  //button按钮点击，切换showFlag的布尔值
  this.showButton = function(){
    self.showFlag(!self.showFlag());
  };
  //输入框的值
  this.inputValue = ko.observable("");
  //根据输入框的值，判断是否显示
  this.filter = function(id, title, value){
    //判断列表名字中是否包含输入的值
    //都转化为小写匹配，使得在页面上同时匹配大小写
    var title = title().toLowerCase();
    var val = value().toLowerCase();
    this.result = title.indexOf(val);
    // 值为-1时表示没有匹配的字符串
    if(this.result == -1){
      //根据列表的ID值判断并更新地图中的marker是否显示
      markers[id()].setMap(null);
      return false;
    }else {
      markers[id()].setMap(map);
      return true;
    }
  };
  //列表中当前选中的marker的ID
  this.currentId = ko.observable();
  this.clickListings = function(marker) {
    self.currentId = marker.id();
    //根据ID值调用的marker的加载动画效果函数
    markerAnimation(markers[self.currentId]);
    ////把点击的marker设置为地图中心点
    setCenterMarker(markers[self.currentId]);
    //根据ID值调用的marker的加载弹窗内容函数
    populateInfoWindow(markers[self.currentId], largeInfowindow);
  }
};
