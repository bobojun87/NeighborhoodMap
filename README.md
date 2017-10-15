# NeighborhoodMap
### 项目简介
创建地图，在地图上创建标记，点击标记可以加载街景地图和一些相关信息，通过使用knockoutJS框架使标状态可以动态更新。

## 创建地图

* 调用谷歌地图api初始化地图
```js
// 创建地图，定义坐标初始化定位、缩放比例、样式
map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 40.7413549, lng: -73.9980244},
  zoom: 13,
  styles: styles,
  mapTypeControl: false
});
```
* 创建地图标记和标记属性
```js
for (var i = 0; i < locations.length; i++) {
  // 获取lat和lng值
  var position = locations[i].location;
  var title = locations[i].title;
  var cityStr = locations[i].cityStr;
  // 创建标记marker
  var marker = new google.maps.Marker({
    position: position,
    title: title,
    cityStr: cityStr,
    animation: google.maps.Animation.DROP,
    icon: defaultIcon,
    id: i
  });
  //使marker显示在地图上
  marker.setMap(map);
  // marker传入markers数组
  markers.push(marker);
  // 创建marker的点击事件
  marker.addListener('click', function() {
    //获取marker的动画效果
    markerAnimation(this);
    //获取marker的弹窗信息
    populateInfoWindow(this, largeInfowindow);
  });

  // 所标滑过事件
  marker.addListener('mouseover', function() {
    this.setIcon(highlightedIcon);
  });
  //鼠标移除事件
  marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  });
}
```
* 创建街景视图
```js
function getStreetView(data, status) {
	//保证数据返回状态正常，加载街区视图
	if (status == google.maps.StreetViewStatus.OK) {
	  var nearStreetViewLocation = data.location.latLng;
	  var heading = google.maps.geometry.spherical.computeHeading(
	        nearStreetViewLocation, marker.position); 
	  var panoramaOptions = {
	    position: nearStreetViewLocation,
	    pov: {
	      heading: heading,
	      pitch: 30
	    }
	  };
	  panoElem = document.getElementById('pano');
	  var panorama = new google.maps.StreetViewPanorama(panoElem, panoramaOptions);
	} else {
	  panoElem.innerHTML = 'No Street View Found';
	}
}
```
* 通过wikipedia api 获取数据
```js
//获取wikipedia数据
function getWikipedia(){
//wikipedia api接口地址
var wikipediaUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + 
        marker.cityStr + '&format=json&callback=wikiCallback';
//设置定时器，如果数据加载超时，提醒用户
var wikiRequestTimeout = setTimeout(function(){
    wikiElem = '维基百科数据请求超时，无法加载数据';
    console.log('wikiDataTimeout');
    infowindow.setContent('<h2>' + marker.title + '</h2>' + 
      '<div id="pano"></div>' + 
      '<h3>Wikipedia Links</h3>' + wikiElem);
    //加载街区视图
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
}, 8000);
//利用jsonp异步加载wikipedia api数据
$.ajax({
    url: wikipediaUrl,
    dataType: 'jsonp'
}).done(function(response){
    var wikiData = response[1];
    for(var i=0; i < wikiData.length; i++){
      var data = wikiData[i];
      wikiElem += '<li class="wikipedia">' + 
        '<a href="http://en.wikipedia.org/wiki/' + data + '">' + data + '</a>' + 
        '</li>';
    }
    wikiElem += '</ul>';
    //设置弹出窗口的内容
    infowindow.setContent('<h2>' + marker.title + '</h2>' + 
      '<div id="pano"></div>' + 
      '<h3>Wikipedia Links</h3>' + wikiElem);
    //数据加载成功清除定时器
    clearTimeout(wikiRequestTimeout);
    //加载街区视图
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  });
}  
```

## 创建地图列表

* 创建列表并通过knockoutJS绑定交互
```js
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
    this.result = title().indexOf(value());
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
    //根据ID值调用的marker的加载弹窗内容函数
    populateInfoWindow(markers[self.currentId], largeInfowindow);
  }
};
```
* html部分
```html
<div class="options-box" data-bind="visible: showFlag">
  <span>Search:</span>
  <input type="text"  class="search-input" data-bind="value: inputValue, valueUpdate: 'afterkeydown'">
  <h3>Location List</h3>
  <ul data-bind="foreach: markerList">
    <li data-bind="text: title, visible: $root.filter(id, title, $root.inputValue), click: $root.clickListings">
      
    </li>
  </ul>
</div>
<div class="header" data-bind="style: { marginLeft: showFlag() == true ? '362px' : '0' }">
	<input type="button" class="menu-icon" data-bind="click: showButton" value="显示/隐藏" >
</div>
```