// global texts
var attr = {
  osm : 'Map data &copy; <a href="https://openstreetmap.org/">OpenStreetMap</a> contributors - <a href="http://opendatacommons.org/licenses/odbl/">ODbL</a>',
  osm_tiles : 'Tiles &copy; OSM - <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>',
  search : 'Search by OSM - <a href="http://wiki.openstreetmap.org/wiki/Nominatim">Nominatim</a>',
  mapbox : 'Tiles &copy; <a href="http://mapbox.com/about/maps/">MapBox</a>',
  greenmap : 'Green Map Icons used by permission &copy; <a href="http://www.greenmap.org">Green Map System 2015</a>',
  overpass : 'POI via <a href="http://www.overpass-api.de/">Overpass API</a>'
}
var about = {
    overpass : '<p>Items are loaded via <a href="https://wiki.openstreetmap.org/wiki/Overpass_API">Overpass API</a>, it may take some minutes for newly added items to appear.</p>',
    osm_edit : '<p>You can improve this map with the “Edit” Button in the top right corner!</p>',
    export_opendata : '<p>All data displayed is Open Data, you can get it with the “Export Data” link in the bottom right corner.</p>'
}


/* this part must be in global namespace */
// fetch taxonomy, containing all translations, and implicit affiliations
// taken from Wikipedia:JSON
var taxonomy, turbolink;
var url = "taxonomy.json";
var http_request = new XMLHttpRequest();
http_request.open("GET", url, true);
http_request.onreadystatechange = function () {
      var done = 4, ok = 200;
      if (http_request.readyState === done && http_request.status === ok) {
          taxonomy = JSON.parse(http_request.responseText);

          // as soon as taxonomy is here, add map key derived from it
          if(taxonomy) {
              for(var osmkey_counter = 0; osmkey_counter < icon_tags.length; osmkey_counter++) {
                  var osmkey = icon_tags[osmkey_counter];

                  var taxonomy_block = taxonomy[osmkey];
                  if (!taxonomy_block) {
                      console.log("no entry in taxonomy for " + osmkey);
                      return;
                  }

                  var entry_array = taxonomy_block['items'];
                  for (var i = 0; i < entry_array.length; i++ ) {
                      var item = entry_array[i];
                      for ( var osmvalue_counter = 0; osmvalue_counter < item['osm:values'].length; osmvalue_counter++ ) {
                          var li = $("<li>");
                          var new_id = item['osm:key'] + item['osm:values'][osmvalue_counter];
                          li.attr("onClick", "toggleInfoBox('" + new_id + "');");
                          li.append('<img src="assets/transformap/pngs/identities/24/' + item['osm:key'] + '=' + item['osm:values'][osmvalue_counter] + '.png" /> '
                                  + item['label']['en']
                                  + '<div class=InfoBox ' 
                                      + 'id="' + new_id + '">'
                                      + item['description']['en'] + '</div>');
                          $('#mapkey').append(li);
                      }
                  }
              }
          }
          else
              console.log("taxonomy not here");

      }
  };
http_request.send(null);

function toggleLayer(key,value) {
  alert(key + "=" + value);
}

function toggleSideBox(id) {
    var clicked_element = document.getElementById(id);
    var clicked_on_open_item = ( clicked_element.getAttribute("class").indexOf("shown") >= 0 ) ? 1 : 0; 

    //close all
    var sidebar = document.getElementById("sidebar");
    var childs = sidebar.childNodes;
    for ( var i=0; i < childs.length; i++) {
        var item_child = childs[i];
        if ( item_child.hasAttribute("class") ) {
            if( item_child.getAttribute("class").indexOf("box") >= 0 ) {
                item_child.setAttribute("class", "box hidden");
            }
        }
    }

    if( ! clicked_on_open_item)
        clicked_element.setAttribute("class", "box shown");
}

function toggleInfoBox(id) {
    var element = document.getElementById(id);
    element.style.display = ( element.style.display == "block" ) ? "none" : "block";
}
function toggleSideBar() {
    var sidebar = document.getElementById("sidebar");
    var sidebar_toggle = document.getElementById("sidebar_toggle");
    var content = document.getElementById("content");
    if( sidebar_toggle.hasAttribute("class") ) { // is hidden
        sidebar_toggle.removeAttribute("class");
        sidebar.removeAttribute("class");
        content.removeAttribute("class");
        /* disabled meanwhile because n steps overpass queries get fired
        for (var t=100; t <= 800; t = t+100) {
            setTimeout(reDrawMap, t);
        }*/
        setTimeout(reDrawMap, 810);
    } else {
        sidebar_toggle.setAttribute("class", "hidden");
        sidebar.setAttribute("class", "hidden");
        content.setAttribute("class", "full");
        /*
        for (var t=100; t <= 800; t = t+100) {
            setTimeout(reDrawMap, t);
        }*/
        setTimeout(reDrawMap, 810);
    }

}
function reDrawMap() {
        map.invalidateSize(true);
}

/* simulates css :hover on elements not capable of, e.g. z-index 1 */
function hoverTitle(id) {
}


function initMap(defaultlayer,base_maps,overlay_maps) {
  var overriddenId = new L.Control.EditInOSM.Editors.Id({ url: "http://editor.transformap.co/#background=Bing&map=" }),
  map = new L.Map('map', {
    center: new L.LatLng(47.07, 15.43),
    zoom: 13,
    layers: defaultlayer,
    editInOSMControlOptions: {
        position: 'topright',
        zoomThreshold: 18,
        widget: 'multiButton',
        editors: [overriddenId] 
        },
  });

  var ctrl = new L.Control.Layers(base_maps,overlay_maps)
  map.addControl(ctrl);

  L.LatLngBounds.prototype.toOverpassBBoxString = function (){
    var a = this._southWest,
        b = this._northEast;
    return [a.lat, a.lng, b.lat, b.lng].join(",");
  }

  var path_style = L.Path.prototype._updateStyle;
  L.Path.prototype._updateStyle = function () {
    path_style.apply(this);
    for (k in this.options.svg) {
      this._path.setAttribute(k, this.options.svg[k]);
    }
  }

  // handmade dynamic LayerSwitcher
  if (window.switch_layertags ) {
    $('body').append('<ul id="layerswitcher"></ul>');
    var layerswitcher =  document.getElementById("layerswitcher");
    for (var i = 0; i < switch_layertags.length; i++) {
      var current_item = switch_layertags[i]; // { key : value }
      var current_value,current_key;
      for (key in current_item) { // misusing 1-for-"loop" for extract key/value
        current_key = key;
        current_value = current_item[key];
      }
      var li = document.createElement("li");
      var textnode = document.createTextNode(current_key + " = " + current_value );
      li.appendChild( textnode);
      var functiontext = "toggleLayer('" + current_key + "','" + current_value + "');"
      li.setAttribute('onClick',functiontext);
      layerswitcher.appendChild( li );
      }
    layerswitcher.style.display = "none";
  }
  //$('body').append('<div id="date_field">1.1.1970</div>');

  $('body').append('<div id="sidebar"><h1>' + document.title + '</h1></div>');
  $('body').append('<div id="sidebar_toggle" onClick="toggleSideBar()">»</div>');

  // switching to other maps
  $('#sidebar').append('<div id="sidebox-maps" class="box hidden"></div>');
  $('#sidebox-maps').append('<h2 onClick="toggleSideBox(\'sidebox-maps\');">Explore other Maps</h2>');
  $('#sidebox-maps').append('<ul id="mapswitcher" class="boxcontent"></ul>');
  var mapswitcher = document.getElementById("mapswitcher");
  var different_maps = [ 
    { url : "identities.html" ,
      name : "TransforMap of Identities",
      image: "assets/transformap/pngs/" + iconsize + "/political_identity.png"
    } ,
 /*   { url : "transformap.html" ,
      name : "Needs-based TransforMap" } , */
    { url : "organic.html" ,
      name : "Organic TransforMap",
      image : "assets/transformap/pngs/pois/" + iconsize + "/shop=supermarket.png"
    } ,
    { url : "regional.html" ,
      name : "Regional TransforMap",
      image : "assets/transformap/pngs/pois/" + iconsize + "/shop=convenience.png"
    } ,
    { url : "fairtrade.html" ,
      name : "Fairtrade TransforMap",
      image : "assets/transformap/pngs/pois/" + iconsize + "/shop=fairtrade.png"
    } ,
    { url : "secondhand.html" ,
      name : "Second Hand TransforMap",
      image : "assets/transformap/pngs/pois/" + iconsize + "/shop=second_hand.png"
    } ,
    { url : "greenmap.html" ,
      name : "Green TransforMap",
      image : "assets/greenmap/png/" + iconsize  + "/Park-_Recreation_Area.png"
    } ,
    ];
  for (var i = 0; i < different_maps.length; i++) {
    var current_item = different_maps[i]; 
    var li = document.createElement("li");
    
    var alink = document.createElement("a");
    var linktext = document.createTextNode(current_item["name"]);
    var linkimage = document.createElement("img");
    linkimage.setAttribute('src',current_item["image"]);

    alink.appendChild(linkimage);
    alink.appendChild(linktext);
    alink.setAttribute('href',current_item["url"]);
    if(current_item["name"] == document.title) {
      li.setAttribute('class',"current");
    }
    li.appendChild(alink);

    mapswitcher.appendChild( li );
  }

  // Map Key
  $('#sidebar').append('<div id="sidebox-mapkey" class="box hidden"></div>');
  $('#sidebox-mapkey').append('<h2 onClick="toggleSideBox(\'sidebox-mapkey\');">Map Key</h2>');
  $('#sidebox-mapkey').append('<ul id="mapkey" class="boxcontent"></ul>');

  // extra mapkey for maps not deriving from taxonomy.json
  if(window.mapkey) {
      $('#mapkey').append(window.mapkey);
  }
  // map key derived from taxonomy gets added when taxonomy.json is loaded

        
  // About
  $('#sidebar').append('<div id="sidebox-about" class="box hidden"></div>');
  $('#sidebox-about').append('<h2 onClick="toggleSideBox(\'sidebox-about\');">About this Map</h2>');
  $('#sidebox-about').append('<div id="about" class="boxcontent"></div>');
  if(window.about_text)
      $('#about').append(window.about_text);
    
  $('#sidebar').append('<div id="timestamp"></div>');
  $('#timestamp').append('<div id="tall" title="Local copy"></div>'); // alert() is only for dev, works only in FF if you SELECT TEXT.
  $('#timestamp').append('<div id="tnode" onmouseover="alert(\'' + overpass_servers[0].replace(/^http:\/\//,"") + '\');"></div>');
  $('#timestamp').append('<div id="tway"  onmouseover="alert(\'' + overpass_servers[1].replace(/^http:\/\//,"") + '\');"></div>');
  $('#timestamp').append('<div id="trel"  onmouseover="alert(\'' + overpass_servers[2].replace(/^http:\/\//,"") + '\');"></div>');


  map.on('moveend', updateLinks);

  return map;
}

function addSearch() {
  map.addControl( new L.Control.Search({
    url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
    jsonpParam: 'json_callback',
    propertyName: 'display_name',
    propertyLoc: ['lat','lon'],
    circleLocation: false,
    markerLocation: false,
    autoType: false,
    autoCollapse: false,
    minLength: 2,
    zoom:16
  }) );

}
function addLocate() {
lc = L.control.locate({
        position: 'topleft',
        showPopup: false,
        strings: {
                title: "Jump to my location!"
            }
      }
      ).addTo(map);
}

var marker_table = {};
var old_zoom = 20;

var pid_counter_node = 0;
var pid_counter_way = 0;
var pid_counter_rel = 0;

var mutex_node = 0;
var mutex_way = 0;
var mutex_rel = 0;

var on_start_loaded = 0;

var iconsize = 24;

function loadPoi() {
  var notificationbar =  document.getElementById("notificationbar");
  if (map.getZoom() < 12 ) {
    notificationbar.style.display = "block";
    if(on_start_loaded) {
      var json_date = new Date(pois_lz.osm3s.timestamp_osm_base);
      $('#tall').html("Lowzoom data: " + json_date.toLocaleString());
      $('#tnode').css("display", "hidden");
      $('#tway').css("display", "hidden");
      $('#trel').css("display", "hidden");
      return;
    }

    console.log(pois_lz);
    if(pois_lz) { 
      console.log("adding lz POIs");

      console.log("loadPOI: before JSON call node");
        mutex_node++;
        var loading_indicator_node = document.getElementById("loading_node");
        loading_indicator_node.style.display = "block";
        loading_indicator_node.title = mutex_node;
      handleNodes(pois_lz); 

      console.log("loadPOI: before JSON call way");
        mutex_way++;
        var loading_indicator_way = document.getElementById("loading_way");
        loading_indicator_way.style.display = "block";
        loading_indicator_way.title = mutex_way;
      handleWays(pois_lz); 

      console.log("loadPOI LZ: before JSON call rel");
        mutex_rel++;
        var loading_indicator_rel = document.getElementById("loading_rel");
        loading_indicator_rel.style.display = "block";
        loading_indicator_rel.title = mutex_rel;
      handleRelations(pois_lz); 

      var json_date = new Date(pois_lz.osm3s.timestamp_osm_base);
      $('#tall').html("Lowzoom data: " + json_date.toLocaleString());
      $('#tnode').css("display", "hidden");
      $('#tway').css("display", "hidden");
      $('#trel').css("display", "hidden");

      on_start_loaded = 1;
    }

    return;
  }
  notificationbar.style.display = "none";

  // if Graz (start position, gets called once first) do nothing
  var centre = map.getCenter();
  if (centre.lat == 47.07 && centre.lng == 15.43) {
    var splitstr = window.location.href.split('#');
    if (splitstr[1]) {
      var coords_href = splitstr[1].split('/');
      if ( coords_href[1] == 47.07 && coords_href[2] == 15.43 )
        console.log("look, we are in Graz");
      else
        return;
    }
  }

  var current_zoom = map.getZoom();
  console.log("loadPOI called, z" + current_zoom);
  if(current_zoom > old_zoom && current_zoom != 12) {
    console.log("zooming in, POI already loaded, nothing to to");
    old_zoom = current_zoom;
    return;
  }
  old_zoom = current_zoom;

  function url_ify(link,linktext) {
    var teststr_email=/@/;
    var teststr_phone=/^[0-9-+]*$/;
    if (teststr_email.test(link)) {
      return '<a href="mailto:' + link + '">' + linktext + '</a>';
    } else if (teststr_phone.test(link)) {
      return '<a href="tel:' + link + '">' + linktext + '</a>';
    } else {
      var teststr=/^http/; //http[s] is implicit here
      if ( ! teststr.test(link) )
        link = "http://" + link;
      return  '<a href="' + link + '">' + linktext + '</a>';
    }

  }

  function fillPopup(tags,type,id,lat,lon) {

    var tags_to_ignore = [ "name" , "ref", "needs", "addr:street", "addr:housenumber", "addr:postcode", "addr:city", "addr:suburb", "addr:country","website","url","contact:website","contact:url","email","contact:email","phone","contact:phone","created_by","area","layer","room","indoor" ];

    var r = $('<table>');

    r.append($('<tr>')
            .append($('<td>').append('<a href="https://www.openstreetmap.org/' + type + "/" + id + '" title="Link to ' + type + ' ' + id + ' on OpenStreetMap" target=_blank><img src="assets/20px-Mf_' + type + '.svg.png" />' + type.substring(0,1) + id + '</a>'))
            .append($('<td>').append('<a href="http://editor.transformap.co/#background=Bing&id=' + type.substring(0,1) + id + '&map=19/' + lon + '/' + lat + '" title="Edit this object with iD for TransforMap" target=_blank>Edit</a>'))
/*            .append($('<td>').append('<a href="http://editor.transformap.co/#background=Bing&id=' + type.substring(0,1) + id + '&map=19/' + centre.lng + '/' + centre.lat + '" title="Edit this object with iD for TransforMap">Edit</a>')) */
            );

    if(tags["addr:street"] || tags["addr:housenumber"] || tags["addr:postcode"] || tags["addr:city"] || tags["addr:suburb"] || tags["addr:country"]
            || tags["website"] || tags["url"] || tags["contact:website"] || tags["contact:url"] || tags["email"] || tags["contact:email"] || tags["phone"] || tags["contact:phone"] ) {
        r.append($('<tr>').append($('<td>').append(
              (tags["addr:street"] ? (tags["addr:street"] + "&nbsp;") : "" ) +
              (tags["addr:housenumber"] ? tags["addr:housenumber"] : "" ) + 
              ( (tags["addr:housenumber"] || tags["addr:street"]) ? ",<br>" : "" ) +
              (tags["addr:postcode"] ? (tags["addr:postcode"] + " ") : "" ) +
              (tags["addr:city"] ? tags["addr:city"] : "" ) + 
              (tags["addr:suburb"] ? "-" + tags["addr:suburb"] : "") +
              (tags["addr:country"] ? "<br>" + tags["addr:country"] : "")
              ))
        .append($('<td>').append(
            (tags["website"] ? (url_ify(tags["website"],"website") + "<br>") : "" ) +
            (tags["url"] ? (url_ify(tags["url"],"website") + "<br>") : "" ) +
            (tags["contact:website"] ? (url_ify(tags["contact:website"],"website") + "<br>") : "" ) +
            (tags["contact:url"] ? (url_ify(tags["contact:url"],"website") + "<br>") : "" ) +

            (tags["email"] ? (url_ify(tags["email"],"email") + "<br>") : "" )+
            (tags["contact:email"] ? (url_ify(tags["contact:email"],"email") + "<br>") : "" ) +

            (tags["phone"] ? (url_ify(tags["phone"],"Tel: " + tags["phone"]) + "<br>") : "" ) +
            (tags["contact:phone"] ? (url_ify(tags["contact:phone"],"Tel: " + tags["contact:phone"]) + "<br>") : "" )
          )));
    }

    for (key in tags) {
      if ( tags_to_ignore.indexOf(key) >= 0) {
        continue;
      } else if ( key == 'website' || key == 'url' || key == 'contact:website' ||  key == 'contact:url') { //TODO: , facebook, …
        var value = tags[key];
        var teststr=/^http/; //http[s] is implicit here
        if ( ! teststr.test(value) )
          value = "http://" + value;
          
        var htlink = '<a href="' + value + '">' + value + '</a>';
        r.append($('<tr>').append($('<th>').text(key)).append($('<td>').append(htlink)));
      } else if (key == 'wikipedia') { // wikipedia - TODO key="wikipedia:de"
        var value = tags[key];
        var begin = "";
        var teststr=/^http/; //http[s] is implicit here
        if ( ! teststr.test(value) )
          begin = "https://wikipedia.org/wiki/";

        var htlink = '<a href="' + begin + value + '">' + value + '</a>';
        r.append($('<tr>').append($('<th>').text(key)).append($('<td>').append(htlink)));
      } else if (key == 'contact:email' || key == 'email') {
        var value = tags[key];
        var teststr=/^mailto:/;
        if ( ! teststr.test(value) )
          value = "mailto:" + value;
        var htlink = '<a href="' + value + '">' + tags[key] + '</a>';
        r.append($('<tr>').append($('<th>').text(key)).append($('<td>').append(htlink)));

      } else {
        var keytext = key;
        var valuetext = tags[key];

        /* display label:* instead of key */ 
        /*
        var found = 0; // use for break outer loops

        for ( groupname in taxonomy ) { // e.g. "fulfils_needs" : {}=group 
          group = taxonomy[groupname];

          var count_items = group["items"].length;
          for (var i = 0; i < count_items; i++) { // loop over each item in group["items"]
            item = group["items"][i];
            if(item["osm:key"] == keytext) {
              keytext = "<em>" + item.label["en"] + "</em>"; //<em> for displaying a translated value
              found = 1;
              break;
            }
          } 
          if(found == 1)
            break; // for ( groupname in taxonomy ) 
        } 
        */

        r.append($('<tr>').addClass('tag').append($('<th>').append(keytext)).append($('<td>').text(valuetext)));
      }

    } // end for (key in tags)

    var s = $('<div>');
    s.append(r);
    var retval = $('<div>').append(s);
    retval.prepend($('<h1>').text(tags["name"]));
    return retval.html();
  }


  function bindPopupOnData(data) {
    // first: check if no item with this osm-id exists...
    var hashtable_key = data.type + data.id; // e.g. "node1546484546"
    if(marker_table[hashtable_key] == 1) //object already there
      return;
    marker_table[hashtable_key] = 1;

    if(!data.tags) {
      console.log("no tags on:");
      console.log(data);
      return;
    }
    if(data.tags.disused == "yes" || data.tags.opening_hours == "off" || data.tags["disused:shop"] || data.tags["disused:amenity"]) {
      console.log("object disused:" + data.type + data.id);
      return;
    }


    // set icon dependent on tags
    var icon_tag = ""; //OSM key for choosing icon
    for (var i = 0; i < icon_tags.length; i++) {
      var key = icon_tags[i];
      if(data.tags[key]) {
        icon_tag = key;
        break;
      }
    }

    var icon_url = "";
    if(!icon_tag) {
      icon_url = "assets/transformap/pngs/" + icon_foldername + "/" + iconsize + "/unknown.png";
    } else {

      if (data.tags[icon_tag].indexOf(";") >= 0) // more than one item, take generic icon
        icon_url = "assets/transformap/pngs/" + icon_foldername + "/" + iconsize + "/generic.png";
      else
        icon_url = "assets/transformap/pngs/" + icon_foldername + "/" + iconsize + "/" + icon_tag + "=" + data.tags[icon_tag] + ".png";
    }

    var icon_class = (window.class_selector_key && data.tags[window.class_selector_key["key"]]) ? window.class_selector_key["key"] : "color_undef";

    var needs_icon = L.icon({
      iconUrl: icon_url,
      iconSize: new L.Point(iconsize, iconsize),
      iconAnchor: new L.Point(iconsize / 2, iconsize / 2),
      popupAnchor: new L.Point(0, - iconsize / 2),
      className: "v-" + data.tags[icon_class] + " k-" + icon_class,
    });

    var lmarker = L.marker([data.lat, data.lon], {
      icon: needs_icon,
      title: data.tags.name
    });
    lmarker.bindPopup(fillPopup(data.tags,data.type,data.id,data.lat,data.lon));
    return lmarker;
  }

  function nodeFunction(data) {
    if (! data.tags || ( ! data.tags.name && ! data.tags.amenity && ! data.tags.shop) ) // no retval if node is just member of a way
      return null;
    if (! data.tags.name && data.tags.entrance)
      return null;
    return bindPopupOnData(data);
  }
  function wayFunction(data) {
    //calculate centre of polygon

    var centroid = $.geo.centroid(data.geometry);
    //var style = {};
    centroid.tags = data.tags;
    centroid.id = data.id;
    centroid.type = data.type;
    centroid.lon = centroid.coordinates[0];
    centroid.lat = centroid.coordinates[1];
    return bindPopupOnData(centroid);
  };
  function relationFunction(data) {
    // calculate mean coordinates as center
    // for all members, calculate centroid
    // then calculate mean over all nodes and centroids.
    var centroids = [];
    var sum_lon = 0;
    var sum_lat = 0;
    //console.log(data);
    for (var i = 0; i < data.members.length; i++) {
      var p = data.members[i];
      var centroid;
      switch (p.type) {
        case 'node':

          if(!p.obj) {
            console.log("!p.obj: ");
            console.log(p);
          } else {
            centroid = p.obj.coordinates;
            centroids.push(centroid);
          }
          break;
        case 'way':
          //console.log(p);
          if (p.role == "outer") {// FIXME add handling of rel members
            if(!p.obj) {
              console.log("!p.obj: ");
              console.log(p);
            } else {
              var centroid_point = $.geo.centroid(p.obj.geometry);
              centroid = centroid_point.coordinates;
              centroids.push(centroid);
            }
          } 
          break;
      }
      if(centroid){
        if(centroid.length != 0) {
          sum_lon += centroid[0];
          sum_lat += centroid[1];
        } else
          console.log("centroid empty!");
      } else
        console.log("centroid nonexisting!");

    }
    //console.log(centroids);
    var sum_centroid = { 
      id : data.id,
      lon : sum_lon / data.members.length,
      lat : sum_lat / data.members.length,
      tags : data.tags,
      type : data.type
    }

    //console.log(sum_centroid);
    return bindPopupOnData(sum_centroid);
    // todo: in the long term, all areas should be displayed as areas (as in overpass turbo)
  }

  function handleNodes(overpassJSON) {
    var pid = pid_counter_node++;
    console.log("handleNodes called (pid " + pid + ")");

    var new_markers = [];
    for (var i = 0; i < overpassJSON.elements.length; i++) {
      var p = overpassJSON.elements[i];
      if(p.type != 'node')
        continue;
      p.coordinates = [p.lon, p.lat];
      p.geometry = {type: 'Point', coordinates: p.coordinates};

      var retval = nodeFunction(p);
      if (retval)
        new_markers.push(retval);
    }
    var number = new_markers.length;
    markers.addLayers(new_markers);
    new_markers = [];
    console.log("handleNodes (pid " + pid + ") done, " + number + " added.");
    mutex_node--;
    var loading_indicator = document.getElementById("loading_node");
    if(mutex_node == 0) {
      loading_indicator.style.display = "none";
    } else {
      loading_indicator.title = mutex_node;
    }

    var json_date = new Date(overpassJSON.osm3s.timestamp_osm_base);
    $('#tnode').css("display", "block");
    $('#tnode').html("<img src='assets/20px-Mf_node.svg.png' />: " + json_date.toLocaleString());
  }

  function handleWays(overpassJSON) {
    var pid = pid_counter_way++;
    console.log("handleWays called (pid " + pid + ")");

    var new_markers = [];
    var nodes = {};
    for (var i = 0; i < overpassJSON.elements.length; i++) {
      var p = overpassJSON.elements[i];
      switch (p.type) {
        case 'node':
          p.coordinates = [p.lon, p.lat];
          p.geometry = {type: 'Point', coordinates: p.coordinates};
          nodes[p.id] = p;
          break;
        case 'way':
          p.coordinates = p.nodes.map(function (id) {
            return nodes[id].coordinates;
          });
          p.geometry = {type: 'LineString', coordinates: p.coordinates};

          var retval = wayFunction(p);
          if (retval)
            new_markers.push(retval);
      }
    }

    var number = new_markers.length;
    markers.addLayers(new_markers);
    new_markers = [];
    console.log("handleWays (pid " + pid + ") done, " + number + " added.");
    mutex_way--;
    var loading_indicator = document.getElementById("loading_way");
    if(mutex_way == 0) {
      loading_indicator.style.display = "none";
    } else {
      loading_indicator.title = mutex_way;
    }

    var json_date = new Date(overpassJSON.osm3s.timestamp_osm_base);
    $('#tway').css("display", "block");
    $('#tway').html("<img src='assets/20px-Mf_way.svg.png' />: " + json_date.toLocaleString());
  }

  function handleRelations(overpassJSON) {
    var pid = pid_counter_rel++;
    console.log("handleRelations called (pid " + pid + ")");
    var nodes = {}, ways = {};

    //overpass returns elements unsorted: rels, nodes, ways - should be nodes, ways, rels
    var rels = []; // to handle them last

    var new_markers = [];
    //console.log(overpassJSON.elements);
    for (var i = 0; i < overpassJSON.elements.length; i++) {
      var p = overpassJSON.elements[i];
      switch (p.type) {
        case 'node':
          p.coordinates = [p.lon, p.lat];
          p.geometry = {type: 'Point', coordinates: p.coordinates};
          nodes[p.id] = p;
          break;
        case 'way':
          p.coordinates = p.nodes.map(function (id) {
            return nodes[id].coordinates;
          });
          p.geometry = {type: 'LineString', coordinates: p.coordinates};
          ways[p.id] = p;
          break;
        case 'relation':
          rels.push(p);
          break;
      }
    }
    //console.log("nodes count:" + Object.keys(nodes).length + "; ways count:" + Object.keys(ways).length + "; rel count: " + rels.length);

    // handle relations last
    for (var i = 0; i < rels.length; i++) {
      var p = rels[i];
      p.members.map(function (mem) {
          if (mem.type == 'node') {

            if(!nodes[mem.ref])
              console.log("mem.type=node missing: " + mem.ref);

            mem.obj = nodes[mem.ref];
          } else if (mem.type == 'way') {

            if(!ways[mem.ref])
              console.log("mem.type=way missing: " + mem.ref); //FIXME this seems to come from overpass query not returning childs of rels... change query!

            mem.obj = ways[mem.ref];
          } else
            console.log("mem.type=" + mem.type);// FIXME handle rels of rels
      });
      // p has type=relaton, id, tags={k:v}, members=[{role, obj}]
      var retval = relationFunction(p);
      if (retval)
        new_markers.push(retval);
     
    }
    
    var number = new_markers.length;
    markers.addLayers(new_markers);
    new_markers = [];
    console.log("handleRelations (pid " + pid + ") done, " + number + " added.");
    mutex_rel--;
    var loading_indicator = document.getElementById("loading_rel");
    if(mutex_rel == 0) {
      loading_indicator.style.display = "none";
    } else {
      loading_indicator.title = mutex_rel;
    }

    var json_date = new Date(overpassJSON.osm3s.timestamp_osm_base);
    $('#trel').css("display", "block");
    $('#trel').html("<img src='assets/20px-Mf_relation.svg.png' />: " + json_date.toLocaleString());
  }

  var query = overpass_query;

  var node_query = overpass_query_nodes;
  var way_query = overpass_query_ways;
  var rel_query = overpass_query_rels;


  var allUrl = query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());

  var node_url = node_query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());
  var way_url = way_query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());
  var rel_url = rel_query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());

  //  node: getJSON [x] | 

  console.log("loadPOI: before JSON call node");
    mutex_node++;
    var loading_indicator_node = document.getElementById("loading_node");
    loading_indicator_node.style.display = "block";
    loading_indicator_node.title = mutex_node;
  $.getJSON(node_url, handleNodes);

  console.log("loadPOI: before JSON call way");
    mutex_way++;
    var loading_indicator_way = document.getElementById("loading_way");
    loading_indicator_way.style.display = "block";
    loading_indicator_way.title = mutex_way;
  $.getJSON(way_url, handleWays);

  console.log("loadPOI: before JSON call rel");
    mutex_rel++;
    var loading_indicator_rel = document.getElementById("loading_rel");
    loading_indicator_rel.style.display = "block";
    loading_indicator_rel.title = mutex_rel;
  $.getJSON(rel_url, handleRelations);


}

function updateLinks() {
  var centre = map.getCenter();
  var maps_container = document.getElementById("mapswitcher");
  var childs = maps_container.childNodes;
  for ( var i=0; i < childs.length; i++) {
    var li_child = childs[i];
    var a_child = li_child.firstChild;
    var href = a_child.getAttribute ("href");
    var splitstr = href.split('#');
    href = splitstr[0] + "#" + map.getZoom() + "/" + centre.lat + "/" + centre.lng;
    a_child.setAttribute("href",href);
  }

  var query = encodeURIComponent(overpass_ql_text);
  turbolink = "<a href=\'http://overpass-turbo.eu/?Q=" 
      + query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString()) 
      + '&R&C=' + centre.lat + ';' + centre.lng + ';' + map.getZoom() 
      + '\' title="Export OSM data with Overpass Turbo">Export data <img src="assets/turbo.png" height=12px style="margin-bottom:-2px"/></a>';
}


/* taken from https://github.com/ardhi/Leaflet.MousePosition 
Licence: MIT, see file MIT-LICENCE-Leaflet.MousePosition.txt */


L.Control.MousePosition = L.Control.extend({
  options: {
    position: 'bottomright',
    separator: ' : ',
    emptyString: 'Unavailable',
    lngFirst: false,
    numDigits: 5,
    lngFormatter: undefined,
    latFormatter: undefined,
    prefix: ""
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
    L.DomEvent.disableClickPropagation(this._container);
    map.on('mousemove', this._onMouseMove, this);
    this._container.innerHTML=this.options.emptyString;
    return this._container;
  },

  onRemove: function (map) {
    map.off('mousemove', this._onMouseMove)
  },

  _onMouseMove: function (e) {
    var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
    var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
    var lng_length = lng.toString().split(".")[1].length;
    var lat_length = lat.toString().split(".")[1].length;
    for(var i = 0; i < this.options.numDigits - lng_length; i++) {
        lng += "0";
    }
    for(var i = 0; i < this.options.numDigits - lat_length; i++) {
        lat += "0";
    }

    var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
    var prefixAndValue = this.options.prefix + ' ' + value;
    this._container.innerHTML = prefixAndValue + ' | ' + turbolink;
  }

});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.mousePosition = function (options) {
    return new L.Control.MousePosition(options);
};

var pois_lz;
if (window.url_pois_lz) {
  var http_request_lz = new XMLHttpRequest();
  http_request_lz.open("GET", url_pois_lz, true);
  http_request_lz.onreadystatechange = function () {
        var done = 4, ok = 200;
        if (http_request_lz.readyState === done && http_request_lz.status === ok) {
            pois_lz = JSON.parse(http_request_lz.responseText);
        }
    };
  http_request_lz.send(null);
  console.log("XMLHttpRequest for pois_lz sent");
} else {
  console.log("XMLHttpRequest for pois_lz NOT sent, no url");
}
