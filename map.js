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

  //overpass returns elements unsorted: rels, nodes, ways - should be nodes, ways, rels
  var rels = []; // to handle them last

  var new_markers = [];
  console.log(overpassJSON.elements);
  for (var i = 0; i < overpassJSON.elements.length; i++) {
    var p = overpassJSON.elements[i];
    switch (p.type) {
      case 'node':
        p.coordinates = [p.lon, p.lat];
        p.geometry = {type: 'Point', coordinates: p.coordinates};
        nodes[p.id] = p;
        // p has type=node, id, lat, lon, tags={k:v}, coordinates=[lon,lat], geometry
        if (typeof callbackNode === 'function') 
        {
          var retval = callbackNode(p);
          if (retval)
            new_markers.push(retval);
        }
        break;
      case 'way':
        p.coordinates = p.nodes.map(function (id) {
          return nodes[id].coordinates;
        });
        p.geometry = {type: 'LineString', coordinates: p.coordinates};
        ways[p.id] = p;
        // p has type=way, id, tags={k:v}, nodes=[id], coordinates=[[lon,lat]], geometry
        if (typeof callbackWay === 'function') 
        {
          var retval = callbackWay(p);
          if (retval)
            new_markers.push(retval);
        }
        break;
      case 'relation':
        rels.push(p);
        break;
    }
  }
  console.log("nodes count:" + Object.keys(nodes).length + " ways count:" + Object.keys(ways).length);

  // handle relations last
  for (var i = 0; i < rels.length; i++) {
    var p = rels[i];
    p.members.map(function (mem) {
        if (mem.type == 'node') {

          if(!nodes[mem.ref])
            console.log("mem.type=node" + mem.ref);

          mem.obj = nodes[mem.ref];
        } else if (mem.type == 'way') {

          if(!ways[mem.ref])
            console.log("mem.type=way" + mem.ref); //FIXME this seems to come from overpass query not returning childs of rels... change query!

          mem.obj = ways[mem.ref];
        } else
          console.log("mem.type=" + mem.type);// FIXME handle rels of rels
    });
    // p has type=relaton, id, tags={k:v}, members=[{role, obj}]
    if (typeof callbackRelation === 'function') 
    {
      var retval = callbackRelation(p);
      if (retval)
        new_markers.push(retval);
    }
   
  }
  
  markers.addLayers(new_markers);
  new_markers = [];
}

var marker_table = {};


function loadPoi() {
  if (map.getZoom() < 12 ) {
    return;
  }

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


  function bindPopupOnData(data) {
    // first: check if no item with this osm-id exists...
    var hashtable_key = data.type + data.id; // e.g. "node1546484546"
    if(marker_table[hashtable_key] == 1) //object already there
      return;
    marker_table[hashtable_key] = 1;

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
    return lmarker;
  }

  function nodeFunction(data) {
    if (! data.tags || ! data.tags.name || data.tags.entrance ) // no retval if node is just member of a way
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
    console.log(data);
    for (var i = 0; i < data.members.length; i++) {
      var p = data.members[i];
      var centroid;
      switch (p.type) {
        case 'node':
          centroid = p.obj.coordinates;
          centroids.push(centroid);
          break;
        case 'way':
          console.log(p);
          if (p.role == "outer") {// FIXME add handling of rel members
            var centroid_point = $.geo.centroid(p.obj.geometry);
            centroid = centroid_point.coordinates;
            centroids.push(centroid);
          } 
          break;
      }
      if(centroid.length != 0) {
        sum_lon += centroid[0];
        sum_lat += centroid[1];
      } else
        console.log("centroid empty!");
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

  function handleNodeWayRelations(data) {
    parseOverpassJSON(data, nodeFunction, wayFunction, relationFunction);
  }

  function handleNodes(overpassJSON) {
    console.log("handleNodes called");
    var new_markers = [];
    for (var i = 0; i < overpassJSON.elements.length; i++) {
      var p = overpassJSON.elements[i];
      p.coordinates = [p.lon, p.lat];
      p.geometry = {type: 'Point', coordinates: p.coordinates};

      var retval = nodeFunction(p);
      if (retval)
        new_markers.push(retval);
    }
    markers.addLayers(new_markers);
    new_markers = [];
  }

  function handleWays(overpassJSON) {
    console.log("handleWays called");
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

    markers.addLayers(new_markers);
    new_markers = [];
  }

  function handleRelations(overpassJSON) {
    console.log("handleRelations called");
    var nodes = {}, ways = {};

    //overpass returns elements unsorted: rels, nodes, ways - should be nodes, ways, rels
    var rels = []; // to handle them last

    var new_markers = [];
    console.log(overpassJSON.elements);
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
    console.log("nodes count:" + Object.keys(nodes).length + "; ways count:" + Object.keys(ways).length + "; rel count: " + rels.length);

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
    
    markers.addLayers(new_markers);
    new_markers = [];
  }

  var query = overpass_query;

  var node_query = overpass_query_nodes;
  var way_query = overpass_query_ways;
  var rel_query = overpass_query_rels;


  var allUrl = query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());

  var node_url = node_query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());
  var way_url = way_query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());
  var rel_url = rel_query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());

// $.getJSON(allUrl, handleNodeWayRelations);

  $.getJSON(node_url, handleNodes);
  $.getJSON(way_url, handleWays);
  $.getJSON(rel_url, handleRelations);

  console.log("loadPOI called");

}
