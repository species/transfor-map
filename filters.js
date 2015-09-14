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
    },
    diet : {  label : "Veggie Diet",
                    displayed : false,
                    function_name : function filter_diet(osm_object){
                         if(!osm_object['tags']) {
                             console.log("error in filters.diet: no tags attached!");
                             return false;
                         }
                         
                         var crits = filters.diet.sub_criteria;
                         //vegan - false can mean vegan=no or vegan=unknown
                         var current_key = "diet:vegan";
                         var vegan = (osm_object.tags.hasOwnProperty(current_key) &&
                                          osm_object.tags[current_key].match(/^only$|^yes$|^limited$/)) ||
                                 (osm_object.tags.hasOwnProperty("cuisine") && osm_object.tags["cuisine"] == "vegan");

                         if(crits.vegan.state == true) {
                             if(vegan)
                                 return true;
                         }

                         //vegetarian - false can mean vegetarian=no or vegetarian=unknown
                         current_key = "diet:vegetarian";
                         var vegetarian = vegan ||
                                 (osm_object.tags.hasOwnProperty(current_key) && 
                                       osm_object.tags[current_key].match(/^only$|^yes$|^limited$/)) ||
                                 (osm_object.tags.hasOwnProperty("cuisine") &&
                                       osm_object.tags["cuisine"] == "vegetarian");

                         if(crits.vegetarian.state == true) {
                             if(vegetarian)
                                 return true;
                         }

                         // no -has diet:vegetarian=no and not cuisine=veggie
                         // or diet:pescetarian=only or meat shop
                         var nonveg_only = (osm_object.tags.hasOwnProperty("diet:pescetarian") &&
                                  osm_object.tags["diet:pescetarian"] == "only") ||
                             (osm_object.tags.hasOwnProperty("shop") &&
                                   osm_object.tags["shop"].match(/butcher|seafood|fishmonger/));
                         if(crits.noveg.state == true ) {
                             if(!vegan && !vegetarian) { //!cuisine=veggie
                                 if(osm_object.tags.hasOwnProperty("diet:vegetarian") &&
                                           osm_object.tags["diet:vegetarian"] == "no")
                                     return true;
                                 if(nonveg_only)
                                     return true;

                             }
                         }

                         //unknown
                         if(crits.unknown.state == true) {
                             if(!vegan && !vegetarian) { //includes cuisine=veggie
                                 if(! osm_object.tags.hasOwnProperty("diet:vegetarian") &&
                                         ! osm_object.tags.hasOwnProperty("diet:vegan") &&
                                         ! nonveg_only )
                                     return true;
                             }
                         }

                         return false;
                    },
                    sub_criteria : {
                        vegan : {
                             key : "diet:vegan",
                             value : "yes|only|limited",
                             label : "Vegan",
                             default_state : "enabled",
                             state : true,
                             function_name : function filter_diet_vegan(osm_object) {
                                 if(!osm_object['tags']) {
                                     console.log("error in filters.diet.vegan: no tags attached!");
                                     return false;
                                 }
                                 var vegan = (osm_object.tags.hasOwnProperty("diet:vegan") &&
                                                  osm_object.tags["diet:vegan"].match(/^only$|^yes$|^limited$/)) ||
                                         (osm_object.tags.hasOwnProperty("cuisine") && osm_object.tags["cuisine"] == "vegan");

                                 return vegan;
                             }

                        },
                        vegetarian : {
                             key : "diet:vegetarian",
                             value : "yes",
                             label : "Vegetarian",
                             default_state : "enabled",
                             state : true,
                             function_name : function filter_diet_vegetarian(osm_object) {
                                 if(!osm_object['tags']) {
                                     console.log("error in filters.diet.vegetarian: no tags attached!");
                                     return false;
                                 }
                                 var vegan = (osm_object.tags.hasOwnProperty("diet:vegan") &&
                                                  osm_object.tags["diet:vegan"].match(/^only$|^yes$|^limited$/)) ||
                                         (osm_object.tags.hasOwnProperty("cuisine") && osm_object.tags["cuisine"] == "vegan");

                                 current_key = "diet:vegetarian";
                                 var vegetarian = vegan ||
                                         (osm_object.tags.hasOwnProperty(current_key) && 
                                               osm_object.tags[current_key].match(/^only$|^yes$|^limited$/)) ||
                                         (osm_object.tags.hasOwnProperty("cuisine") &&
                                               osm_object.tags["cuisine"] == "vegetarian");

                                 return vegetarian;
                             }
                        },
                        noveg : {
                             key : "diet:*",
                             value : "no",
                             label : "Non-Vegetarian",
                             default_state : "enabled",
                             state : true,
                             function_name : function filter_diet_noveg(osm_object) {
                                 if(!osm_object['tags']) {
                                     console.log("error in filters.diet.noveg: no tags attached!");
                                     return false;
                                 }
                                 var crits = filters.diet.sub_criteria;
                                 //vegan - false can mean vegan=no or vegan=unknown
                                 var current_key = "diet:vegan";
                                 var vegan = (osm_object.tags.hasOwnProperty(current_key) &&
                                                  osm_object.tags[current_key].match(/^only$|^yes$|^limited$/)) ||
                                         (osm_object.tags.hasOwnProperty("cuisine") && osm_object.tags["cuisine"] == "vegan");

                                 //vegetarian - false can mean vegetarian=no or vegetarian=unknown
                                 current_key = "diet:vegetarian";
                                 var vegetarian = vegan ||
                                         (osm_object.tags.hasOwnProperty(current_key) && 
                                               osm_object.tags[current_key].match(/^only$|^yes$|^limited$/)) ||
                                         (osm_object.tags.hasOwnProperty("cuisine") &&
                                               osm_object.tags["cuisine"] == "vegetarian");

                                 // no -has diet:vegetarian=no and not cuisine=veggie
                                 // or diet:pescetarian=only or meat shop
                                 var nonveg_only = (osm_object.tags.hasOwnProperty("diet:pescetarian") &&
                                          osm_object.tags["diet:pescetarian"] == "only") ||
                                     (osm_object.tags.hasOwnProperty("shop") &&
                                           osm_object.tags["shop"].match(/butcher|seafood/));
                                 if(crits.noveg.state == true ) {
                                     if(!vegan && !vegetarian) { //!cuisine=veggie
                                         if(osm_object.tags.hasOwnProperty("diet:vegetarian") &&
                                                   osm_object.tags["diet:vegetarian"] == "no")
                                             return true;
                                         if(nonveg_only)
                                             return true;

                                     }
                                 }
                                 return false;
                             }
                        },
                        unknown : {
                            key : "diet:*",
                             value : null,
                             label : "Unknown",
                             default_state : "enabled",
                             state : true,
                             function_name : function filter_diet_unknown(osm_object) {
                                 if(!osm_object['tags']) {
                                     console.log("error in filters.diet.noveg: no tags attached!");
                                     return false;
                                 }
                             }
                        }
                    }
    }
}

//returns if a single sub-filter matches on an osm-object (used e.g. for counting)
function filterMatches(object_tags, filter) {
    if(filter.hasOwnProperty("function_name")) {
        var osm_object = { tags : object_tags };
        return filter.function_name(osm_object);
    }

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

// whitelists are used, if some POIs imply a value, e.g. amenity=restaurant implies provides=food
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

function updateFilterCount(force) {
    if(!force && open_sidebox != "sidebox-filters") //run only when menu open
        return;

    //at first, reset all counts
    for(filtername in filters) {
        for(itemname in filters[filtername].sub_criteria) {
            var id = createValidDOMid('filter_'+filtername+'_'+itemname+'_counter');
            document.getElementById(id).innerHTML = "-";
            document.getElementById(id).style.color="#ADADAD";
        }
    }

    //list of visible markers needed because we need to know their amount
    var visible_markers = getVisibleMarkers();

    for(var i = 0; i < visible_markers.length; i++) {
        var marker = visible_markers[i];
        var marker_id = marker.data.type + marker.data.id;
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
    }
}

function toggleAllFiltersInGroup(filtername) {
    var old_state = getFilterGroupState(filtername);
    var new_state = (old_state == "disabled") ? true : false; // if mixed or enabled, disable all

    var filter = filters[filtername];
    if(filter["sub_criteria"]) {
        for(itemname in filter.sub_criteria) {
            var item = filter.sub_criteria[itemname];
            item.state = new_state;
        }
        var parent_element = document.getElementById("subfilter_" + filtername);
        for(var i=1; i < parent_element.children.length; i++) { //i=1 because first is "toggle all"
            var div_node = parent_element.children[i].firstChild;
            div_node.className = (new_state) ? "enabled" : "disabled";
        }
    }
    else
        console.log("error in toggleAllFiltersInGroup('"+filtername+"'): no subcriterias");
}

function getFilterGroupState(filtername) {
    var all_enabled = false;
    var all_disabled = false;

    var filter = filters[filtername];
    if(filter["sub_criteria"]) {
        for(itemname in filter.sub_criteria) {
            var item = filter.sub_criteria[itemname];
            if(item.state) {
                if(all_enabled)
                    continue;
                //else
                if(!all_disabled) { //begin state
                    all_enabled = true;
                    continue;
                } // item enabled, until now all disabled → mixed
                return "mixed";
            } else { //item disabled
                if(all_enabled)
                    return "mixed";
                if(all_disabled)
                    continue;
                all_disabled = true;
            }
        }
        if(all_disabled)
            return "disabled";
        if(all_enabled)
            return "enabled";
        console.log("error in getFilterGroupState('"+filtername+"'): no end state reached");
    }
    console.log("error in getFilterGroupState('"+filtername+"'): no subcriterias");
}

/* precondition: in global var filters, an object $filtername must exist.
 *  returns a piece of HTML which can be added to filters sidebar 
 */
function createFilterHTML(filtername) {
  var filter = filters[filtername];
  var sub_filters = null;
  if(filter["sub_criteria"]) {
      sub_filters = $('<ul>')
          .attr('class', "subfilter")
          .attr('id',"subfilter_" + filtername);
      var all_state = getFilterGroupState(filtername); // enabled, disabled, mixed
      sub_filters.append( '<li class="allswitch"><div class='+ all_state +' '
              + 'onClick="toggleAllFiltersInGroup(\''+filtername+'\'); runFiltersOnAll(); this.className = getFilterGroupState(\''+filtername+'\');" '
              + 'title="check/uncheck all entries in this group">'
              + 'Toggle all'
              + '</div>'
              +'</li>');

      for(itemname in filter.sub_criteria) {
          var item = filter.sub_criteria[itemname];
          var statevarname = 'filters.'+filtername+'.sub_criteria[\''+itemname+'\'].state'; //filters.provides.sub_criteria['food+drink'].state
          var title = "“" + item.key + "” = “" + item.value + "”";
          sub_filters.append('<li><div class='+item.default_state+' '
           + 'onClick="'+statevarname+' = ! '+statevarname
               +'; runFiltersOnAll();'
               +'this.className = ('+statevarname+') ? \'enabled\' : \'disabled\';'
               +'document.getElementById(\'subfilter_' + filtername + '\').firstChild.firstChild.className = getFilterGroupState(\''+filtername+'\');"'
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
        .append( '<h3 onClick="this.parentNode.className = (this.parentNode.className == \'shown\') ? \'hidden\' : \'shown\' ;">' + filter.label + '</h3>' )
        .append( sub_filters );
}


// create filters out of taxonomy
function createFiltersOfTaxonomy() {
    var filter_names = [ "identity","interaction","provides" ]; //must be in reverse order to be shown correct!
    var filter_functions = { "provides" : filterFunctionNeeds, "identity" : filterFunctionIdentity, "interaction" : filterFunctionInteraction };
    for(var i=0; i < filter_names.length; i++) {
      var filter_name = filter_names[i];
      var taxonomy_block = taxonomy[filter_name];
      if (!taxonomy_block) {
          console.log("filters: no entry in taxonomy for " + filter_name);
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
