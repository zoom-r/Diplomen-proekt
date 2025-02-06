function includeEssentialHtmlScripts() {
    let script = '';
    script += include('public/js/bs-init.js');
    script += include('public/js/nav.js');
    return script;
}
function includeEssentialHtmlStyles() {
    let style = '';
    style += include('public/css/Navbar-With-Button-icons.css');
    return style;
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}