/* this part must be in global namespace */
// fetch taxonomy, containing all translations, and implicit affiliations
// taken from Wikipedia:JSON
var url = "taxonomy.json";
var taxonomy;
var http_request = new XMLHttpRequest();
http_request.open("GET", url, true);
http_request.onreadystatechange = function () {
      var done = 4, ok = 200;
      if (http_request.readyState === done && http_request.status === ok) {
          taxonomy = JSON.parse(http_request.responseText);
      }
  };
http_request.send(null);

function initMap(defaultlayer,base_maps,overlay_maps) {
  map = new L.Map('map', {
    center: new L.LatLng(47.07, 15.43),
      zoom: 13,
      layers: defaultlayer,
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
    zoom:12
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


function parseOverpassJSON(overpassJSON, callbackNode, callbackWay, callbackRelation) {
  var nodes = {}, ways = {};
  for (var i = 0; i < overpassJSON.elements.length; i++) {
    var p = overpassJSON.elements[i];
    switch (p.type) {
      case 'node':
        p.coordinates = [p.lon, p.lat];
        p.geometry = {type: 'Point', coordinates: p.coordinates};
        nodes[p.id] = p;
        // p has type=node, id, lat, lon, tags={k:v}, coordinates=[lon,lat], geometry
        if (typeof callbackNode === 'function') callbackNode(p);
        break;
      case 'way':
        p.coordinates = p.nodes.map(function (id) {
          return nodes[id].coordinates;
        });
        p.geometry = {type: 'LineString', coordinates: p.coordinates};
        ways[p.id] = p;
        // p has type=way, id, tags={k:v}, nodes=[id], coordinates=[[lon,lat]], geometry
        if (typeof callbackWay === 'function') callbackWay(p);
        break;
      case 'relation':
        p.members.map(function (mem) {
          mem.obj = (mem.type == 'way' ? ways : nodes)[mem.ref];
        });
        // p has type=relaton, id, tags={k:v}, members=[{role, obj}]
        if (typeof callbackRelation === 'function') callbackRelation(p);
        break;
    }
  }
}

var marker_table = {};


function loadPoi() {
  if (map.getZoom() < 12 ) {
    return;
  }
  var query = overpass_query;

  var iconsize = 24;

  function fillPopup(tags,type,id) {

    var r = $('<table>');
    var tags_to_ignore = [ "name" , "ref", "needs" ];

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

        r.append($('<tr>').append($('<th>').append(keytext)).append($('<td>').text(valuetext)));
      }

    } // end for (key in tags)
    r.append($('<tr>').append($('<th>').append("&nbsp;")).append($('<td>').append("&nbsp;"))); // spacer

    r.append($('<tr>').append($('<th>').text("OSM-Type:")).append($('<td>').text(type)));
    r.append($('<tr>').append($('<th>').text("OSM-ID:")).append($('<td>').append('<a href="https://www.openstreetmap.org/' + type + "/" + id + '">' + id + '</a>')));

    var s = $('<div>');
    s.append(r);
    var retval = $('<div>').append(s);
    retval.prepend($('<h1>').text(tags["name"]));
    return retval.html();
  }


  var allUrl = query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());

  function bindPopupOnData(data) {
    // first: check if no item with this osm-id exists...
    var hashtable_key = data.type + data.id;
    if(marker_table[hashtable_key] == 1) //object already there
      return;
    marker_table[hashtable_key] = 1;

    // set icon dependent on tags
    data.tags.needs = "";
    for (key in data.tags) {
      if ( key.indexOf("fulfils_needs:") >= 0 ) {
        needs_value = key.substring(14);
        if ( data.tags.needs != "" )
          data.tags.needs = data.tags.needs + "; ";
        data.tags.needs = data.tags.needs + needs_value;
      }
    }
    var icon_url = "";
    if (data.tags.needs.indexOf(";") >= 0) // more than one item, take generic icon
      icon_url = "assets/transformap/pngs/" + iconsize + "/fulfils_needs.png";
    else
      icon_url = "assets/transformap/pngs/" + iconsize + "/fulfils_needs." + data.tags.needs + ".png";

    if ((data.tags.needs.split(";").length - 1  == 1) && (data.tags.needs.indexOf("beverages") >= 0) && (data.tags.needs.indexOf("food") >= 0 ) ) //only the two items beverages food share the same icon
      icon_url = "assets/transformap/pngs/" + iconsize + "/fulfils_needs.food.png";

    if(!data.tags.needs)
      icon_url = "assets/transformap/pngs/" + iconsize + "/unknown.png";

    var needs_icon = L.icon({
      iconUrl: icon_url,
      iconSize: new L.Point(iconsize, iconsize),
      iconAnchor: new L.Point(iconsize / 2, iconsize / 2),
    });

    var lmarker = L.marker([data.lat, data.lon], {
      icon: needs_icon,
      title: data.tags.name
    });
    lmarker.bindPopup(fillPopup(data.tags,data.type,data.id));
    markers.addLayer(lmarker);
  }

  function nodeFunction(data) {
    if (! data.tags || ! data.tags.name || data.tags.entrance ) return;
    bindPopupOnData(data);
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
    bindPopupOnData(centroid);
    return;
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
          centroid = p.obj.coordinates;
          centroids.push(centroid);
          break;
        case 'way':
          // fixme test with relations and way-members
          var centroid_point = $.geo.centroid(p.obj.geometry);
          centroid = centroid_point.coordinates;
          entroids.push(centroid);
          break;
      }
      sum_lon += centroid[0];
      sum_lat += centroid[1];
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
    bindPopupOnData(sum_centroid);
    // todo: in the long term, all areas should be displayed as areas (as in overpass turbo)
  }

  function handleNodeWayRelations(data) {
    parseOverpassJSON(data, nodeFunction, wayFunction, relationFunction);
  }

  $.getJSON(allUrl, handleNodeWayRelations);

}
