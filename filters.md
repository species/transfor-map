Filters:
    must be deactivated on default: Button "Enable Filters" - or hidden in sidebar!
        because: at 20 Needs, 20 checked boxes confuse users
    must be taken into account in URL (for sharing)
        display amount of items right of filter! (e.g. you see that you can filter out all 427 trees)
    on EVERY Map provide filters for our 3 categories!
        so you can filter on the organic map to deactivate buying_selling! - then you should see all "alternative" POIs
    each filter needs "disable all"/"enable all" buttons!

how to handle multiple values on filter-key
  show items when at least one filter is checked?
    "bartering" is checked, I want to see all bartering
  how to handle if key is not set anyway?
    -> filter entry "unknown" must be shown for ALL filters

handling of multiple filters
    EACH filter must be checked for an object.
    es reicht nicht, wenn z.b. identity=commons angehakt ist, aber opening_hours=off weggeklickt wurde.
    -> for each filter-group the return-value must be true for an object to be displayed
        -> one FALSE in a main group is enough to hide an object!

        what if tags.identity=commons;permaculture ; filters.identity=[commons=true, permaculture=false] ?
        ->    at least one must be checked in subgroup, don`t hide if one is disabled

    object.display = [ [ g1subf1 || g1ubf2 || ... || g1subfn ] && [ g2subf1 || g2subf2 || ... || g2subfn ] ]


  if I check "organic" as main group, how to handle items which have no tag set?
    - as if organic=no?
    - display anyway
    - hide anyway?
    - > add for each filter an item "unknown" -> will be best case!
        how to handle at provides and interaction?
            unknown should only match if it does NOT match any in the whitelist!

for filtering, use https://github.com/SINTEF-9012/PruneCluster -OK
        -> replacement for markercluster

DONE:
    * show Nr. of POIs for each filter
        * show only items currently in field of view -OK
        * update on  map.on('moveend' map.on('viewreset' -OK -> loadPOI
    * value regex checks -> ok replaced with split ";\s"
        special chars : +.\(){}[]^$?| (? (?! (!=

TODO: 
    * all filter function in own JS file, map.js gets too long
    * close all open cluster spiders on running the filters!
    * enable/disable all buttons
    * show in overview if somewhere a filter is enabled
    * href links to filters enabled/disabled


Interaction
    wo die CSAs hintun?

sidebar: 3 sub-categories:
    needs (topic???)
    identity
    interaction

    more:
        organic (show only organic)
            with sub-filter (only/limited)
                criteria
                    organic = only 
                    organic = yes
                    organic = limited
                    organic = no (default disabled)
                        + defaults!
                + filter labels
        fee
        second_hand (ev. via interaction=rebuying_reselling)?

        wheelchair
            yes limited no
        regional
        opening hours ("binary" filter independent from all others)
        diet: (show only vegan=only)

    special map:
        e.g. on "green" map,
            playgrounds
            parks
            trees (← canditate for filtering out)

filter:
    by changing OP queries?
    simply css hiding will not do -> clustering!
        -> what to do with hidden POIs? -> solved with PruneCluster attribute "filtered"

word "filter" means: filter out all other - keep one
    

ablauf, wann filter anwenden
    bei filterchange -OK
    bei laden von neuen POIs -OK

reihenfolge der Filter
    knock-out sind binary filter, wie
        opening hours
        diet
        regional
    -> es gibt keine "binary" filter, da der wert auch ungesetzt sein kann -> ~"ternary"?

    
    
wie entscheiden, ob ein punkt angezeigt wird
    -zuerst die knockout-filter, da nur anzeigen wenn tag gesetzt ist
    -dann die "soft"-filter, nur anzeigen wo häckchen gesetzt ... -_-
        
wir brauche

in der var filters sind für jeden filter die funktionen, die das filtern übernehmen...
    filterfunktionen bekommen ein osm-object und geben true/false zurück
