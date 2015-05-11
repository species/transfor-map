transfor-map
============

Demo Maps for Transformap Project

Maps can currently seen at http://demo.transformap.co

More information about this project: http://transformap.co


# updating Low-Zoom POIs

only POIs below z12 are loaded on demand, for z0-11 a static .json file is used.

you can update them it via:

for "identities" map:
wget 'http://overpass-api.de/api/interpreter?data=[out:json][timeout:1800];node["identity"];out;(way["identity"];node(w));out;rel["identity"];out;>;out;' -O identity.json

for "needs-based" map:
wget "http://overpass-api.de/api/interpreter?data=[out:json][timeout:1800];node[topic];out;(way[topic];node(w));out;rel[topic];out;node[provides];out;(way[provides];node(w));out;rel[provides];out;" -O all.json

for the "needs, you have to delete non-transformap entries (some others are using the "topic" key too) manually!
    a "tourism": "museum", node 1079379628
    some "information": "board", node 2801318634, 3444526068
    a "amenity": "theatre", node 1934396798


