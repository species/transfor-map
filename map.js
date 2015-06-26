if(!window.console)  // for very old browser
    var console = { log : function(i){}}

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

var different_maps = [ 
    { url : "identities.html" ,
      name : "TransforMap of Identities",
      image: "assets/transformap/pngs/" + 24 + "/political_identity.png"
    } ,
    /*   { url : "transformap.html" ,
      name : "Needs-based TransforMap" } , */
    { url : "organic.html" ,
      name : "Organic TransforMap",
      image : "assets/transformap/pngs/pois/" + 24 + "/shop=supermarket.png"
    } ,
    { url : "regional.html" ,
      name : "Regional TransforMap",
      image : "assets/transformap/pngs/pois/" + 24 + "/shop=convenience.png"
    } ,
    { url : "fairtrade.html" ,
      name : "Fairtrade TransforMap",
      image : "assets/transformap/pngs/pois/" + 24 + "/shop=fairtrade.png"
    } ,
    { url : "secondhand.html" ,
      name : "Second Hand TransforMap",
      image : "assets/transformap/pngs/pois/" + 24 + "/shop=second_hand.png"
    } ,
    { url : "greenmap.html" ,
      name : "Green TransforMap",
      image : "assets/greenmap/png/" + 24  + "/Park-_Recreation_Area.png"
    } 
];


/* filter functions:
 *  take an osm-object's data:
 *      data: {} with data.tags,data.type,data.id,data.lat,data.lon
 *  return true (=displayed) or false (object will be hidden)
 *
 * general function of filters: if ANY filter says "yes" it is to be displayed
 * e.g. one has to uncheck organic=no if he doesn't want to see explicit non-organic tagged items
 */

var filters = {
  //    provides: {} generate from taxonomy.json
  //    identity: {} generate from taxonomy.json
  //    interaction: {} generate from taxonomy.json
    organic : {  label : "Organic",
                 displayed : false,
                 function_name : function filter_organic(osm_object){ //ONLY FUNCTION WORKING RIGHT NOW, USE FOR TESTING!
                     if(!osm_object['tags']) {
                         console.log("error in filters.organic: no tags attached!");
                         return false;
                     }

                     var crits = filters.organic.sub_criteria;
                     for(key in crits) {
                         var current_crit = crits[key];
                         if(! current_crit.state)
                             continue;

                         if(osm_object.tags[current_crit.key] == current_crit.value)
                             return true;
                         // 'unknown'
                         if(current_crit.value === null && ! osm_object.tags.hasOwnProperty(current_crit.key))
                             return true;
                     }

                     return false; 
                 },
                 sub_criteria : {
                     only : {
                         key : "organic",
                         value : "only",
                         label : "Only",
                         default_state : "enabled",
                         state : true
                     },
                     yes : {
                         key : "organic",
                         value : "yes",
                         label : "Good selection",
                         default_state : "enabled",
                         state : true
                     },
                     limited : {
                         key : "organic",
                         value : "limited",
                         label : "Limited selection",
                         default_state : "enabled",
                         state : true
                     },
                     no : {
                         key : "organic",
                         value : "no",
                         label : "None",
                         default_state : "enabled",
                         state : true
                     },
                     unknown : {
                         key : "organic",
                         value : null,
                         label : "Unknown",
                         default_state : "enabled",
                         state : true
                     }
                 }
    },
/*    fee : { label : "Gratis",
                    displayed : true,
                    function_name : function filter_opening(osm_object){
                        if(!osm_object['tags']) {
                            console.log("error in filters.fee: no tags attached!");
                            return false;
                        }

                        // simplified for testing
                        // FIXME whatif property not set?
                        return (osm_object.tags['fee'] == "no" ) ? true : false; 
                    },
                     sub_criteria : {
                         no : {
                             key : "fee",
                             value : "no",
                             label : "Yes",
                             default_state : "enabled",
                             state : true,
                         },
                         yes : {
                             key : "fee",
                             value : "no",
                             label : "No",
                             default_state : "enabled",
                             state : true,
                         },
                         unknown : {
                             key : "fee",
                             value : null,
                             label : "Unknown",
                             default_state : "enabled",
                             state : false,
                         },
                     }
    },*/
  /*  opening_hours : { label : "Open Now",
                    displayed : true,
                    function_name : function filter_opening(osm_object){
                        if(!osm_object['tags']) {
                            console.log("error in filters.opening_hours: no tags attached!");
                            return false;
                        }

                        // simplified for testing
                        var crits = filters.opening_hours.sub_criteria;
                        for(key in crits) {
                            if(! crits[key].state)
                                continue;
                            if(key == "open") {
                                // TODO add opening_hours.js here
                                if(osm_object.tags['opening_hours'] == "24/7" )
                                    return true;
                                // else continue !
                            } else if (key == "closed") {
                                // TODO add opening_hours.js here
                                if(osm_object.tags['opening_hours'] == "off")
                                    return true;
                                // if POI is closed, continue
                            } else { //unknown
                                return true;
                            }
                        }
                        return false;
                    },
                     sub_criteria : {
                         open : {
                             key : "opening_hours",
                             value : null,
                             label : "Open",
                             default_state : "enabled",
                             state : true,
                         },
                         closed : {
                             key : "opening_hours",
                             value : null,
                             label : "Closed",
                             default_state : "enabled",
                             state : true,
                         },
                         unknown : {
                             key : "opening_hours",
                             value : null,
                             label : "Unknown",
                             default_state : "enabled",
                             state : true,
                         },
                     }
    },*/
    wheelchair : {  label : "Wheelchair accessible",
                    displayed : false,
                    function_name : function filter_wheelchair(osm_object){ 
                         if(!osm_object['tags']) {
                             console.log("error in filters.wheelchair: no tags attached!");
                             return false;
                         }

                         var crits = filters.wheelchair.sub_criteria;
                         for(key in crits) {
                             var current_crit = crits[key];
                             if(! current_crit.state)
                                 continue;

                             if(osm_object.tags[current_crit.key] == current_crit.value)
                                 return true;
                             // 'unknown'
                             if(current_crit.value === null && ! osm_object.tags.hasOwnProperty(current_crit.key))
                                 return true;
                         }

                         return false; 
                    },
                    sub_criteria : {
                        yes : {
                             key : "wheelchair",
                             value : "yes",
                             label : "100% accessible",
                             default_state : "enabled",
                             state : true
                        },
                        limited : {
                             key : "wheelchair",
                             value : "limited",
                             label : "Limited",
                             default_state : "enabled",
                             state : true
                        },
                        no : {
                             key : "wheelchair",
                             value : "no",
                             label : "No",
                             default_state : "enabled",
                             state : true
                        },
                        unknown : {
                             key : "wheelchair",
                             value : null,
                             label : "Unknown",
                             default_state : "enabled",
                             state : true
                        }
                    }
    }
}

function filterMatches(object_tags, filter) {
    if(object_tags.hasOwnProperty(filter.key) && checkIfInMultiValue(object_tags[filter.key],filter.value))
        return true;
    if(filter["tags_whitelist"] && isPOIinWhiteList(filter["tags_whitelist"],object_tags))
        return true;
    else
        return false;
}
function needsFilterMatches(object_tags, filter) {
    if((object_tags.hasOwnProperty(filter.key) && checkIfInMultiValue(object_tags[filter.key],filter.value))
            || ( object_tags.hasOwnProperty('topic') && checkIfInMultiValue(object_tags['topic'],filter.value) )
            || isPOIinWhiteList(filter.tags_whitelist, object_tags) )
        return true;
    else
        return false;
}

function filterFunctionIdentity(osm_object) {
     if(!osm_object['tags']) {
         console.log("error in filters.identity: no tags attached!");
         return false;
     }

     var crits = filters.identity.sub_criteria;
     for(key in crits) {
         if(key == "unknown") continue;
         if(! crits[key].state ) continue;

         if(filterMatches(osm_object.tags,crits[key]))
             return true;
     }
     //handle "unknown" last
     if(! crits.unknown.state)
         return false;

     for(key in crits) { //do not display POI if in SOME subcrit's whitelist (or it's primary filter key is disabled)...
         if(key == "unknown") continue;

         if(filterMatches(osm_object.tags,crits[key]))
             return false;
     }
     return true; // has no or unknown "interaction" key set, and no whitelist of any subcrit matched
}
function filterFunctionInteraction(osm_object) {
     if(!osm_object['tags']) {
         console.log("error in filters.Interaction: no tags attached!");
         return false;
     }

     var crits = filters.interaction.sub_criteria;
     for(key in crits) {
         if(key == "unknown") continue;
         if(! crits[key].state ) continue;

         if(filterMatches(osm_object.tags,crits[key]))
             return true;
     }

     //handle "unknown" last
     if(! crits.unknown.state)
         return false;

     for(key in crits) { //do not display POI if in SOME subcrit's whitelist (or it's primary filter key is disabled)...
         if(key == "unknown") continue;

         if(filterMatches(osm_object.tags,crits[key]))
             return false;
     }
     return true; // has no or unknown "interaction" key set, and no whitelist of any subcrit matched
}
/* TODO currently only the 'provides' section in taxonomy.json is used, an 'topic' section gets ignored */
function filterFunctionNeeds(osm_object) {
     if(!osm_object['tags']) {
         console.log("error in filters.Needs: no tags attached!");
         return false;
     }

     var crits = filters.provides.sub_criteria;
     for(key in crits) {
         if(key == "unknown") continue;
         if(! crits[key].state ) continue;

         if(needsFilterMatches(osm_object.tags,crits[key]))
             return true;
     }

     //handle "unknown" last
     if(! crits.unknown.state)
         return false;

     //do not display POI if in SOME subcrit's whitelist (or it's primary filter key is disabled)...
     for(key in crits) {
         if(key == "unknown") continue;

         if(needsFilterMatches(osm_object.tags,crits[key]))
             return false;
     }

     // has no or unknown "provides"/"topic" key set, and no whitelist of any subcrit matched
     return true;
}

function isPOIinWhiteList(whitelist,osm_tags) {
    if(! $.isArray(whitelist)) {
        console.log("isPOIinWhiteList: no array given as whitelist");
        return false;
    }
    for(var whitelist_nr = 0; whitelist_nr < whitelist.length; whitelist_nr++) {
        var tags_whitelist = whitelist[whitelist_nr];

        var all_wl_keys_ok = false;
        for(wl_key in tags_whitelist) {
            var wl_value = tags_whitelist[wl_key];
            if(! osm_tags.hasOwnProperty(wl_key) ) {
                all_wl_keys_ok = false;
                break;
            }
            if(wl_value == "*") {
                all_wl_keys_ok = true;
                continue;
            }
            if(checkIfInMultiValue(osm_tags[wl_key], wl_value) ) {
                all_wl_keys_ok = true;
                continue;
            } else {
                all_wl_keys_ok = false;
                break;
            }
        }
        if(all_wl_keys_ok)
            return true;
    }
    return false;
}

function checkIfInMultiValue(multi_value,value) {
    var multivalue_array = multi_value.split(/;\s*/);
    for(var i=0; i < multivalue_array.length; i++) {
        if(multivalue_array[i] == value)
            return true;
    }
    return false;
}

/* TODO it is relatively inefficient to run all filters every time a single entry is changed - later only the filters affected on change should be run */
function runFiltersOnAll() {

    var marker_array = markers.GetMarkers();
    for(var i = 0; i < marker_array.length; i++) {
        var marker = marker_array[i];
        marker.filtered = ! getFilterStatusOnPoi(marker);
    }

    markers.ProcessView();
}


/* 
 * for an POI to be displayed (return-value true),
 * every filtergroup must return true for the POI!
 */
function getFilterStatusOnPoi(marker) {

    for(filtername in filters) {
        if( ! (typeof(filters[filtername].function_name) === 'function') )
            continue;
        if(! filters[filtername].function_name(marker.data))
            return false;
    }
    return true;
}

function createValidDOMid (source) {
    return source.replace(/[^a-zA-Z0-9-_]/g,"_");
}

function updateFilterCount() {

    //at first, reset all counts
    for(filtername in filters) {
        for(itemname in filters[filtername].sub_criteria) {
            var id = createValidDOMid('filter_'+filtername+'_'+itemname+'_counter');
            document.getElementById(id).innerHTML = "-";
            document.getElementById(id).style.color="#ADADAD";
        }
    }

    var bounds = map.getBounds();
    var marker_array = markers.GetMarkers();

    //list of visible markers needed because we need to know their amount
    var visible_markers = [], nr_pois = { node: 0, way: 0, relation:0 };
    for(var i = 0; i < marker_array.length; i++) {
        var marker = marker_array[i];
        var latlng = L.latLng(marker.data.lat, marker.data.lon);
        if( bounds.contains(latlng) )
            visible_markers.push(marker);
    }
    $('#POIlist').html("");
    var list_of_POIs = [], list_of_unnamed_POIs = [];

    for(var i = 0; i < visible_markers.length; i++) {
        var marker = visible_markers[i];
        var marker_id = marker.data.type + marker.data.id;
        nr_pois[marker.data.type]++;
        for(filtername in filters) {

            var is_marker_unknown = true;

            for(itemname in filters[filtername].sub_criteria) {
                var el = document.getElementById(createValidDOMid('filter_'+filtername+'_'+itemname+'_counter'));
                var current_count = el.innerHTML;
                if(current_count == "-")
                    current_count = 0;
                
                if(itemname != "unknown") {
                    if (filtername == "provides") {
                        if (needsFilterMatches(marker.data.tags, filters[filtername].sub_criteria[itemname])) {
                          current_count++;
                          is_marker_unknown = false;
                        } 
                    } else {
                        if (filterMatches(marker.data.tags, filters[filtername].sub_criteria[itemname])) {
                          current_count++;
                          is_marker_unknown = false;
                        } 
                    }
                } else { // unknown is always last
                    if(is_marker_unknown) current_count++ ;
                }
                el.innerHTML = current_count;
                if(current_count == "0")
                    el.style.color="#ADADAD";
                else
                    el.style.color="inherit";


            }
        }
        if( ! marker.hasOwnProperty("filtered") )
            continue;
        if( ! marker.filtered) {
            if(marker.data.tags.name)
                list_of_POIs.push(marker);
            else
                list_of_unnamed_POIs.push(marker);
        }
    }
    list_of_POIs.sort(function (a,b) {
        var nameA = a.data.tags.name.toLowerCase(), nameB = b.data.tags.name.toLowerCase();
        if (nameA < nameB) //sort string ascending
            return -1
        if (nameA > nameB)
            return 1
        return 0 //default return value (no sorting)
        });
    for(var i = 0; i < list_of_POIs.length; i++) {
        marker = list_of_POIs[i];
        var src = chooseIconSrc(marker.data.tags, 16);
        $('#POIlist').append("<li onClick='MytogglePopup(\""+marker.data.type+"\",\""+marker.data.id+"\");'><img src='" + src + "' />" + marker.data.tags.name + "</li>");
    }
    for(var i = 0; i < list_of_unnamed_POIs.length; i++) {
        marker = list_of_unnamed_POIs[i];
        var src = chooseIconSrc(marker.data.tags, 16);
        var main_tag = getMainTag(marker.data.tags);
        var ersatz_name = (marker.data.tags[main_tag] || "unknown");
        $('#POIlist').append("<li onClick='MytogglePopup(\""+marker.data.type+"\",\""+marker.data.id+"\");'><img src='" + src + "' />" + ersatz_name + "</li>");
    }

    $('#tnode').attr('element-nrs',nr_pois.node);
    $('#tway').attr('element-nrs',nr_pois.way);
    $('#trel').attr('element-nrs',nr_pois.relation);
}

/*
 * takes a two args: osm datatype and osm id
 * if marker in field of view, toggle popup.
 * zooms in if marker is hidden in cluster to get leafletMarker
 */
function MytogglePopup(osm_type,osm_id) {
    disableLoadPOI = true;
    var leaflet_marker = getVisibleMarker(osm_type,osm_id)
    if(leaflet_marker) {
        leaflet_marker.togglePopup();
        setTimeout(function () {
            disableLoadPOI = false;
        }, 200);
        return;
    } //else

    var target_marker;
    var marker_array = markers.GetMarkers();
    for(var i = 0; i < marker_array.length; i++) {
        var prunecluster_marker = marker_array[i];
        if(prunecluster_marker.data.type == osm_type && prunecluster_marker.data.id == osm_id) {
            target_marker = prunecluster_marker;
            break;
        }
    }
    if(target_marker) {
        if(map.getZoom() == map.getMaxZoom()) {
            var possible_clusters = [];
            map.eachLayer(function (layer) {
                if(layer._population > 0)
                    possible_clusters.push(layer);
            });
            var distance = 123456789;
            var nearest_cluster = null;
            for(i = 0; i < possible_clusters.length; i++) {
                var new_distance = calculateDistance(target_marker.position.lat, possible_clusters[i]._latlng.lat, target_marker.position.lng,  possible_clusters[i]._latlng.lng);
                if( new_distance < distance ) {
                    distance = new_distance;
                    nearest_cluster = possible_clusters[i];
                }
            }
            if(!nearest_cluster) {
                console.log("Error in MytogglePopup: no nearest cluster found");
                disableLoadPOI = false;
                return;
            }
            nearest_cluster.fireEvent('click');
        }
        else
          map.setZoomAround( new L.LatLng(target_marker.position.lat, target_marker.position.lng), map.getZoom() + 1);

        setTimeout(function () {
            MytogglePopup(osm_type,osm_id);
        }, 200);
    } else {
        disableLoadPOI = false;
        console.log("Error in MytogglePopup: marker " + osm_type + " " + osm_id + " not found in markers.GetMarkers()");
    }
}


//source: http://jsfiddle.net/vg01q7xw/
Number.prototype.toRad = function() {
        return this * Math.PI / 180;
}
function calculateDistance(lat1, lat2, lon1, lon2) {
    var R = 6371000; // meter
    var Phi1 = lat1.toRad();
    var Phi2 = lat2.toRad();
    var DeltaPhi = (lat2 - lat1).toRad();
    var DeltaLambda = (lon2 - lon1).toRad();

    var a = Math.sin(DeltaPhi / 2) * Math.sin(DeltaPhi / 2)
            + Math.cos(Phi1) * Math.cos(Phi2) * Math.sin(DeltaLambda / 2)
            * Math.sin(DeltaLambda / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;
}

function getVisibleMarker(osm_type,osm_id) {
    var my_layer = null;
    map.eachLayer(function (layer) {
        if(! layer._popup || ! layer.options.alt)
            return;
        if(layer.options.alt != (osm_type + " " + osm_id))
            return;

        my_layer = layer;
    });
    return my_layer;
}

/* precondition: in global var filters, an object $filtername must exist.
 *  returns a piece of HTML which can be added to filters sidebar 
 */
function createFilterHTML(filtername) {
  var filter = filters[filtername];
  var sub_filters = null;
  if(filter["sub_criteria"]) {
      sub_filters = $('<ul>').attr('class', "subfilter");

      for(itemname in filter.sub_criteria) {
          var item = filter.sub_criteria[itemname];
          var statevarname = 'filters.'+filtername+'.sub_criteria[\''+itemname+'\'].state'; //filters.provides.sub_criteria['food+drink'].state
          var title = "“" + item.key + "” = “" + item.value + "”";
          sub_filters.append('<li><div class='+item.default_state+' '
           + 'onClick="'+statevarname+' = ! '+statevarname+'; runFiltersOnAll(); this.className = ('+statevarname+') ? \'enabled\' : \'disabled\';"'
           + ' title="' + title + '">'
           + item.label 
           + '<span id="filter_'+ createValidDOMid(filtername+'_'+itemname) +'_counter">-</span>'
           + '</div>'
           + ((item.description) ? ("<div onClick='toggleInfoBox(\"filter_info_"+createValidDOMid(filtername+'_'+itemname)+"\");'>?<div class=InfoBox id='filter_info_"+createValidDOMid(filtername+'_'+itemname)+"'>"+item.description+"</div></div>"): "")
           +'</li>' );
      }
  }
  return $('<li>')
        .attr('class', filter.displayed ? 'shown' : 'hidden')
//           .attr('onClick', "runFiltersOnAll();") 
        .append( '<h3 onClick="this.parentNode.className = (this.parentNode.className == \'shown\') ? \'hidden\' : \'shown\' ;">' + filter.label + '</h3>' )
        .append( sub_filters );
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
          if(!window.JSON) {
//              document.getElementById('map').inn("Error:cannot handle JSON");
              return;
          }
          taxonomy = JSON.parse(http_request.responseText);

          if(taxonomy) {
              // add map key derived from it
              for(var osmkey_counter = 0; osmkey_counter < overpass_config.icon_tags.length; osmkey_counter++) {
                  var osmkey = overpass_config.icon_tags[osmkey_counter];

                  var taxonomy_block = taxonomy[osmkey];
                  if (!taxonomy_block) {
                      console.log("no entry in taxonomy for " + osmkey);
                      break;
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

              // create filters out of taxonomy
              //var filter_names = [ "provides","interaction","identity" ];
              var filter_names = [ "identity","interaction","provides" ]; //must be in reverse order to be shown correct!
              var filter_functions = { "provides" : filterFunctionNeeds, "identity" : filterFunctionIdentity, "interaction" : filterFunctionInteraction };
              for(var i=0; i < filter_names.length; i++) {
                  var filter_name = filter_names[i];
                  var taxonomy_block = taxonomy[filter_name];
                  if (!taxonomy_block) {
                      console.log("filters: no entry in taxonomy for " + osmkey);
                      return;
                  }
                  
                  filters[filter_name] = {
                      label: taxonomy_block.label["en"],
                      displayed: false,
                      function_name: filter_functions[filter_name],
                      sub_criteria: {}
                  };
                  var filter = filters[filter_name];

                  for(itemkey in taxonomy_block.items) {
                      var item = taxonomy_block.items[itemkey];

                      filter.sub_criteria[ item["transformap:key"] ] = {
                          label : item.label["en"],
                          key : item["osm:key"],
                          value : item["osm:values"][0],
                          description : item.description["en"],
                          tags_whitelist : item["osm:objects"],
                          default_state : "enabled",
                          state : true
                      }
                  }
                  filter.sub_criteria[ "unknown" ] = {
                      label : "Unknown",
                      key : item["osm:key"],
                      value : null,
                      tags_whitelist : [],
                      default_state : "enabled",
                      state : true
                  },


                  $('#filters').prepend(createFilterHTML(filter_name));
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

function toggleSideBox(id) {//TODO rewrite with jQuery toggleClass
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
function toggleSideBar() { //TODO rewrite with jQuery toggleClass
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

var overpass_ql_text,
    overpass_query,
    overpass_query_nodes,
    overpass_query_ways,
    overpass_query_rels;

/*
 * sets global the vars above
 * MUST be called before first loadPOI
 */
function buildOverpassQuery() {
    if(! window.overpass_config )
        window.overpass_config = {};

    if(! overpass_config.timeout)             overpass_config.timeout = 180;
    if(! overpass_config.minzoom)             overpass_config.minzoom = 12;
    if(! overpass_config.servers)             overpass_config.servers = [ "http://overpass-api.de/api/", "http://api.openstreetmap.fr/oapi/", "http://overpass.osm.rambler.ru/cgi/" ];
    if(! overpass_config.q_array)             overpass_config.q_array = [ [ '"identity"' ] ];
    if(! overpass_config.icon_folder)         overpass_config.icon_folder = "identities";
    if(! overpass_config.icon_tags)           overpass_config.icon_tags = [ "identity" ];
    if(! overpass_config.icon_size)           overpass_config.icon_size = 24;
    if(! overpass_config.class_selector_key)  overpass_config.class_selector_key = { key: "" };

    var overpass_urlstart = 'interpreter?data=';
    var overpass_start = '[out:json][timeout:' + overpass_config.timeout + '][bbox:BBOX];';

    var overpass_query_string = "";
    var overpass_query_string_nodes = "";
    var overpass_query_string_ways = "";
    var overpass_query_string_rels = "";

    for (var i = 0; i < overpass_config.q_array.length; i++) {
      var anded_tags = overpass_config.q_array[i];
      var anded_querystring = "";
      var nr_of_and_clauses = anded_tags.length;
      for (var j=0; j < nr_of_and_clauses; j++) {
        anded_querystring += "[" + anded_tags[j] + "]";
      }

      overpass_query_string += "node" + anded_querystring + ";out;";
      overpass_query_string += "(way" + anded_querystring + ";node(w));out;";
      overpass_query_string += "rel" + anded_querystring + ";out;>;out;";

      overpass_query_string_nodes += "node" + anded_querystring + ";out;";
      overpass_query_string_ways += "(way" + anded_querystring + ";node(w));out;";
      overpass_query_string_rels += "rel" + anded_querystring + ";out;>;out;";
    }

    overpass_ql_text = overpass_start + overpass_query_string;
    overpass_query = overpass_config.servers[0] + overpass_urlstart + overpass_ql_text;
    overpass_query_nodes = overpass_config.servers[0] + overpass_urlstart + overpass_start + overpass_query_string_nodes;
    overpass_query_ways = overpass_config.servers[1] + overpass_urlstart + overpass_start + overpass_query_string_ways;
    overpass_query_rels = overpass_config.servers[2] + overpass_urlstart + overpass_start + overpass_query_string_rels;
    console.log(overpass_query_nodes);
    console.log(overpass_query_ways);
    console.log(overpass_query_rels);
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
        }
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

  $('body').append('<div id="sidebar"><h1>' + document.title + '</h1></div>');
  $('body').append('<div id="sidebar_toggle" onClick="toggleSideBar()">»</div>');

  // switching to other maps
  $('#sidebar').append('<div id="sidebox-maps" class="box hidden"></div>');
  $('#sidebox-maps').append('<h2 onClick="toggleSideBox(\'sidebox-maps\');">Explore other Maps</h2>');
  $('#sidebox-maps').append('<ul id="mapswitcher" class="boxcontent"></ul>');

  for (var i = 0; i < different_maps.length; i++) {
    var current_item = different_maps[i]; 
    $('#mapswitcher').append(
        $('<li>')
            .attr('class', current_item["name"] == document.title ?  "current" : "")
            .append( $('<a>')
                .attr('href', current_item["url"])
                .append('<img src="' + current_item["image"] + '" />' + current_item["name"])
            )
    );
  }
  // Filters
  $('#sidebar').append('<div id="sidebox-filters" class="box hidden"></div>');
  $('#sidebox-filters').append('<h2 onClick="toggleSideBox(\'sidebox-filters\');">Filters</h2>');
  $('#sidebox-filters').append('<ul id="filters" class="boxcontent"></ul>');
  for (filtername in filters) {
      $('#filters').append(createFilterHTML(filtername));
  }
  // filters derived from taxonomy get added when taxonomy.json is loaded

  // List of POIs
  $('#sidebar').append('<div id="sidebox-list" class="box hidden"></div>');
  $('#sidebox-list').append('<h2 onClick="toggleSideBox(\'sidebox-list\');">List of <span title="Point of Interest">POIs</span></h2>');
  $('#sidebox-list').append('<ul id="POIlist" class="boxcontent"></ul>');

  // Map Key
  $('#sidebar').append('<div id="sidebox-mapkey" class="box hidden"></div>');
  $('#sidebox-mapkey').append('<h2 onClick="toggleSideBox(\'sidebox-mapkey\');">Map Key</h2>');
  $('#sidebox-mapkey').append('<ul id="mapkey" class="boxcontent"></ul>');

  // extra mapkey for maps not deriving from taxonomy.json
  if(window.mapkey) {
      $('#mapkey').append(window.mapkey);
      $('#mapkey li').attr('class','manual');
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
  $('#timestamp').append('<div id="tnode" onmouseover="alert(\'' + overpass_config.servers[0].replace(/^http:\/\//,"") + '\');"></div>');
  $('#timestamp').append('<div id="tway"  onmouseover="alert(\'' + overpass_config.servers[1].replace(/^http:\/\//,"") + '\');"></div>');
  $('#timestamp').append('<div id="trel"  onmouseover="alert(\'' + overpass_config.servers[2].replace(/^http:\/\//,"") + '\');"></div>');

  $('body').append('<a href="https://github.com/TransforMap/transfor-map" title="Fork me on GitHub" id=forkme></a>');
  $('#forkme').append('<img src="assets/forkme-on-github.png" alt="Fork me on GitHub" />');

  $('body').append('<img src="assets/ajax-loader.gif" id="loading_node" class="loading" />');
  $('body').append('<img src="assets/ajax-loader.gif" id="loading_way" class="loading" />');
  $('body').append('<img src="assets/ajax-loader.gif" id="loading_rel" class="loading" />');
  $('body').append('<div id="notificationbar">Please zoom in to update POIs!</div>');

  map.on('moveend', updateLinks);
  map.on('popupopen', setImageInPopup);

  setTimeout(toggleSideBarOnLoad,200);

  var popup_param = getUrlVars()["popup"];
  if(popup_param) {
      open_popup_on_load.type = popup_param.match(/^(node|way|relation)/)[1];
      open_popup_on_load.id = popup_param.replace(/^(node|way|relation)/,'' );
  }

  return map;
}

var open_popup_on_load = { type : "", id: "", already_shown: false };

/*
   var href = location.href;
   var hasQuery = href.indexOf("?") + 1;
   var hasHash = href.indexOf("#") + 1;
   var appendix = (hasQuery ? "&" : "?") + "ts=true";
   location.href = hasHash ? href.replace("#", appendix + "#") : href + appendix;
   */

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value.replace(/#.*$/,'');
    });
    return vars;
}

function setImageInPopup(obj) {
//    console.log("setImageInPopup: called");
    if(!document.getElementById('wp-image')) {
//        console.log("setImageInPopup: no wp-image");
        return;
    }
    if ($('#wp-image img').attr('src')) {
//        console.log("setImageInPopup: src already set");
        return;
    }
    var img = $('#wp-image img');
    var source = wikipedia_images["wpimage_" + img.attr('title')];

    if(!source) {
        $('#wp-image').css('display','none');
//        console.log("setImageInPopup: no answer for item yet");
        return;
    }
    if ( source == "UNDEF") {
        $('#wp-image').css('display','none');
//        console.log("setImageInPopup: no image on wikipedia");
        return;
    }
//    console.log("setImageInPopup: setting src " + source);
    $('#wp-image').css('display','table-cell');
    img.attr('src', source);
}

function toggleSideBarOnLoad() {
  if(jQuery.browser.mobile)
    toggleSideBar();
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

var mutex_loading = { "loading_node" : 0, "loading_way" : 0, "loading_rel" : 0 };

var on_start_loaded = 0;

/*
 *  type: "loading_node" / "loading_way" / "loading_rel"
 *  change: (+)1 or -1
 */
function changeLoadingIndicator(type, change) {

    var loading_indicator = document.getElementById(type);
    mutex_loading[type] = mutex_loading[type] + change;
    if(change == -1) {
        if(mutex_loading[type] == 0) 
          loading_indicator.style.display = "none";
    } else  // +1
        loading_indicator.style.display = "block";
    loading_indicator.title = mutex_loading[type];
}

function secHTML(input) {
    return $("<div>").text( input ).html();
}

function getMainTag(tags) {
    for (var i = 0; i < overpass_config.icon_tags.length; i++) {
      var key = overpass_config.icon_tags[i];
      if(tags[key] && ! ( key == "amenity" && tags[key] == "shop" ) ) {
        return key;
      }
    }
    return "";
}

function chooseIconSrc(tags,iconsize) {
    var icon_tag = getMainTag(tags);

    var icon_url = "";
    if(!icon_tag) {
      icon_url = "assets/transformap/pngs/" + overpass_config.icon_folder + "/" + iconsize + "/unknown.png";
    } else {

      if (tags[icon_tag].indexOf(";") >= 0) // more than one item, take generic icon
        icon_url = "assets/transformap/pngs/" + overpass_config.icon_folder + "/" + iconsize + "/generic.png";
      else
        icon_url = "assets/transformap/pngs/" + overpass_config.icon_folder + "/" + iconsize + "/" + icon_tag + "=" + tags[icon_tag] + ".png";
    }
    return icon_url;
}

var disableLoadPOI = false;
function loadPoi() {
  updateFilterCount(); // here because it is called on every map move
  var notificationbar =  document.getElementById("notificationbar");
  if (map.getZoom() < overpass_config.minzoom ) {
    notificationbar.style.display = "block";
    if(on_start_loaded) {
      var json_date = new Date(pois_lz.osm3s.timestamp_osm_base);
      $('#tall').html("Lowzoom data: " + json_date.toLocaleString());
      $('#tnode').css("display", "hidden");
      $('#tway').css("display", "hidden");
      $('#trel').css("display", "hidden");
      return;
    }

    if(pois_lz) { 
      console.log(pois_lz);
      console.log("adding lz POIs");

      changeLoadingIndicator("loading_node",+1);
      handleNodes(pois_lz); 

      changeLoadingIndicator("loading_way",+1);
      handleWays(pois_lz); 

      changeLoadingIndicator("loading_rel",+1);
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
        console.log("look, we are really in Graz");
      else {
        console.log("1st call, return");
        return;
      }
    }
  }

  var current_zoom = map.getZoom();
  console.log("loadPOI called, z" + current_zoom);
  if(current_zoom > old_zoom && current_zoom != overpass_config.minzoom) {
    console.log("zooming in, POI already loaded, nothing to to");
    old_zoom = current_zoom;
    return;
  }
  old_zoom = current_zoom;

  if(disableLoadPOI)
      return;

  function url_ify(link,linktext) {
    if (/@/.test(link)) {
      return '<a href="mailto:' + link + '">' + secHTML(linktext) + '</a>';
    } else if (/^[0-9-+\s]*$/.test(link)) {
      return '<a href="tel:' + link + '">' + linktext.replace(/\s/g,"&nbsp;") + '</a>'; //FIXME how to prefix fax nrs?
    } else {
      if ( ! /^http/.test(link) ) //http[s] is implicit here
        link = "http://" + link;
      return $("<div>").append( $('<a>').attr('href', link).text(linktext) ).html();
    }

  }

  function fillPopup(tags,type,id,lat,lon) {

    var tags_to_ignore = [ "name" , "ref", "addr:street", "addr:housenumber", "addr:postcode", "addr:city", "addr:suburb", "addr:country","website","url","contact:website","contact:url","email","contact:email","phone","contact:phone","fax","contact:fax","created_by","area","layer","room","indoor","twitter","contact:twitter","link:twitter", "contact:google_plus", "google_plus", "link:google_plus", "contact:facebook","facebook","link:facebook","facebook:page","website:facebook","url:facebook","contact:youtube","youtube","link:youtube","wheelchair","wheelchair:description","wikipedia","wikidata","image" ];

    var r = $('<table>');

    r.append($('<tr>')
            .attr('class','header')
            .append($('<td>').append('<a href="https://www.openstreetmap.org/' + type + "/" + id + '" title="Link to ' + type + ' ' + id + ' on OpenStreetMap" target=_blank><img src="assets/20px-Mf_' + type + '.svg.png" />' + type.substring(0,1) + id + '</a>'))
            .append($('<td>').append('<a href="http://editor.transformap.co/#background=Bing&id=' + type.substring(0,1) + id + '&map=19/' + lon + '/' + lat + '" title="Edit this object with iD for TransforMap" target=_blank>Edit</a>'))
        );
    var wikipedia_link = "";

    function addSocialMediaLinks(tags) {
        var string = "";

        for (key in tags) {
            var value = tags[key].replace(/^http[s]?:\/\//,""); //we add https later, regardless of link
            var valuestring = decodeURIComponent(value); 
            var img = "<img src='assets/";

            if(/twitter/.test(key)) {
                if(! /twitter.com\//.test(value)) valuestring = "twitter.com/" + valuestring;
                img += "twitter.16.png' title='on Twitter' />";
            } else
            if(/facebook/.test(key) || (/facebook.com\/|fb.com\//.test(value) && /website/.test(key)) ) {
                if(! /facebook.com\/|fb.com\//.test(value)) valuestring = "facebook.com/" + valuestring;
                img += "facebook.16.png' title='Facebook-page' />";
            } else
            if(/google_plus/.test(key)) {
                if(! /plus.google.com\//.test(value)) valuestring = "plus.google.com/" + valuestring;
                img += "g+.16.png' title='Google+ page' />";
            } else
            if(/youtube/.test(key)) {
                if(! /youtube.com\//.test(value)) valuestring = "youtube.com/" + valuestring;
                img += "YouTube.16.png' title='YouTube channel' />";
            } else
            if(/^wikipedia/.test(key)) {
                var lang = key.match(/^(?:wikipedia:)([a-z-]{2,7})$/) || ""; // if value starts with e.g. "de:ARTICLE", this works in WP anyway
                if(! /wikipedia\./.test(value)) valuestring = "wikipedia.org/wiki/" + valuestring;
                if(lang) valuestring = lang[1] + "." + valuestring;

                img += "wikipedia.16.png' title='Wikipedia Article' />";
                wikipedia_link = "https://" + valuestring;
            } else
            if(/wikidata/.test(key)) {
                if(! /wikidata.org\//.test(value)) valuestring = "wikidata.org/wiki/" + valuestring;
                img += "wikidata.16.png' title='Wikidata Entry' />";
            } else
                continue;

            valuestring = "https://" + valuestring;

            string += "<a href='" + valuestring + "'>" + img + "</a> ";
        }

        return string;
    }

    var social_media_links = addSocialMediaLinks(tags);

    if(tags["addr:street"] || tags["addr:housenumber"] || tags["addr:postcode"] || tags["addr:city"] || tags["addr:suburb"] || tags["addr:country"]
            || tags["website"] || tags["url"] || tags["contact:website"] || tags["contact:url"] || tags["email"] || tags["contact:email"]
            || tags["phone"] || tags["contact:phone"] || tags["fax"] || tags["contact:fax"] || tags["wheelchair"] || social_media_links) {
        r.append($('<tr>')
                .attr('class','header')
                .append($('<td>').append(
              (tags["addr:street"] ? tags["addr:street"] : "" ) +
              (tags["addr:housenumber"] ? ("&nbsp;" + tags["addr:housenumber"]) : "" ) + 
              ( (tags["addr:housenumber"] || tags["addr:street"]) ? ",<br>" : "" ) +
              (tags["addr:postcode"] ? (tags["addr:postcode"] + " ") : "" ) +
              (tags["addr:city"] ? tags["addr:city"] : "" ) + 
              (tags["addr:suburb"] ? "-" + tags["addr:suburb"] : "") +
              (tags["addr:country"] ? "<br>" + tags["addr:country"] : "") +
              (tags["wheelchair"] ? ("<br><img class='wheelchair " + tags["wheelchair"] + "' src='assets/disability-18.png' title='wheelchair: " + 
                                     ( (tags["wheelchair"] == "yes") ? "100% accessible" :
                                       ( (tags["wheelchair"] == "limited" ) ? "limited (assist needed)" :
                                         ( (tags["wheelchair"] == "no") ? "no" : tags["wheelchair"] ) ) ) +
                                     ( tags["wheelchair:description"] ? ("\n" + secHTML(tags["wheelchair:description"])) : "" )
                                     + "'/>") : "")
              ))
        .append($('<td>').append(
            (tags["website"] ? (url_ify(tags["website"],"website") + "<br>") : "" ) +
            (tags["url"] ? (url_ify(tags["url"],"website") + "<br>") : "" ) +
            (tags["contact:website"] ? (url_ify(tags["contact:website"],"website") + "<br>") : "" ) +
            (tags["contact:url"] ? (url_ify(tags["contact:url"],"website") + "<br>") : "" ) +

            (tags["email"] ? (url_ify(tags["email"],"email") + "<br>") : "" )+
            (tags["contact:email"] ? (url_ify(tags["contact:email"],"email") + "<br>") : "" ) +

            (tags["phone"] ? (url_ify(tags["phone"], "Tel:&nbsp;" + tags["phone"]) + "<br>") : "" ) +
            (tags["contact:phone"] ? (url_ify(tags["contact:phone"], "Tel:&nbsp;" + tags["contact:phone"]) + "<br>") : "" ) + 

            (tags["fax"] ? (url_ify(tags["fax"], "Fax:&nbsp;" + tags["fax"]) + "<br>") : "" ) +
            (tags["contact:fax"] ? (url_ify(tags["contact:fax"], "Fax:&nbsp;" + tags["contact:fax"]) + "<br>") : "" ) +

            social_media_links

          )));
    }
    for (key in tags) {
        if(/^wikipedia/.test(key)) {
            var value = tags[key];
            var wp_articlename = "";
            var lang = key.match(/^(?:wikipedia:)([a-z-]{2,7})$/) || value.match(/^([a-z-]{2,7}):/) || ""; 
            lang = (lang) ? lang[1] : "en";

            if(! /wikipedia\./.test(value))
                wp_articlename = value;
            else {
                wp_articlename = value.replace(/^http[s]?:\/\//,'')
                                      .replace(/^www\./,'')
                                      .replace(/^([a-z-]{2,7})\.wikipedia/,'')
                                      .replace(/^wikipedia\./,'')
                                      .replace(/^[a-z]{2,3}\/wiki\//,'');
            }
            wp_articlename = wp_articlename.replace(/^[a-z-]{2,7}:/,'');
            var article_id = "wpimage_" + wp_articlename; // we must omit LANG here, as we don't have a way to get lang in callback function run on wikipedia's answer FIXME breaks on 2 wp links, when the first one is non-english...

            var req_string = "https://" + lang + ".wikipedia.org/w/api.php?action=query&titles=" + wp_articlename + "&prop=pageimages&format=json&pithumbsize=260";

            $.getJSON(req_string + "&callback=?", function(data) {
                    for(obj_id in data.query.pages) {
                        var item = data.query.pages[obj_id];
 //                       console.log("got answer from wikipedia for " + item.title + ".");
                        if(item.thumbnail) {
                            wikipedia_images["wpimage_" + item.title] = item.thumbnail.source;
                        } else {
                            wikipedia_images["wpimage_" + item.title] = "UNDEF";
                            console.log("no WP image for " + item.title);
                        }
                    }
                    setTimeout(setImageInPopup,100);
            });

            r.append($('<tr>')
                    .attr('class','header')
                    .append("<td colspan=2 id='wp-image'><img id='" +article_id + "' title='" + wp_articlename + "'/><a href='" + wikipedia_link +"'>© Wikipedia</a></td>" )//only one popup shall be open at a time for the id to be unique
                    );

        }
    }
    if(tags['image']) {
        r.append($('<tr>')
                .attr('class','header')
                .append("<td colspan=2 id='image'><img src='" + tags['image'] + "' style='maxwidth:260px;'/></td>" )//only one popup shall be open at a time for the id to be unique
                );
    }



    for (key in tags) {
      var value = tags[key];
      if ( tags_to_ignore.indexOf(key) >= 0) 
        continue;

      if ( key == 'website' || key == 'url' || key == 'contact:website' ||  key == 'contact:url') { 
        var teststr=/^http/; //http[s] is implicit here
        if ( ! teststr.test(value) )
          value = "http://" + value;
          
        var htlink = '<a href="' + value + '">' + value + '</a>';
        r.append($('<tr>').append($('<th>').text(key)).append($('<td>').append(htlink)));
      } else if ( /^wikipedia/.test(key)) { 
        var lang = key.match(/^(?:wikipedia:)([a-z-]{2,7})$/) || ""; // if value starts with e.g. "de:ARTICLE", this works in WP anyway
        var begin = (! /^http/.test(value)) ? "https://" + ((lang) ? (lang[1] + ".") : "") + "wikipedia.org/wiki/" : ""; //http[s] is implicit here

        var htlink = $('<a>').attr('href', begin + value).text(decodeURIComponent(value));
        r.append($('<tr>').addClass('tag').append($('<th>').text(key)).append($('<td>').append(htlink)));
      } else if ( key == 'wikidata' ) { 
        var begin = (! /^http/.test(value)) ? "https://www.wikidata.org/wiki/" : ""; //http[s] is implicit here

        var htlink = $('<a>').attr('href', begin + value).text(decodeURIComponent(value));
        r.append($('<tr>').addClass('tag').append($('<th>').text(key)).append($('<td>').append(htlink)));
      } else if (key == 'contact:email' || key == 'email') {
        if ( ! /^mailto:/.test(value) )
          value = "mailto:" + value;

        var htlink = $('<a>').attr('href', value).text(value);
        r.append($('<tr>').addClass('tag').append($('<th>').text(key)).append($('<td>').append(htlink)));
      } else {
        var key_escaped = secHTML(key);
        var value_escaped = secHTML(value);

        var keytext = key_escaped.replace(/:/g,":<wbr />");
        var valuetext = "<span>=&nbsp;</span>" + value_escaped.replace(/;/g,"; ");

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

        r.append($('<tr>').addClass('tag')
            .append($('<th>').append(keytext))
            .append($('<td>').append(valuetext))
            );
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

    var icon_url = chooseIconSrc(data.tags,overpass_config.icon_size);

    var icon_class = (overpass_config.class_selector_key && data.tags[overpass_config.class_selector_key["key"]]) ? overpass_config.class_selector_key["key"] : "color_undef";

    var needs_icon = L.icon({
      iconUrl: icon_url,
      iconSize: new L.Point(overpass_config.icon_size, overpass_config.icon_size),
      iconAnchor: new L.Point(overpass_config.icon_size / 2, overpass_config.icon_size / 2),
      popupAnchor: new L.Point(0, - overpass_config.icon_size / 2),
      className: "v-" + data.tags[icon_class] + " k-" + icon_class
    });

    var pdata = {
      lat: data.lat,
      lon: data.lon,
      id: data.id,
      type: data.type,
      icon: needs_icon,
      title: data.tags.name,
      popup: fillPopup(data.tags,data.type,data.id,data.lat,data.lon),
      tags: data.tags
    }
    var pmarker = new PruneCluster.Marker(data.lat, data.lon, pdata);

    return pmarker;
  }

  function nodeFunction(data) {
    if (! data.tags)
      return null;

    var is_one_of_queried=0; // for filtering out tagged nodes which are part of ways
    for ( var i = 0; i < overpass_config.q_array.length; i++) {
        var res = overpass_config.q_array[i][0].replace(/["]?/,"").replace(/["].*$/,"");
        if(data.tags[res]) {
            is_one_of_queried=1;
            break;
        }
    }
    if (! data.tags.name && ! is_one_of_queried)
        return;
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
      if (retval) {
        retval.filtered = ! getFilterStatusOnPoi(retval);
        new_markers.push(retval);
      }
    }
    var number = new_markers.length;
    if(number) {
        markers.RegisterMarkers(new_markers);
        markers.ProcessView();
        updateFilterCount(); // TODO it is relatively inefficient to run check all filters every time a single entry is changed - later only the filters affected on change should be counted 
        new_markers = [];
    }

    var json_date = new Date(overpassJSON.osm3s.timestamp_osm_base);
    $('#tnode').css("display", "block");
    $('#tnode').html(json_date.toLocaleString());
    changeLoadingIndicator("loading_node", -1);
    if(! open_popup_on_load.already_shown && open_popup_on_load.type == "node") {
        open_popup_on_load.already_shown = true;
        setTimeout(function () {
              MytogglePopup(open_popup_on_load.type, open_popup_on_load.id);
        },200 );
    }
    console.log("handleNodes (pid " + pid + ") done, " + number + " added.");
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
          if (retval) {
            retval.filtered = ! getFilterStatusOnPoi(retval);
            new_markers.push(retval);
          }
      }
    }

    var number = new_markers.length;
    if(number) {
        markers.RegisterMarkers(new_markers);
        markers.ProcessView();
        updateFilterCount(); // TODO it is relatively inefficient to run check all filters every time a single entry is changed - later only the filters affected on change should be counted 
        new_markers = [];
    }

    var json_date = new Date(overpassJSON.osm3s.timestamp_osm_base);
    $('#tway').css("display", "block");
    $('#tway').html(json_date.toLocaleString());
    changeLoadingIndicator("loading_way", -1);
    if(! open_popup_on_load.already_shown && open_popup_on_load.type == "way") {
        open_popup_on_load.already_shown = true;
        setTimeout(function () {
              MytogglePopup(open_popup_on_load.type, open_popup_on_load.id);
        },200 );
    }
    console.log("handleWays (pid " + pid + ") done, " + number + " added.");
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
      if (retval) {
        retval.filtered = ! getFilterStatusOnPoi(retval);
        new_markers.push(retval);
      }
    }
    
    var number = new_markers.length;
    if(number) {
        markers.RegisterMarkers(new_markers);
        markers.ProcessView();
        updateFilterCount(); // TODO it is relatively inefficient to run check all filters every time a single entry is changed - later only the filters affected on change should be counted 
        new_markers = [];
    }

    var json_date = new Date(overpassJSON.osm3s.timestamp_osm_base);
    $('#trel').css("display", "block");
    $('#trel').html(json_date.toLocaleString());
    changeLoadingIndicator("loading_rel", -1);
    if(! open_popup_on_load.already_shown && open_popup_on_load.type == "relation") {
        open_popup_on_load.already_shown = true;
        setTimeout(function () {
              MytogglePopup(open_popup_on_load.type, open_popup_on_load.id);
        },200 );
    }
    console.log("handleRelations (pid " + pid + ") done, " + number + " added.");
  }

  var query = overpass_query;

  var node_query = overpass_query_nodes;
  var way_query = overpass_query_ways;
  var rel_query = overpass_query_rels;


  var allUrl = query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());

  var node_url = node_query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());
  var way_url = way_query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());
  var rel_url = rel_query.replace(/BBOX/g, map.getBounds().toOverpassBBoxString());

  console.log("loadPOI: before JSON call node: " + node_url);
  changeLoadingIndicator("loading_node", +1);
  $.getJSON(node_url, handleNodes);

  console.log("loadPOI: before JSON call way: " + way_url);
  changeLoadingIndicator("loading_way", +1);
  $.getJSON(way_url, handleWays);

  console.log("loadPOI: before JSON call rel: " + rel_url);
  changeLoadingIndicator("loading_rel", +1);
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
            loadPoi();
        }
    };
  http_request_lz.send(null);
  console.log("XMLHttpRequest for pois_lz sent");
} else {
  console.log("XMLHttpRequest for pois_lz NOT sent, no url");
}

var wikipedia_images = {};

/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

window.onload = function () { 
    var text = 'Warning: You seem to use Internet Explorer, which is known to be buggy. This site may not work as expected. We recommend a standards-compliant free web-browser like <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a> or <a href="http://chromium.woolyss.com/">Chromium</a>.',
        h;
    if(navigator.userAgent.toLowerCase().indexOf('msie') > -1) {
        var h = document.createElement("h1");
        h.setAttribute('style', 'text-align:center;color:red;background:white;position:absolute;top:5px;left:55px;right:55px;z-index:15000;padding:5px;margin:0;');
    } else if (navigator.userAgent.toLowerCase().indexOf('trident') > -1) {
        var h = document.createElement("h3");
        h.setAttribute('style', 'text-align:center;color:red;position:absolute;top:5px;left:55px;right:55px;z-index:15000;padding:5px;margin:0;background-color:rgba(255,255,255,0.7);');
    }
        else return;
    h.innerHTML = text;
    document.getElementById('map').appendChild(h);

    var body = document.getElementsByTagName('body')[0];
    body.setAttribute( 'class', body.getAttribute('class') + ' ie');
}

