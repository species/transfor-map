transfor-map
============

Demo Maps for Transformap Project

Maps can currently seen at http://demo.transformap.co

More information about this project: http://transformap.co


# updating Low-Zoom POIs

only POIs below z12 are loaded on demand, for z0-11 a static .json file is used.

you can update them it via:

for "identities" map:
wget 'http://overpass-api.de/api/interpreter?data=[out:json][timeout:1800];node["identity"];out;(way["identity"];node(w));out;rel["identity"];out;>;out;' -O identities.json

for "needs-based" map:
wget "http://overpass-api.de/api/interpreter?data=[out:json][timeout:1800];node[topic];out;(way[topic];node(w));out;rel[topic];out;>;out;node[provides];out;(way[provides];node(w));out;rel[provides];out;>;out;" -O all.json

for the "needs, you have to delete non-transformap entries (some others are using the "topic" key too) manually!
* a "tourism": "museum", node 1079379628
* some "information": "board", node 2801318634, 3444526068
* a "amenity": "theatre", node 1934396798

# deploying

"master" is the current stable branch deployed on demo.transformap.co

for developing create a new branch, e.g. "feature_xy"

to deploy on demo.transformap.co:

* git checkout feature_xy
* *editeditedit*, test & commit
* git checkout master
* git merge feature_xy
* get an account at the ecobytes infrastructure, contact @almereyda
* git remote add update dokku@apps.ecobytes.net:transformap_demo (only needs to be done once)
* git push update master

## how-to for merging changes from one map.html to others

e.g.

* gd ff7b7033db6e2b8ff2ec2ba3127e1f38c7fe6ccd regional.html > EditInOSM.patch
* patch filetopath.html EditInOSM.patch
