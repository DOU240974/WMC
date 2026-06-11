HTML = Hyper Text Markup Language  

The <!DOCTYPE html> declaration defines that this document is an HTML5 document
The <html lang="de"> element is the root element of an HTML page
The <h1>bis <h6> element defines a large heading BSP. <h1>H1 IST DIE GRÖßTE VERSION</h1>  <h6>h6 ist die kleinste version</h6> 
The <p> element defines a paragraph BSP.<p>This is a paragraph.</p>
HTML links are defined with the <a> tag BSP. <a href="https://www.w3schools.com">This is a link</a>
HTML images are defined with the <img> tag. BSP.<img src="w3schools.jpg" alt="W3Schools.com" width="104" height="142">
The <br> tag defines a line break, and is an empty element without a closing tag
<hr> Abstand ensteht

title Attribute Mauszeiger bleibt auf was und es öffnet sich ein fenster mit dem text BSP. <h2 title="I'm a header">The title Attribute</h2>

The <head> element contains meta information about the HTML page
The <title> element specifies a title for the HTML page (which is shown in the browser's title bar or in the page's tab)
The <body> element defines the document's body, and is a container for all the visible contents, such as headings, paragraphs, images, hyperlinks, tables, lists, etc.

he href attribute of <a> specifies the URL of the page the link goes to
The src attribute of <img> specifies the path to the image to be displayed
The width and height attributes of <img> provide size information for images
The alt attribute of <img> provides an alternate text for an image

The lang attribute of the <html> tag declares the language of the Web page
The title attribute defines some extra information about an element

<p>	    Defines a paragraph
<hr>	Defines a thematic change in the content
<br>	Inserts a single line break
<pre>	Defines pre-formatted text
<b> - Bold text
<strong> - Important text
<i> - Italic text
<em> - Emphasized text
<mark> - Marked text
<small> - Smaller text
<del> - Deleted text
<ins> - Inserted text
<sub> - Subscript text
<sup> - Superscript text
<abbr>	Defines an abbreviation or acronym
<address>	Defines contact information for the author/owner of a document
<bdo>	Defines the text direction
<blockquote>	Defines a section that is quoted from another source
<cite>	Defines the title of a work
<q>	Defines a short inline quotation
<!-- Write your comments here -->
Use the <a> element to define a link
Use the href attribute to define the link address
Use the target attribute to define where to open the linked document
Use the <img> element (inside <a>) to use an image as a link
Use the mailto: scheme inside the href attribute to create a link that opens the user's email program



This example shows how to create a link to W3Schools.com:
<a href="https://www.w3schools.com/">Visit W3Schools.com!</a>

<a href="https://www.w3schools.com/" target="_blank">Visit W3Schools!</a>
_self - Default. Opens the document in the same window/tab as it was clicked
_blank - Opens the document in a new window or tab
_parent - Opens the document in the parent frame
_top - Opens the document in the full body of the window

To use an image as a link, just put the <img> tag inside the <a> tag:
<a href="default.asp">
<img src="smiley.gif" alt="HTML tutorial" style="width:42px;height:42px;">
</a>


Use mailto: inside the href attribute to create a link that opens the user's email program (to let them send a new email):
<a href="mailto:someone@example.com">Send email</a>


To use an HTML button as a link, you have to add some JavaScript code.
JavaScript allows you to specify what happens at certain events, such as a click of a button:
<button onclick="document.location='default.asp'">HTML Tutorial</button>


























CSS = Cascading Style Sheets

CSS can be added to HTML documents in 3 ways:

Inline - by using the style attribute inside HTML elements
Internal - by using a <style> element in the <head> section
External - by using a <link> element to link to an external CSS file <link rel="stylesheet" href="styles.css">

This example uses a full URL to link to a style sheet:
<link rel="stylesheet" href="https://www.w3schools.com/html/styles.css">

This example links to a style sheet located in the html folder on the current web site: 
<link rel="stylesheet" href="/html/styles.css">

This example links to a style sheet located in the same folder as the current page:
<link rel="stylesheet" href="styles.css">


The style attribute is used to add styles to an element, such as color, font, size, and more
style Attribute um farbe Schriftart etc zu ändern BSP.<p style="color:red;">This is a red paragraph.</p> style="font-family:verdana;  style="font-size:300%;

Use the style attribute for styling HTML elements
Use background-color for background color
Use color for text colors
Use font-family for text fonts
Use font-size for text sizes
Use text-align for text alignment
Use the HTML style attribute for inline styling
Use the HTML <style> element to define internal CSS
Use the HTML <link> element to refer to an external CSS file
Use the HTML <head> element to store <style> and <link> elements
Use the CSS color property for text colors
Use the CSS font-family property for text fonts
Use the CSS font-size property for text sizes
Use the CSS border property for borders
Use the CSS padding property for space inside the border
Use the CSS margin property for space outside the border

The CSS border property defines a border around an HTML element. 
BSP.
p {
  border: 2px solid powderblue;
}

The CSS padding property defines a padding (space) between the text and the border.
BSP.
p {
  border: 2px solid powderblue;
  padding: 30px;
}

The CSS margin property defines a margin (space) outside the border.
BSP.
p {
  border: 2px solid powderblue;
  margin: 50px;
}