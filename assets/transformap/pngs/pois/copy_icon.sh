#!/bin/bash

# written by Michael Maier (s.8472@aon.at)
# 
# 31.05.2015   - intial release
#

# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# version 2 as published by the Free Software Foundation.

###
### Standard help text
###

if [ ! "$1" ] || [ "$1" = "-h" ] || [ "$1" = " -help" ] || [ "$1" = "--help" ]
then 
cat <<EOH
Usage: $0 [OPTIONS] 

$0 is a program to copy an icon from greenmap path to transformap path

\$1: from name (without .png)
\$2: to name   (without .png)

OPTIONS:
   -h -help --help     this help text

EOH
fi

###
### variables
###

from_name="$1"
to_name="$2"

###
### working part
###

cp ../../../greenmap/png/$from_name.png $to_name.png
cp ../../../greenmap/png/16/$from_name.png 16/$to_name.png
cp ../../../greenmap/png/24/$from_name.png 24/$to_name.png
cp ../../../greenmap/png/48/$from_name.png 48/$to_name.png
