https://codex.wordpress.org/Using_Javascript#JavaScript_in_Posts

every script content must be HTML-Commentet out, for the parser to not add paragraphs:
<script type="text/javascript">
<!--
updatepage();
//-->

and no dual <enter>! -> WP makes <p> </p> out of it...

all loaded scripts must have external URLS beginning with src="//mm.li..."

problems with jquery - not found by our scripts

tiles have strange shadow - explicitely add no-shadow css


some say, wordpress.com doesn't allow JS in HTML section - would make sense
